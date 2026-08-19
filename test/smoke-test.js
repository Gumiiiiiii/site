// Smoke test: loads every page in jsdom against the local dev server and
// fails on script errors or missing critical content.
// Usage: npm test
const { fork } = require('child_process');
const path = require('path');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');

const PORT = 4599;
const BASE = 'http://localhost:' + PORT;
const ROOT = path.join(__dirname, '..');

// Serve local assets only; CDN scripts (pdf.js, ffmpeg, ...) are stubbed empty.
// Every tool script guards its CDN globals, so pages must still load cleanly.
class LocalOnlyLoader extends ResourceLoader {
    fetch(url, options) {
        if (url.startsWith(BASE)) return super.fetch(url, options);
        return Promise.resolve(Buffer.from(''));
    }
}

function loadPage(url) {
    const pageErrors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (err) => {
        const text = String(err.stack || err.message);
        // Vendored third-party libs need browser APIs jsdom lacks; not our code.
        if (text.includes('/scripts/vendor/')) return;
        if (text.includes('lenis.min.js')) return;
        // Vercel analytics scripts only exist on the production platform.
        if (text.includes('/_vercel/')) return;
        // jsdom can't navigate; hitting this means a redirect actually fired.
        if (text.includes('Not implemented: navigation')) return;
        pageErrors.push(err.message + (err.detail ? ' — ' + err.detail : ''));
    });

    return JSDOM.fromURL(url, {
        runScripts: 'dangerously',
        resources: new LocalOnlyLoader(),
        virtualConsole,
        pretendToBeVisual: true,
        beforeParse(window) {
            if (!window.matchMedia) {
                window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
            }
            window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
            window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
            window.scrollTo = () => {};
        }
    }).then((dom) => new Promise((resolve) => {
        // Give DOMContentLoaded handlers a beat to run.
        setTimeout(() => resolve({ dom, pageErrors }), 800);
    }));
}

