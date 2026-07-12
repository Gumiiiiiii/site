// Layout tests: real-browser checks for visual regressions that jsdom
// cannot see (positioning, rendered image ratios, computed animations).
// Skips gracefully when no local Chrome/Edge is available.
// Usage: npm test (chained after the smoke test) or node test/layout-test.js
const { fork } = require('child_process');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 4601;
const BASE = 'http://localhost:' + PORT;
const ROOT = path.join(__dirname, '..');

const BROWSER_PATHS = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
];

function findBrowser() {
    return BROWSER_PATHS.find((p) => fs.existsSync(p)) || null;
}

const CHECKS = [
    {
        name: 'sw.js parses',
        async run() {
            execFileSync(process.execPath, ['--check', path.join(ROOT, 'sw.js')]);
        }
    },
    {
        name: 'tool page: dots background touches the top',
        async run(page) {
            await page.goto(BASE + '/tools/qrcode', { waitUntil: 'networkidle0' });
            const top = await page.evaluate(() => document.querySelector('.dots-bg').getBoundingClientRect().top);
            if (top !== 0) throw new Error('dots-bg top is ' + top + 'px, expected 0');
        }
    },
    {
        name: 'article: images render at their intrinsic ratio',
        async run(page) {
            await page.goto(BASE + '/experiments/ardacraft', { waitUntil: 'networkidle0' });
            // Article images are loading="lazy": bring one into view first.
            await page.waitForSelector('.image-breakout img');
            await page.evaluate(() => document.querySelector('.image-breakout img').scrollIntoView());
            await page.waitForFunction(() => {
                const img = document.querySelector('.image-breakout img');
                return img && img.complete && img.naturalWidth > 0;
            }, { timeout: 10000 });
            const delta = await page.evaluate(() => {
                const img = document.querySelector('.image-breakout img');
                const rect = img.getBoundingClientRect();
                return Math.abs(rect.width / rect.height - img.naturalWidth / img.naturalHeight);
            });
            if (delta > 0.02) throw new Error('rendered ratio deviates from natural ratio by ' + delta.toFixed(3));
        }
    },
    {
        name: 'contrast checker: custom color picker opens',
        async run(page) {
            await page.goto(BASE + '/tools/contrast-checker', { waitUntil: 'networkidle0' });
            await page.click('#text-swatch');
            await page.waitForSelector('.gumi-cp.open', { timeout: 3000 });
        }
    },
    {
        name: 'homepage: hero image waits for the text reveal',
        async run(page) {
            await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
            const delay = await page.evaluate(() =>
                getComputedStyle(document.querySelector('.hero-image-container')).animationDelay
            );
            if (delay !== '1.05s') throw new Error('hero image animation delay is "' + delay + '", expected "1.05s"');
        }
    },
    {
        name: 'social formats: focal point and format list are wired',
        async run(page) {
            await page.goto(BASE + '/tools/social-formats', { waitUntil: 'networkidle0' });
            const rows = await page.evaluate(() => document.querySelectorAll('#sr-format-list .sr-format-row').length);
            if (rows < 10) throw new Error('expected 10+ format rows, got ' + rows);
        }
    }
];

async function main() {
    const browserPath = findBrowser();
    if (!browserPath) {
        console.log('layout tests skipped: no local Chrome/Edge found.');
        process.exit(0);
    }

    const puppeteer = require('puppeteer-core');
    const server = fork(path.join(ROOT, 'dev-server.js'), [], {
        env: Object.assign({}, process.env, { PORT: String(PORT) }),
        stdio: 'ignore'
    });
    await new Promise((r) => setTimeout(r, 700));

    let browser = null;
    let failures = 0;
    try {
        browser = await puppeteer.launch({ executablePath: browserPath, headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        for (const check of CHECKS) {
            try {
                await check.run(page);
                console.log(' ok   ' + check.name);
            } catch (err) {
                console.log('FAIL  ' + check.name + '  → ' + err.message.split('\n')[0]);
                failures += 1;
            }
        }
    } finally {
        if (browser) await browser.close();
        server.kill();
    }

    console.log(failures === 0 ? '\nAll layout tests passed.' : '\n' + failures + ' failure(s).');
    process.exit(failures === 0 ? 0 : 1);
}

main();
