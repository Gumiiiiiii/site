// Pre-renders the FRENCH article bodies into experiments/*.html.
//
// Why: the article shells shipped with an empty <article id="post-content">,
// filled client-side by scripts/article-page.js. Crawlers that do not execute
// JavaScript therefore saw a title, a cover and nothing else. Googlebot runs
// JS on a deferred second pass with no guarantee, Bing is less reliable, and
// the crawlers behind conversational search engines do not run it at all.
// The English pages never had the problem: build/prerender-en.js already
// injects article.html.en into en/experiments/*.html. This does the same for
// the French sources.
//
// Unusual bit: the source file IS the output. Only the regions listed below
// are generated, everything else in experiments/*.html stays hand-authored.
// The transform is idempotent (each region is overwritten wholesale from
// scripts/articles-data.js), so re-running never accumulates.
//
// Generated regions: #post-content, #article-date, #article-cover,
// the read-next card, and <meta name="description">.
//
// Usage:
//   node build/prerender-articles.js          # (re)inject
//   node build/prerender-articles.js --check  # fail if stale
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'experiments');
const CHECK_MODE = process.argv.includes('--check');

function loadArticles() {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: 'outside-only' });
    dom.window.eval(fs.readFileSync(path.join(ROOT, 'scripts', 'articles-data.js'), 'utf8'));
    const articles = dom.window.GUMI_ARTICLES;
    dom.window.close();
    return articles;
}

function frenchDate(iso) {
    const d = new Date(iso + 'T00:00:00Z');
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return 'Publié le ' + d.getUTCDate() + ' ' + months[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

function transform(source, articles) {
    const slugMatch = source.match(/window\.GUMI_ARTICLE_SLUG\s*=\s*'([^']+)'/);
    const slug = slugMatch && slugMatch[1];
    const article = slug && articles[slug];
    if (!article) return null;

    const dom = new JSDOM(source);
    const document = dom.window.document;

    const abstract = document.getElementById('article-abstract');
    if (abstract) abstract.innerHTML = (article.abstract && article.abstract.fr) || '';

    const postContent = document.getElementById('post-content');
    if (postContent && article.html && article.html.fr) {
        postContent.innerHTML = article.html.fr;

        // Mirror article-page.js: wide tables scroll inside their own box, so
        // the pre-hydration render does not overflow on small screens.
        postContent.querySelectorAll('table').forEach((table) => {
            if (table.parentNode && table.parentNode.classList.contains('table-scroll')) return;
            const wrap = document.createElement('div');
            wrap.className = 'table-scroll';
            table.parentNode.insertBefore(wrap, table);
            wrap.appendChild(table);
        });

        // Same heading ids the runtime table of contents assigns, so in-page
        // anchors resolve before the script runs.
        postContent.querySelectorAll('h2, h3').forEach((h, i) => h.setAttribute('id', 'heading-' + i));
    }

    // Title and description live in five places on these shells. Syncing only
    // meta[name=description] let og:, twitter: and the JSON-LD drift, which is
    // how a rewritten excerpt kept being served in the share preview.
    if (article.excerpt && article.excerpt.fr) {
        for (const sel of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
            const el = document.querySelector(sel);
            if (el) el.setAttribute('content', article.excerpt.fr);
        }
    }
    for (const sel of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
        const el = document.querySelector(sel);
        if (el) el.setAttribute('content', article.title.fr);
    }

    // Six places, in fact: the <h1> is the sixth, and it was the one left out.
    // article-page.js rewrites it from the data at runtime, so the page looked
    // right in a browser while the served HTML kept whatever title the shell
    // was born with — exactly the drift this block exists to prevent, and the
    // version a crawler reads first. The trailing dot belongs to the markup,
    // not to the title, so it is put back after the text.
    const titleEl = document.getElementById('article-title');
    if (titleEl) {
        titleEl.textContent = article.title.fr;
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.textContent = '.';
        titleEl.appendChild(dot);
    }
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        try {
            const json = JSON.parse(script.textContent);
            if (json['@type'] !== 'BlogPosting') return;
            json.headline = article.title.fr;
            if (article.excerpt && article.excerpt.fr) json.description = article.excerpt.fr;
            script.textContent = '\n' + JSON.stringify(json, null, 4) + '\n    ';
        } catch (err) {
            // Malformed JSON-LD: leave it alone rather than corrupt it.
        }
    });

    const dateEl = document.getElementById('article-date');
    if (dateEl && article.published) dateEl.textContent = frenchDate(article.published);

    const cover = document.getElementById('article-cover');
    if (cover && article.cover) {
        cover.setAttribute('src', article.cover);
        cover.setAttribute('alt', article.coverAlt || article.title.fr);
    }

    // The read-next card is a real internal link once it is in the markup,
    // which is how the three studies link to each other for crawlers.
    const next = articles[article.readNext];
    const link = document.getElementById('read-next-link');
    if (next && link) {
        link.setAttribute('href', article.readNext);
        const img = document.getElementById('read-next-image');
        if (img) {
            img.setAttribute('src', next.cover);
            img.setAttribute('alt', next.coverAlt || next.title.fr);
        }
        const t = document.getElementById('read-next-title-text');
        if (t) t.textContent = next.title.fr;
        const d = document.getElementById('read-next-desc');
        if (d) d.textContent = next.excerpt.fr;
    }

    return dom.serialize();
}

function main() {
    const articles = loadArticles();
    const pages = fs.readdirSync(DIR).filter((f) => f.endsWith('.html'));

    const generated = new Map();
    for (const page of pages) {
        const file = path.join(DIR, page);
        const out = transform(fs.readFileSync(file, 'utf8'), articles);
        if (out) generated.set(page, out);
    }

    if (CHECK_MODE) {
        const normalize = (t) => t.replace(/\r\n/g, '\n');
        const stale = [];
        for (const [page, html] of generated) {
            const current = fs.readFileSync(path.join(DIR, page), 'utf8');
            if (normalize(current) !== normalize(html)) stale.push('experiments/' + page);
        }
        if (stale.length) {
            console.error('French article bodies are out of date — run `npm run build:articles` and commit:\n  ' + stale.join('\n  '));
            process.exit(1);
        }
        console.log('experiments/ bodies are up to date (' + generated.size + ' pages).');
        return;
    }

    for (const [page, html] of generated) fs.writeFileSync(path.join(DIR, page), html);
    console.log('Injected ' + generated.size + ' French article bodies into experiments/.');
}

main();
