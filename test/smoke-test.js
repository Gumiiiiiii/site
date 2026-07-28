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
        if (!d.querySelector('.card.faded .soon-badge')) return 'missing coming-soon teaser card';
        if (d.querySelector('a.card[href*="ai-photoshoot"]')) return 'ai-photoshoot must not be linked while unpublished';
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
        if (d.getElementById('read-next-link').getAttribute('href') !== 'ardacraft') return 'read-next should link to ardacraft';
        const frTitle = d.title;
        w.GumiI18n.set('en');
        if (d.title === frTitle) return 'language toggle did not re-render';
    } },
    { path: '/experiments/ai-photoshoot', assert(d) {
        if (d.getElementById('post-content').children.length === 0) return 'article body empty';
        if (!d.querySelector('meta[name="robots"][content="noindex"]')) return 'missing noindex on unpublished article';
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
    // CV landing (pierre.gumi.ch/cv): hidden page, must be noindex and
    // never linked from the public pages.
    { path: '/cv', assert(d) {
        if (!d.querySelector('meta[name="robots"][content*="noindex"]')) return 'CV page must be noindex';
        if (!d.querySelector('a[href^="mailto:pierregumilar"]')) return 'missing mailto CTA';
        if (d.querySelectorAll('.cv-stat').length !== 5) return 'expected 5 stat cards';
        if (d.querySelectorAll('.cv-case').length !== 3) return 'expected 3 case studies';
        if (d.querySelectorAll('.cv-tl-row').length < 7) return 'timeline incomplete';
        if (d.querySelectorAll('.cv-tl-group').length !== 3) return 'timeline should split experience/education/languages';
        // Recommandations : section commentée dans cv.html tant que les vraies
        // citations ne sont pas arrivées. Réactiver la ligne ci-dessous en même
        // temps que la section.
        // if (d.querySelectorAll('.cv-quote').length !== 3) return 'expected 3 recommendation quotes';
        if (d.querySelectorAll('.cv-quote').length !== 0) return 'recommendation quotes should stay hidden until they are real';
        if (!d.querySelector('.navbar .cv-nav-cta')) return 'contact CTA should be docked in the navbar';
        if (d.querySelectorAll('.cv-tool').length < 20) return 'tool cloud incomplete';
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
