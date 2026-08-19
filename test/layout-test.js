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

// Mesurer une page posee, et non en train d entrer : sous « mouvement
// reduit », cv.html n anime rien et affiche l etat final des le premier
// rendu. On rend l onglet comme on l a trouve, il est partage.
async function sansMouvement(page, mesure) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    try {
        return await mesure();
    } finally {
        await page.emulateMediaFeatures([]);
    }
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
        name: 'article: featured cover renders at 16:9',
        async run(page) {
            await page.goto(BASE + '/experiments/ardacraft-map', { waitUntil: 'networkidle0' });
            const ratio = await page.evaluate(() => {
                const rect = document.getElementById('article-cover').getBoundingClientRect();
                return rect.width / rect.height;
            });
            if (Math.abs(ratio - 16 / 9) > 0.02) throw new Error('cover ratio is ' + ratio.toFixed(3) + ', expected 1.778');
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
        name: 'mobile: category header leaves room for the cards',
        async run(page) {
            await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
            try {
                await page.goto(BASE + '/outils', { waitUntil: 'networkidle0' });
                const gridTop = await page.evaluate(() => Math.round(document.querySelector('.grid-target').getBoundingClientRect().top));
                // Hero + search + filters once filled the whole first viewport.
                if (gridTop > 844 - 60) throw new Error('tools grid starts at ' + gridTop + 'px in an 844px viewport');
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        name: 'mobile: hero text fully faded before its sticky container ends',
        async run(page) {
            await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
            try {
                await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
                const opacity = await page.evaluate(async () => {
                    const section = document.querySelector('.hero-section');
                    const container = document.querySelector('.hero-text-container');
                    window.scrollTo(0, section.offsetHeight - container.offsetHeight);
                    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
                    return Number(getComputedStyle(document.getElementById('hero-text')).opacity);
                });
                if (opacity > 0.01) throw new Error('hero text still at opacity ' + opacity + ' when it unsticks');
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        // Deux cartes empilees : la photo collee au cadre a gauche, le texte
        // a droite. La photo doit se montrer entiere — c est la raison d etre
        // du 4/3, qui est le rapport des deux fichiers.
        name: 'CV: les cartes de passions montrent la photo entiere',
        async run(page) {
            await page.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
            // Plusieurs largeurs : c est en dessous de 1100 px que le texte
            // devenait plus haut que la photo et la faisait rogner, ce qu une
            // mesure prise a 1440 seule ne voyait pas.
            try {
            for (const largeur of [1440, 1200, 1101, 1000, 800, 390]) {
            await page.setViewport({ width: largeur, height: 900 });
            await new Promise((r) => setTimeout(r, 400));
            const m = await page.evaluate(() => {
                return [...document.querySelectorAll('.fond-passion')].map((carte) => {
                    const c = carte.getBoundingClientRect();
                    const img = carte.querySelector('img');
                    const i = img.getBoundingClientRect();
                    return {
                        largeur: Math.round(c.width),
                        // Collee au cadre : il ne reste que le trait de bordure.
                        marge_gauche: Math.round(i.left - c.left),
                        marge_haut: Math.round(i.top - c.top),
                        // Rapport affiche contre rapport du fichier : egaux,
                        // object-fit: cover ne rogne rien.
                        rapport_affiche: +(i.width / i.height).toFixed(3),
                        rapport_source: +(img.naturalWidth / img.naturalHeight).toFixed(3),
                        rayon: getComputedStyle(img).borderTopLeftRadius
                    };
                });
            });
            if (m.length !== 2) throw new Error('attendu 2 cartes, trouve ' + m.length);
            if (m[0].largeur !== m[1].largeur) throw new Error(largeur + ' : largeurs inegales');
            for (const c of m) {
                if (c.marge_gauche > 1 || c.marge_haut > 1) {
                    throw new Error(largeur + ' : la photo ne touche pas le cadre, ' + c.marge_gauche + ' / ' + c.marge_haut);
                }
                if (Math.abs(c.rapport_affiche - c.rapport_source) > 0.02) {
                    throw new Error(largeur + ' : la photo est rognee, ' + c.rapport_affiche + ' contre ' + c.rapport_source);
                }
                if (parseFloat(c.rayon) < 8) throw new Error(largeur + ' : coins non arrondis, ' + c.rayon);
            }
            }
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        // Les titres s ecrivent sur une rangee du champ de points. Le champ
        // divise la hauteur de la page par le nombre entier de rangees le plus
        // proche : si cette hauteur cesse d etre un multiple de 72, son pas
        // derive et les titres finissent a cote des points.
        name: 'CV: les titres tombent sur une rangee du champ de points',
        async run(page) {
            await sansMouvement(page, async () => {
            await page.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
            await new Promise((r) => setTimeout(r, 600));
            const m = await page.evaluate(() => {
                const feuille = document.querySelector('.site-content');
                const champ = document.querySelector('.points-champ');
                const haut = feuille.getBoundingClientRect().top;
                const rangees = [...new Set([...champ.querySelectorAll('circle')]
                    .map((c) => Math.round(+c.getAttribute('cy'))))].sort((a, b) => a - b);
                const titres = [...document.querySelectorAll('.fond-titre')].map((t) => {
                    const repere = document.createElement('span');
                    repere.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
                    t.appendChild(repere);
                    const y = repere.getBoundingClientRect().top - haut;
                    repere.remove();
                    return Math.round(y);
                });
                return { hauteur: feuille.offsetHeight, titres, rangees };
            });
            if (m.titres.length !== 6) throw new Error('attendu 6 titres, trouve ' + m.titres.length);
            if (m.hauteur % 72 !== 0) throw new Error('la hauteur de page nest pas un multiple de 72 : ' + m.hauteur);
            const grille = new Set(m.rangees.filter((y) => y % 72 === 0));
            for (const y of m.titres) {
                if (!grille.has(y)) throw new Error('un titre tombe a ' + y + ', hors des rangees de la grille');
            }
            });
        }
    },
    {
        name: 'CV: les quatre chiffres du hero restent alignes',
        async run(page) {
            const hauts = await sansMouvement(page, async () => {
                await page.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
                return page.evaluate(() =>
                    [...document.querySelectorAll('.fond-kpi b')].map((b) => Math.round(b.getBoundingClientRect().top)));
            });
            if (hauts.length !== 4) throw new Error('attendu 4 chiffres, trouve ' + hauts.length);
            if (new Set(hauts).size !== 1) throw new Error('chiffres desalignes : ' + hauts.join(', '));
        }
    },
    {
        // Une entree qui ne se termine pas laisse la page transparente : on
        // verifie les deux temps, celui du premier ecran et celui du
        // defilement.
        // Une entree qui ne se termine pas laisse un morceau de page
        // transparent pour toujours — c est arrive au bloc de contact, dont le
        // selecteur pesait plus lourd que l etat revele. On parcourt donc la
        // page entiere et on verifie que tout ce que le script suit est bien
        // arrive.
        name: 'CV: les apparitions se terminent, rien ne reste transparent',
        async run(page) {
            await page.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
            await new Promise((r) => setTimeout(r, 2600));

            const lettres = await page.evaluate(() => document.querySelectorAll('.fond-hero-phrase .fond-lettre').length);
            if (lettres < 100) throw new Error('la phrase du hero na pas ete decoupee : ' + lettres);

            // Descendre par paliers : ce qui se revele au defilement ne se
            // revele pas si on saute directement en bas.
            const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
            for (let y = 0; y <= hauteur; y += 600) {
                await page.evaluate((cible) => {
                    if (window.gumiLenis) window.gumiLenis.scrollTo(cible, { immediate: true });
                    else window.scrollTo(0, cible);
                }, y);
                await new Promise((r) => setTimeout(r, 120));
            }
            await new Promise((r) => setTimeout(r, 1600));

            const pales = await page.evaluate(() => {
                const suivis = window.fondAnim.suivis
                    .concat(window.fondAnim.lignes, window.fondAnim.cadre)
                    .concat([...document.querySelectorAll('.fond-hero-photo, .fond-hero-phrase .fond-lettre')])
                    .concat([...document.querySelectorAll('.fond-kpi > *')]);
                return suivis
                    .filter((e) => Number(getComputedStyle(e).opacity) < 0.99)
                    .map((e) => e.tagName.toLowerCase() + '.' + (e.className || '').toString().split(' ')[0]);
            });
            if (pales.length) throw new Error(pales.length + ' element(s) restent transparents : ' + [...new Set(pales)].join(', '));

            await page.evaluate(() => {
                if (window.gumiLenis) window.gumiLenis.scrollTo(0, { immediate: true });
                else window.scrollTo(0, 0);
            });
        }
    },
    {
        // Le dictionnaire ne doit que traduire : un aller-retour FR -> EN -> FR
        // doit rendre exactement la copie de depart.
        name: 'CV: la bascule de langue ne reecrit pas le francais',
        async run(page) {
            await page.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
            const lire = () => page.evaluate(() => document.body.innerText.replace(/s+/g, ' ').trim());
            const avant = await lire();
            await page.evaluate(() => window.GumiI18n.set('en'));
            const anglais = await lire();
            if (anglais === avant) throw new Error('la page na pas change de langue');
            if (/Mes deux passions|Parlons-en/.test(anglais)) throw new Error('du francais subsiste en anglais');
            await page.evaluate(() => window.GumiI18n.set('fr'));
            const apres = await lire();
            if (apres !== avant) throw new Error('le francais a change apres un aller-retour');
        }
    },
    {
        name: 'CV: aucun debord horizontal, a toutes les largeurs',
        async run(page) {
            try {
                for (const width of [320, 390, 600, 760, 900, 1280, 1440]) {
                    await page.setViewport({ width, height: 844 });
                    await page.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
                    const debord = await page.evaluate(() =>
                        document.documentElement.scrollWidth - document.documentElement.clientWidth);
                    if (debord > 0) throw new Error('debord de ' + debord + 'px a ' + width + 'px');
                }
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
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
