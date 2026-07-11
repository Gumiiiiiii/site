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
        // Vendor smooth-scroll needs browser APIs jsdom lacks; not our code.
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
        if (d.querySelectorAll('.experiences-right .card').length !== 2) return 'expected 2 experiment cards';
        if (!d.querySelector('.footer-byline')) return 'missing footer byline';
    } },
    { path: '/experiments', assert(d) {
        if (d.querySelectorAll('.experiments-grid .card').length !== 2) return 'expected 2 cards';
        if (d.querySelectorAll('.filter-btn[aria-pressed]').length === 0) return 'filters missing aria-pressed';
    } },
    { path: '/outils', assert(d) {
        if (d.querySelectorAll('.tool-card').length < 8) return 'expected 8+ tool cards';
    } },
    { path: '/experiments/ardacraft', async assert(d, w) {
        if (d.getElementById('post-content').children.length === 0) return 'article body empty';
        if (d.querySelectorAll('.toc-item').length === 0) return 'TOC empty';
        if (d.getElementById('read-next-link').getAttribute('href') !== 'ai-photoshoot') return 'bad read-next link';
        const frTitle = d.title;
        w.GumiI18n.set('en');
        if (d.title === frTitle) return 'language toggle did not re-render';
    } },
    { path: '/experiments/ai-photoshoot', assert(d) {
        if (d.getElementById('post-content').children.length === 0) return 'article body empty';
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
    process.exit(failures === 0 ? 0 : 1);
}

main();
