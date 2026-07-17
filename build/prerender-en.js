// Pre-renders the English pages into en/ so crawlers get real English HTML
// at the /en/* URLs instead of the French markup translated client-side.
// The output is committed; `npm test` fails when it drifts from the sources
// (this script re-runs in --check mode).
//
// Usage:
//   node build/prerender-en.js          # (re)generate en/
//   node build/prerender-en.js --check  # fail if en/ is stale
//
// What it does per page:
//   - applies the data-i18n* transforms from scripts/i18n.js with lang=en
//   - sets <html lang="en">, canonical/og:url to the /en/ URL, swaps og:locale
//   - syncs og:/twitter: title + description from the translated <title>/<meta>
//   - on article pages, injects the English title, excerpt and full body from
//     scripts/articles-data.js (the FR pages render those client-side)
// Asset paths need no rewriting: pages use relative URLs, and the
// vercel.json rewrite /en/:path* -> /:path* keeps serving shared assets.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'en');
const CHECK_MODE = process.argv.includes('--check');

// Pages worth an English copy: everything indexable. Excluded on purpose:
// 404.html (Vercel only serves the root one), experiments-template.html
// (legacy redirect stub).
const PAGES = [
    'index.html',
    'outils.html',
    'experiments.html',
    'brand-guidelines.html',
    ...fs.readdirSync(path.join(ROOT, 'tools')).filter((f) => f.endsWith('.html')).map((f) => 'tools/' + f),
    ...fs.readdirSync(path.join(ROOT, 'experiments')).filter((f) => f.endsWith('.html')).map((f) => 'experiments/' + f)
];

// Load the runtime dictionaries by evaluating the browser scripts in a bare
// jsdom window — single source of truth, no duplicated translations here.
function loadSiteData() {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://gumi.ch/',
        runScripts: 'outside-only'
    });
    dom.window.eval(fs.readFileSync(path.join(ROOT, 'scripts', 'i18n.js'), 'utf8'));
    dom.window.eval(fs.readFileSync(path.join(ROOT, 'scripts', 'articles-data.js'), 'utf8'));
    const dict = dom.window.GumiI18n.dict;
    const articles = dom.window.GUMI_ARTICLES;
    dom.window.close();
    return { dict, articles };
}

function enPath(pathname) {
    return '/en' + (pathname === '/' ? '/' : pathname);
}

// Same attribute conventions as apply() in scripts/i18n.js.
function applyDict(document, dict) {
    const swaps = [
        ['data-i18n', (el, text) => { el.textContent = text; }],
        ['data-i18n-html', (el, text) => { el.innerHTML = text; }],
        ['data-i18n-content', (el, text) => el.setAttribute('content', text)],
        ['data-i18n-placeholder', (el, text) => el.setAttribute('placeholder', text)],
        ['data-i18n-title', (el, text) => el.setAttribute('title', text)],
        ['data-i18n-aria', (el, text) => el.setAttribute('aria-label', text)]
    ];
    for (const [attr, set] of swaps) {
        document.querySelectorAll('[' + attr + ']').forEach((el) => {
            const entry = dict[el.getAttribute(attr)];
            if (entry && entry.en) set(el, entry.en);
        });
    }
}

// English article pages get their content statically; article-page.js
// re-renders the same thing at runtime (language toggle keeps working).
function applyArticle(document, source, articles) {
    const slugMatch = source.match(/window\.GUMI_ARTICLE_SLUG\s*=\s*'([^']+)'/);
    const article = slugMatch && articles[slugMatch[1]];
    if (!article) return;

    document.title = article.title.en + ' | Gumi.';
    const desc = document.querySelector('meta[name="description"]');
    if (desc && article.excerpt) desc.setAttribute('content', article.excerpt.en);

    const titleEl = document.getElementById('article-title');
    if (titleEl) {
        titleEl.textContent = article.title.en;
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.textContent = '.';
        titleEl.appendChild(dot);
    }

    const postContent = document.getElementById('post-content');
    if (postContent && article.html) postContent.innerHTML = article.html.en;

    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        try {
            const data = JSON.parse(script.textContent);
            if (data['@type'] === 'BlogPosting') {
                data.headline = article.title.en;
                data.description = article.excerpt ? article.excerpt.en : data.description;
                if (data.url) data.url = new URL(data.url).origin + enPath(new URL(data.url).pathname);
                script.textContent = '\n' + JSON.stringify(data, null, 4) + '\n    ';
            }
        } catch (err) {
            // Malformed JSON-LD: leave it as-is, the FR page has the same issue.
        }
    });
}