const CHECKS = [
    { path: '/', assert(d) {
        if (!d.title.includes('Gumi')) return 'bad title: ' + d.title;
        if (d.querySelectorAll('.navbar a').length < 3) return 'navbar not injected';
        if (d.querySelectorAll('.experiences-right .card').length !== 3) return 'expected 3 experiment cards';
        if (!d.querySelector('.footer-byline')) return 'missing footer byline';
        // The CV landing stays hidden: no public page may link to it.
        if (d.querySelector('a[href="/cv"], a[href="cv"], a[href*="pierre.gumi.ch"]')) return 'CV page must not be linked from the homepage';
    } },
    { path: '/experiments', assert(d) {
        if (d.querySelectorAll('.experiments-grid .card').length !== 3) return 'expected 3 cards';
        if (!d.querySelector('a.card[href$="ardacraft-map"]')) return 'missing map article card';
        if (d.querySelectorAll('.filter-btn[aria-pressed]').length === 0) return 'filters missing aria-pressed';
        // Every card is a published article now: no placeholder may ship.
        if (d.querySelectorAll('.experiments-grid .card:not(a)').length !== 0) return 'non-link (placeholder) card present';
    } },
    { path: '/outils', assert(d) {
        if (d.querySelectorAll('.tool-card').length < 8) return 'expected 8+ tool cards';
    } },
    { path: '/experiments/ardacraft', async assert(d, w) {
        if (d.getElementById('post-content').children.length === 0) return 'article body empty';
        if (d.querySelectorAll('.toc-item').length === 0) return 'TOC empty';
        // Now links forward to the published map article.
        if (d.querySelector('.read-next-section').style.display === 'none') return 'read-next should be visible';
        if (d.getElementById('read-next-link').getAttribute('href') !== 'ardacraft-map') return 'read-next should link to ardacraft-map';
        const frTitle = d.title;
        w.GumiI18n.set('en');
        if (d.title === frTitle) return 'language toggle did not re-render';
    } },
    { path: '/experiments/ardacraft-map', async assert(d, w) {
        if (d.getElementById('post-content').children.length === 0) return 'article body empty';
        if (d.querySelectorAll('.toc-item').length === 0) return 'TOC empty';
        if (!d.querySelector('.article-content table')) return 'results table missing';
        if (d.getElementById('read-next-link').getAttribute('href') !== 'ardacraft-social') return 'read-next should link to ardacraft-social';
        const frTitle = d.title;
        w.GumiI18n.set('en');
        if (d.title === frTitle) return 'language toggle did not re-render';
    } },
    { path: '/experiments-template?article=ardacraft', assert(d, w) {
        // jsdom does not navigate on location.replace; just check the page parsed.
        if (!d.title.includes('Redirection')) return 'redirect page missing';
    } },
    { path: '/tools/file-converter' },
    { path: '/tools/qrcode' },
    { path: '/tools/media-downloader', assert(d) {
        if (!d.querySelector('meta[name="robots"][content="noindex"]')) return 'missing noindex';
    } },
    { path: '/tools/text-modifier' },
    { path: '/tools/contrast-checker' },
    { path: '/tools/placeholder-text' },
    { path: '/tools/video-compressor' },
    { path: '/tools/password-generator' },
    { path: '/tools/share-preview', assert(d) {
        if (!d.getElementById('sp-url')) return 'missing URL input';
    } },
    { path: '/tools/social-formats', assert(d) {
        if (d.querySelectorAll('#sr-format-list .sr-format-row').length < 10) return 'format list not built';
    } },
    { path: '/tools/palette', assert(d) {
        if (d.querySelectorAll('#pal-swatches .pal-swatch').length < 4) return 'palette not generated';
    } },
    // CV (pierre.gumi.ch, servie aussi par /cv) : page cachee, jamais liee
    // depuis les pages publiques.
    { path: '/cv', assert(d) {
        if (!d.querySelector('meta[name="robots"][content*="noindex"]')) return 'CV page must be noindex';
        if (d.querySelectorAll('h1').length !== 1) return 'exactly one h1 expected';
        // La page vit a la racine : le canonical doit le dire.
        const can = d.querySelector('link[rel=canonical]');
        if (!can || can.getAttribute('href') !== 'https://pierre.gumi.ch/') return 'canonical must point at the root';
        // Les ancres du rail.
        for (const id of ['intro', 'realisations', 'parcours', 'competences', 'temoignages', 'perso', 'contact']) {
            if (!d.getElementById(id)) return 'missing anchor #' + id;
        }
        if (d.querySelectorAll('.fond-kpi').length !== 4) return 'expected 4 KPIs';
        if (d.querySelectorAll('.fond-projet').length !== 3) return 'expected exactly 3 projects';
        if (/Modularte/.test(d.body.textContent)) return 'Modularte should be gone';
        // Les 1 200 reservations au total et les 500+ attribuees ne doivent
        // jamais etre confondues.
        if (/1[s ]?200 réservations attribu/i.test(d.body.textContent)) return '1,200 must not be described as attributed';
        // Le carrousel duplique ses cartes pour boucler : les copies sont
        // inertes et masquees, seules les originales comptent.
        const avis = [...d.querySelectorAll('.fond-avis-carte')].filter((c) => !c.hasAttribute('aria-hidden'));
        if (avis.length !== 4) return 'expected 4 testimonials, got ' + avis.length;
        // Chaque citation mene au profil LinkedIn de qui la signe : c'est la
        // seule chose qui la rend verifiable.
        if (avis.filter((c) => c.querySelector('a[href*="linkedin.com/in/"]')).length !== 4) return 'every testimonial needs its LinkedIn link';
        // Les notes manuscrites sont decoratives : jamais annoncees, jamais
        // cliquables. Si l'une d'elles entrait dans l'arbre d'accessibilite,
        // elle se lirait au milieu d'une citation.
        const notes = avis.flatMap((c) => [...c.querySelectorAll('.fond-note')]);
        if (notes.length !== 4) return 'expected 4 handwritten notes, got ' + notes.length;
        if (notes.some((note) => note.getAttribute('aria-hidden') !== 'true')) return 'a handwritten note is exposed to screen readers';
        // La boite a outils reste exhaustive et en vrai texte.
        const tools = [...d.querySelectorAll('.fond-boite-item')].map((t) => t.textContent.trim());
        if (tools.length !== 24) return 'expected 24 tools, got ' + tools.length;
        for (const must of ['Magento', 'Salsify', 'Clarity', 'DaVinci Resolve']) {
            if (!tools.includes(must)) return must + ' missing from the toolkit';
        }
        if (!d.querySelector('a[href^="mailto:pierregumilar"]')) return 'missing mailto CTA';
        if (!d.querySelector('a[href*="linkedin.com/in/pierre-gumilar"]')) return 'missing LinkedIn CTA';
        if (!d.querySelector('a[href$="Pierre-Gumilar-CV.pdf"]')) return 'missing PDF CTA';
        // Chaque chaine traduisible porte sa cle : sinon la bascule FR/EN en
        // laisse une partie derriere elle.
        if (d.querySelectorAll('[data-i18n], [data-i18n-html]').length < 100) return 'translation keys are missing';
        const alts = [...d.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.getAttribute('hreflang'));
        for (const lang of ['fr', 'en', 'x-default']) {
            if (!alts.includes(lang)) return 'missing hreflang ' + lang;
        }
        if (!d.querySelector('script[src*="_vercel/insights"]')) return 'CV page is missing Vercel Analytics';
        if (d.body.textContent.includes('—')) return 'em dash found in CV copy';
    } },
    { path: '/brand-guidelines' }
];

