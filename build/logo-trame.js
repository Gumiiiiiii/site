// Builds the halftone logos from logo-trame.html (the local tuner), with its default settings.
// Usage: node build/logo-trame.js [outdir] [lignes...]   (needs a local Chrome or Edge)
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const BROWSERS = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
];

(async () => {
    const sortie = process.argv[2] || path.join(ROOT, 'media');
    const lignes = process.argv.slice(3).map(Number);
    const png = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'media/Gumi-Logotype.png')).toString('base64');
    const html = fs.readFileSync(path.join(ROOT, 'logo-trame.html'), 'utf8').replace("'media/Gumi-Logotype.png'", JSON.stringify(png));
    const browser = await puppeteer.launch({ executablePath: BROWSERS.find((p) => fs.existsSync(p)), headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForFunction(() => typeof MOT !== 'undefined' && MOT);
    for (const n of lignes.length ? lignes : [0]) {
        const suffixe = n ? '-' + n : '';
        const [g, mot] = await page.evaluate((n) => {
            if (n) { document.getElementById('lignes').value = n; }
            rendre();
            return [sortieG, sortieMot];
        }, n);
        fs.writeFileSync(path.join(sortie, 'logo-trame' + suffixe + '.svg'), g);
        fs.writeFileSync(path.join(sortie, 'logo-trame-gumi' + suffixe + '.svg'), mot);
        console.log('logo-trame' + suffixe + ': ' + g.length + ' + ' + mot.length + ' bytes');
    }
    await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
