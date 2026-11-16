// Builds media/logo-trame.svg: the Gumi "G." as a halftone.
//
// The G is read from media/Gumi-small.png (the Urbanist Black G of the
// logo) and redrawn as dots on the site's staggered grid: each dot's area
// follows how much of the letter covers its cell, times a soft fade from
// the bottom left (full) to the top right (lighter), so it reads as a
// printed halftone and not as a pixelated letter. The full stop stays one
// solid dot: in a logo made of dots, it is the one that is whole.
//
// Usage: node build/logo-trame.js   (needs a local Chrome or Edge)
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const BROWSERS = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
];

const PAS = 82;             // grid step in source pixels (1300 px wide source)
const COULEUR = '#9C77F5';

(async () => {
    const png = fs.readFileSync(path.join(ROOT, 'media/Gumi-small.png')).toString('base64');
    const browser = await puppeteer.launch({ executablePath: BROWSERS.find((p) => fs.existsSync(p)), headless: true });
    const page = await browser.newPage();
    const alpha = await page.evaluate(async (data) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + data;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data;
        const a = new Array(c.width * c.height);
        for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
        return { w: c.width, h: c.height, a };
    }, png);
    await browser.close();

    const { w, h, a } = alpha;
    const couvre = (x0, y0, x1, y1) => {
        let n = 0, t = 0;
        for (let y = Math.max(0, y0); y < Math.min(h, y1); y += 4) {
            for (let x = Math.max(0, x0); x < Math.min(w, x1); x += 4) { t += 1; if (a[y * w + x] > 128) n += 1; }
        }
        return t ? n / t : 0;
    };

    // The full stop: everything right of x = 990 and below y = 860.
    const POINT = { x: 990, y: 860 };
    const cercles = [];
    for (let j = 0, y = PAS / 2; y < h + PAS; j++, y += PAS * 0.9) {
        const dec = j % 2 ? PAS / 2 : 0;
        for (let x = dec; x < w + PAS; x += PAS) {
            if (x > POINT.x && y > POINT.y) continue;
            const cov = couvre(Math.round(x - PAS / 2), Math.round(y - PAS * 0.45), Math.round(x + PAS / 2), Math.round(y + PAS * 0.45));
            if (cov < 0.04) continue;
            // The fade: 1 at the bottom left, 0.42 at the top right.
            const t = ((x / w) + (1 - y / h)) / 2;
            const fondu = 1 - 0.58 * t * t;
            const r = (PAS / 2) * 1.08 * Math.sqrt(cov * fondu);
            if (r < PAS * 0.07) continue;
            cercles.push('<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + r.toFixed(1) + '"/>');
        }
    }
    cercles.push('<circle cx="1155" cy="1032" r="146"/>');

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 70 1370 1140" fill="' + COULEUR + '">'
        + '<title>Gumi</title>' + cercles.join('') + '</svg>\n';
    fs.writeFileSync(path.join(ROOT, 'media/logo-trame.svg'), svg);
    console.log('media/logo-trame.svg: ' + cercles.length + ' dots, ' + svg.length + ' bytes');
})().catch((e) => { console.error(e); process.exit(1); });