async function main() {
    const server = fork(path.join(ROOT, 'dev-server.js'), [], {
        env: Object.assign({}, process.env, { PORT: String(PORT) }),
        stdio: 'ignore'
    });
    await new Promise((r) => setTimeout(r, 700));

    let failures = 0;
    try {
        for (const check of CHECKS) {
            const label = check.path;
            try {
                const { dom, pageErrors } = await loadPage(BASE + check.path);
                let problem = pageErrors.length ? 'script error: ' + pageErrors[0] : null;
                if (!problem && check.assert) {
                    problem = await check.assert(dom.window.document, dom.window);
                }
                if (!problem && !dom.window.document.title) problem = 'empty <title>';
                console.log((problem ? 'FAIL' : ' ok ') + '  ' + label + (problem ? '  → ' + problem : ''));
                if (problem) failures += 1;
                dom.window.close();
            } catch (err) {
                console.log('FAIL  ' + label + '  → ' + err.message);
                failures += 1;
            }
        }

        // The raw /en/ markup must be English BEFORE any script runs — this is
        // what crawlers see (the jsdom checks above execute i18n.js, which
        // would mask a missing pre-render).
        const enRes = await fetch(BASE + '/en/', { headers: { connection: 'close' } });
        const enBody = await enRes.text();
        const okEn = enRes.status === 200
            && enBody.includes('<html lang="en"')
            && enBody.includes('content="en_US"')
            && enBody.includes('https://gumi.ch/en/');
        console.log((okEn ? ' ok ' : 'FAIL') + '  /en/ (static English markup)');
        if (!okEn) failures += 1;

        // Article bodies must be in the raw HTML, not injected client-side.
        // The jsdom checks above run article-page.js, which would hide the
        // regression; crawlers that skip JavaScript would see an empty shell.
        for (const slug of ['ardacraft', 'ardacraft-map', 'ardacraft-social']) {
            const artRes = await fetch(BASE + '/experiments/' + slug, { headers: { connection: 'close' } });
            const artBody = await artRes.text();
            const empty = /id="post-content"[^>]*>\s*<\/article>/.test(artBody);
            const headings = (artBody.match(/<h2/g) || []).length;
            const okArt = artRes.status === 200 && !empty && headings >= 3;
            const why = empty ? 'post-content is empty' : 'only ' + headings + ' h2 in the served HTML';
            console.log((okArt ? ' ok ' : 'FAIL') + '  /experiments/' + slug + ' (body server-rendered)' + (okArt ? '' : '  → ' + why));
            if (!okArt) failures += 1;
        }

        // ardacraft-social: the abstract is rendered above the cover and the
        // table of contents, and the follower chart appears once (as the
        // cover) rather than twice.
        for (const [label, url] of [['/experiments/ardacraft-social', BASE + '/experiments/ardacraft-social'],
            ['/en/experiments/ardacraft-social', BASE + '/en/experiments/ardacraft-social']]) {
            const raw = await (await fetch(url, { headers: { connection: 'close' } })).text();
            const absAt = raw.indexOf('id="article-abstract"');
            const problems = [];
            if (absAt < 0 || raw.indexOf('class="abstract"', absAt) < 0) problems.push('abstract not rendered');
            if (absAt < raw.indexOf('id="article-cover"')) problems.push('abstract comes before the cover');
            if (absAt > raw.indexOf('toolbar-wrapper')) problems.push('abstract comes after the table of contents');
            if (raw.includes('chart-figure')) problems.push('the chart is still duplicated in the body');
            const caps = (raw.match(/class="reel-caption"/g) || []).length;
            if (caps !== 3) problems.push(caps + ' reel captions, expected 3');
            console.log((problems.length ? 'FAIL' : ' ok ') + '  ' + label + ' (abstract under the cover)'
                + (problems.length ? '  → ' + problems.join('; ') : ''));
            if (problems.length) failures += 1;
        }

        // Custom 404 page is served for unknown paths.
        const res = await fetch(BASE + '/definitely-not-a-page');
        const body = await res.text();
        const ok404 = res.status === 404 && body.includes('nf-code');
        console.log((ok404 ? ' ok ' : 'FAIL') + '  /definitely-not-a-page (custom 404)');
        if (!ok404) failures += 1;
    } finally {
        server.kill();
    }

    console.log(failures === 0 ? '\nAll smoke tests passed.' : '\n' + failures + ' failure(s).');
    // No process.exit(): on Windows it can abort (libuv async.c assertion)
    // while jsdom/undici handles are still closing. Let the loop drain.
    process.exitCode = failures === 0 ? 0 : 1;
}

main();