function transform(source, dict, articles) {
    const dom = new JSDOM(source);
    const document = dom.window.document;

    document.documentElement.lang = 'en';
    applyDict(document, dict);
    applyArticle(document, source, articles);

    // Canonical + og:url point at the /en/ URL; hreflang pairs already list
    // both languages in the source markup.
    for (const selector of ['link[rel="canonical"]', 'meta[property="og:url"]']) {
        const el = document.querySelector(selector);
        if (!el) continue;
        const attr = el.tagName === 'LINK' ? 'href' : 'content';
        const url = new URL(el.getAttribute(attr));
        url.pathname = enPath(url.pathname);
        el.setAttribute(attr, url.href);
    }

    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.setAttribute('content', 'en_US');
    const localeAlt = document.querySelector('meta[property="og:locale:alternate"]');
    if (localeAlt) localeAlt.setAttribute('content', 'fr_FR');

    // Social cards reuse the translated document title + description.
    const title = document.title;
    const desc = document.querySelector('meta[name="description"]');
    const sync = [
        ['meta[property="og:title"]', title],
        ['meta[name="twitter:title"]', title],
        ['meta[property="og:description"]', desc && desc.getAttribute('content')],
        ['meta[name="twitter:description"]', desc && desc.getAttribute('content')]
    ];
    for (const [selector, value] of sync) {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute('content', value);
    }

    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        script.textContent = script.textContent.replace(/"inLanguage":(\s*)"fr"/, '"inLanguage":$1"en"');
    });

    return dom.serialize().replace(
        '<!DOCTYPE html>',
        '<!DOCTYPE html><!-- Generated by build/prerender-en.js — edit the French source page instead. -->'
    );
}

function main() {
    const { dict, articles } = loadSiteData();

    const generated = new Map();
    for (const page of PAGES) {
        const source = fs.readFileSync(path.join(ROOT, page), 'utf8');
        generated.set(page, transform(source, dict, articles));
    }

    // Existing .html files under en/ that no longer have a source page.
    const orphans = [];
    if (fs.existsSync(OUT_DIR)) {
        const walk = (dir) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (entry.name.endsWith('.html')) {
                    const rel = path.relative(OUT_DIR, full).split(path.sep).join('/');
                    if (!generated.has(rel)) orphans.push(rel);
                }
            }
        };
        walk(OUT_DIR);
    }

    if (CHECK_MODE) {
        // Newline-insensitive compare: git autocrlf may have given the
        // checked-out files CRLF endings while the generator emits LF.
        const normalize = (text) => text.replace(/\r\n/g, '\n');
        const stale = [];
        for (const [page, html] of generated) {
            const outFile = path.join(OUT_DIR, page);
            if (!fs.existsSync(outFile) || normalize(fs.readFileSync(outFile, 'utf8')) !== normalize(html)) stale.push('en/' + page);
        }
        stale.push(...orphans.map((rel) => 'en/' + rel + ' (orphan)'));
        if (stale.length) {
            console.error('English pages are out of date — run `npm run build:en` and commit:\n  ' + stale.join('\n  '));
            process.exit(1);
        }
        console.log('en/ is up to date (' + generated.size + ' pages).');
        return;
    }

    for (const [page, html] of generated) {
        const outFile = path.join(OUT_DIR, page);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, html);
    }
    for (const rel of orphans) fs.unlinkSync(path.join(OUT_DIR, rel));
    console.log('Generated ' + generated.size + ' English pages into en/' + (orphans.length ? ', removed ' + orphans.length + ' orphan(s)' : '') + '.');
}

main();
