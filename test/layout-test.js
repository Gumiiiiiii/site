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
        // La regle du site (styles/ecran.css) : sur ordinateur, l accueil
        // et chaque outil tiennent dans la fenetre. Ni la
        // page ni la colonne des reglages ne defilent, a l etat initial,
        // jusqu a un portable en 1366 x 768 (650 px utiles). Le panneau de
        // resultat, lui, peut defiler : son contenu n a pas de borne.
        //
        // Un outil ajoute a tools/ entre dans ce test sans qu on y touche.
        name: 'ecran: aucune page ne defile sur ordinateur',
        async run(page) {
            const pages = ['/'].concat(
                fs.readdirSync(path.join(ROOT, 'tools'))
                    .filter((f) => f.endsWith('.html'))
                    .map((f) => '/tools/' + f.replace(/\.html$/, ''))
            );
            const ecrans = [[1366, 650], [1440, 780], [1920, 945]];
            const fautes = [];
            try {
                for (const [width, height] of ecrans) {
                    await page.setViewport({ width, height });
                    for (const p of pages) {
                        // Page posee : une apparition en cours decale ses
                        // elements de quelques pixels et fausse la mesure.
                        const m = await sansMouvement(page, async () => {
                          await page.goto(BASE + p, { waitUntil: 'networkidle0' });
                          return page.evaluate(() => {
                            const depasse = (sel) => {
                                const el = document.querySelector(sel);
                                return el ? el.scrollHeight - el.clientHeight : 0;
                            };
                            return {
                                page: document.documentElement.scrollHeight - window.innerHeight,
                                large: document.documentElement.scrollWidth - window.innerWidth,
                                reglages: Math.max(depasse('.left-col'), depasse('.main-grid')),
                                montres: [...document.querySelectorAll('.outil, .exp')].filter((e) => e.offsetParent).length
                            };
                          });
                        });
                        const ou = p + ' en ' + width + 'x' + height;
                        if (m.page > 0) fautes.push(ou + ' : la page depasse de ' + m.page + ' px');
                        if (m.large > 0) fautes.push(ou + ' : la page depasse en largeur de ' + m.large + ' px');
                        if (m.reglages > 1) fautes.push(ou + ' : les reglages depassent de ' + m.reglages + ' px');
                        if (p === '/' && m.montres < 10) fautes.push(ou + ' : l index est incomplet (' + m.montres + ')');
                    }
                }
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
            if (fautes.length) throw new Error(fautes.length + ' : ' + fautes.slice(0, 4).join(' ; '));
        }
    },
    {
        // Sur une page qui ne defile pas, une apparition qui attend d entrer
        // dans la fenetre n arrive jamais : le bouton d action, colle au bord
        // du bas, restait transparent. Tout doit etre visible sans un geste.
        name: 'ecran: tout apparait sans defilement',
        async run(page) {
            await page.setViewport({ width: 1440, height: 780 });
            try {
                for (const p of ['/tools/social-formats', '/tools/file-converter', '/tools/text-modifier']) {
                    await page.goto(BASE + p, { waitUntil: 'networkidle0' });
                    await new Promise((r) => setTimeout(r, 1400));
                    const caches = await page.evaluate(() =>
                        [...document.querySelectorAll('.back-link, .header-container, .control-row, .right-col, .advanced-section, .left-col button.primary, .pal-actions, .left-col .drop-zone')]
                            .filter((e) => e.offsetParent && Number(getComputedStyle(e).opacity) < 0.99)
                            .map((e) => e.id || e.className));
                    if (caches.length) throw new Error(p + ' : encore caches : ' + caches.join(', '));
                }
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        // Le fond de l accueil (scripts/trame.js) est un degrade maille fait
        // de points, teinte de l encre au violet. On verifie qu il est
        // dessine, qu il porte bien plusieurs teintes, qu il se retire sous
        // la phrase, et que le survol d un outil y dessine son icone.
        name: 'accueil: le degrade de points est dessine et se retire sous le texte',
        async run(page) {
            await page.setViewport({ width: 1440, height: 780 });
            try {
                await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
                await new Promise((r) => setTimeout(r, 2600));
                const lire = () => page.evaluate(() => {
                    const c = document.getElementById('trame');
                    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
                    const k = c.width / innerWidth;
                    const teintes = new Set();
                    const zone = (g, h, dr, b) => {
                        let n = 0, total = 0;
                        for (let y = Math.round(h * k); y < Math.round(b * k); y += 2) {
                            for (let x = Math.round(g * k); x < Math.round(dr * k); x += 2) {
                                const p = (y * c.width + x) * 4;
                                total += 1;
                                if (d[p + 3] > 12) { n += 1; teintes.add((d[p] >> 5) + '-' + (d[p + 1] >> 5) + '-' + (d[p + 2] >> 5)); }
                            }
                        }
                        return n / total;
                    };
                    const r = document.getElementById('hero-text').getBoundingClientRect();
                    return {
                        libre: zone(60, 90, 900, r.top - 60),
                        sousPhrase: zone(r.left + 50, r.top + 40, r.right - 50, r.bottom - 40),
                        teintes: teintes.size
                    };
                });
                const repos = await lire();
                if (repos.libre < 0.05) throw new Error('le degrade est absent (' + repos.libre.toFixed(3) + ')');
                if (repos.teintes < 3) throw new Error('le degrade n a qu une teinte (' + repos.teintes + ')');
                if (repos.sousPhrase > repos.libre * 0.35) throw new Error('la trame ne se retire pas sous la phrase (' + repos.sousPhrase.toFixed(3) + ' contre ' + repos.libre.toFixed(3) + ')');
                // L icone d un outil se dessine a l encre pleine du halftone.
                await page.hover('.outil[href="tools/qrcode"]');
                await new Promise((r) => setTimeout(r, 2400));
                const pleins = await page.evaluate(() => {
                    const c = document.getElementById('trame');
                    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
                    let n = 0;
                    for (let p = 3; p < d.length; p += 16) if (d[p] > 12) n += 1;
                    return n;
                });
                await page.mouse.move(700, 60);
                await new Promise((r) => setTimeout(r, 2400));
                const apres = await page.evaluate(() => {
                    const c = document.getElementById('trame');
                    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
                    let n = 0;
                    for (let p = 3; p < d.length; p += 16) if (d[p] > 12) n += 1;
                    return n;
                });
                if (Math.abs(pleins - apres) < apres * 0.08) throw new Error('le survol d un outil ne change pas la trame (' + pleins + ' puis ' + apres + ')');
            } finally {
                await page.mouse.move(0, 0);
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        // Le titre d un article se lit en entier : aucune coupe, aucun
        // points de suspension, jusqu au portable le plus bas.
        name: 'accueil: les titres des experimentations sont entiers',
        async run(page) {
            try {
                for (const [width, height] of [[1366, 650], [1440, 780], [1100, 600]]) {
                    await page.setViewport({ width, height });
                    await sansMouvement(page, async () => {
                        await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
                        const coupes = await page.evaluate(() => [...document.querySelectorAll('.exp-titre')]
                            .filter((t) => {
                                const r = t.getBoundingClientRect();
                                return t.scrollHeight > t.clientHeight + 1 || t.scrollWidth > t.clientWidth + 1 || r.bottom > innerHeight || r.height < 10;
                            }).map((t) => t.textContent.slice(0, 30)));
                        if (coupes.length) throw new Error(width + 'x' + height + ' : titres coupes : ' + coupes.join(' | '));
                    });
                }
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
            // Les photos sont en loading="lazy" et loin sous le premier ecran :
            // sans elles, il n y a pas de rapport source a comparer.
            await page.evaluate(() => Promise.all([...document.querySelectorAll('.fond-passion img')].map((img) => {
                img.loading = 'eager';
                return img.decode().catch(() => {});
            })));
            // Plusieurs largeurs : c est en dessous de 1100 px que le texte
            // devenait plus haut que la photo et la faisait rogner, ce qu une
            // mesure prise a 1440 seule ne voyait pas.
            try {
            for (const largeur of [1920, 1440, 1400, 1399, 1200, 1101, 1000, 800, 390]) {
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
        // Les notes manuscrites sont posees en absolu, par-dessus la carte :
        // rien ne les empeche de recouvrir un nom ou une citation si la carte
        // retrecit. On compare donc leurs boites a celles du texte.
        name: 'CV: aucune note manuscrite ne recouvre le texte dun avis',
        async run(page) {
            try {
                for (const largeur of [1920, 1440, 1280, 1101, 1100, 900, 390, 320]) {
                    await page.setViewport({ width: largeur, height: 900 });
                    await sansMouvement(page, () => page.goto(BASE + '/cv', { waitUntil: 'networkidle0' }));
                    await page.evaluate(() => document.fonts.ready);
                    const heurts = await page.evaluate(() => {
                        const boites = (el) => {
                            const plage = document.createRange();
                            plage.selectNodeContents(el);
                            return [...plage.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
                        };
                        const coupe = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
                        const out = [];
                        document.querySelectorAll('.fond-avis-carte').forEach((carte) => {
                            const texte = ['.fond-avis-tete a', '.fond-avis-role', 'blockquote']
                                .flatMap((s) => boites(carte.querySelector(s)));
                            const note = [...carte.querySelectorAll('.fond-note-texte, .fond-note-trait')].map((e) => e.getBoundingClientRect());
                            if (note.some((n) => texte.some((x) => coupe(n, x)))) out.push(carte.querySelector('.fond-avis-tete a').textContent.trim());
                            const c = carte.getBoundingClientRect();
                            if (note.some((n) => n.right > document.documentElement.clientWidth || n.left < 0)) out.push('hors ecran');
                            if (c.height < 40) out.push('carte ecrasee');
                        });
                        return out;
                    });
                    if (heurts.length) throw new Error(largeur + ' : ' + heurts.join(', '));
                }
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        // Le bento n a de sens que si les cartes d une rangee finissent ensemble,
        // et que le texte remplit sa carte au lieu de laisser un trou.
        name: 'CV: les cartes du bento ne laissent pas de grand vide',
        async run(page) {
            try {
                for (const largeur of [1920, 1440, 1280, 1101]) {
                    await page.setViewport({ width: largeur, height: 900 });
                    await sansMouvement(page, () => page.goto(BASE + '/cv', { waitUntil: 'networkidle0' }));
                    await page.evaluate(() => document.fonts.ready);
                    const vides = await page.evaluate(() => [...document.querySelectorAll('.fond-avis-carte')].map((c) => {
                        const q = c.querySelector('blockquote').getBoundingClientRect();
                        return { nom: c.querySelector('.fond-avis-tete a').textContent.trim(), vide: Math.round(c.getBoundingClientRect().bottom - q.bottom) };
                    }));
                    console.log('      vides ' + largeur + ' : ' + vides.map((v) => v.nom.split(' ')[0] + ' ' + v.vide).join(', '));
                    const trop = vides.filter((v) => v.vide > 130);
                    if (trop.length) throw new Error(largeur + ' : ' + trop.map((v) => v.nom + ' ' + v.vide + 'px').join(', '));
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

            // Chaque note visible doit avoir fini de s ecrire : elles passent a la
            // file, il faut leur en laisser le temps.
            await page.waitForFunction(() => [...document.querySelectorAll('.fond-note')]
                .every((n) => n.offsetParent === null || n.getAttribute('data-plume') === 'ecrit'), { timeout: 15000 })
                .catch(() => { throw new Error('des notes ne se sont pas ecrites'); });

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
        // La frise existe pour montrer ce qui s est passe en meme temps : les
        // periodes qui se recoupent doivent se recouper en hauteur, sans qu aucune
        // ne recouvre l autre, et sans que deux periodes distinctes se touchent.
        // L echelle est stricte : toutes les annees ont la meme hauteur, et le texte
        // d une periode courte ne doit jamais atteindre celui de la suivante. Ce texte
        // reste assez grand pour se lire et aligne a gauche.
        name: 'CV: la frise montre ce qui se recoupe, lisible et sans chevauchement',
        async run(page) {
            try {
                for (const largeur of [1920, 1440, 1301, 1300, 800, 761, 760, 390, 361, 360, 320]) {
                    await page.setViewport({ width: largeur, height: 900 });
                    for (const adresse of ['/cv', '/en/cv']) {
                    await sansMouvement(page, () => page.goto(BASE + adresse, { waitUntil: 'networkidle0' }));
                    await page.evaluate(() => document.fonts.ready);
                    const m = await page.evaluate(() => {
                        const c = document.querySelector('.fond-chrono').getBoundingClientRect();
                        const a = document.querySelector('.fond-chrono-annee').getBoundingClientRect();
                        return {
                            debord: document.documentElement.scrollWidth - innerWidth,
                            centre: (a.left + a.right) / 2,
                            milieu: (c.left + c.right) / 2,
                            annees: [...document.querySelectorAll('.fond-chrono-annee')].map((e) => e.getBoundingClientRect().top),
                            textes: Object.fromEntries([...document.querySelectorAll('.fond-chrono-barre')].map((b) => {
                                const nom = [...b.classList].find((x) => x.startsWith('fond-chrono-barre--')).slice(19);
                                const rs = [...b.querySelectorAll('strong, .fond-chrono-detail')].map((e) => e.getBoundingClientRect());
                                return [nom, { g: Math.min(...rs.map((r) => r.left)), d: Math.max(...rs.map((r) => r.right)), h: Math.min(...rs.map((r) => r.top)), b: Math.max(...rs.map((r) => r.bottom)) }];
                            })),
                            fondu: getComputedStyle(document.querySelector('.fond-chrono'), '::before').maskImage,
                            barres: Object.fromEntries([...document.querySelectorAll('.fond-chrono-barre')].map((b) => {
                                const r = b.getBoundingClientRect();
                                const nom = [...b.classList].find((x) => x.startsWith('fond-chrono-barre--')).slice(19);
                                const texte = [...b.querySelectorAll('strong, .fond-chrono-detail, .fond-chrono-projet, .fond-chrono-chiffres li')];
                                return [nom, {
                                    g: r.left, d: r.right, h: r.top, b: r.bottom,
                                    sh: b.scrollHeight - b.clientHeight,
                                    sw: Math.max(...texte.map((e) => e.scrollWidth - e.clientWidth)),
                                    tailles: [parseFloat(getComputedStyle(b.querySelector('strong')).fontSize), parseFloat(getComputedStyle(b.querySelector('.fond-chrono-detail')).fontSize)],
                                    aligne: getComputedStyle(b).textAlign,
                                chiffres: b.querySelectorAll('.fond-chrono-chiffres li').length,
                                retrait: b.querySelector('strong').getBoundingClientRect().left - r.left,
                                detache: (() => {
                                    const suite = b.querySelector('.fond-chrono-detail').nextElementSibling;
                                    return !suite || (parseFloat(getComputedStyle(suite).borderTopWidth) > 0
                                        && suite.getBoundingClientRect().top - b.querySelector('.fond-chrono-detail').getBoundingClientRect().bottom >= 8);
                                })(),
                                centrage: (() => {
                                    const haut = b.querySelector('strong').getBoundingClientRect().top - r.top;
                                    const bas = r.bottom - b.querySelector('.fond-chrono-detail').getBoundingClientRect().bottom;
                                    return Math.abs(haut - bas);
                                })(),
                                dateCoupee: (() => {
                                    const mesure = document.createRange();
                                    mesure.selectNodeContents(b.querySelector('.fond-dates'));
                                    return mesure.getBoundingClientRect().right > r.right + 0.5;
                                })(),
                                motCoupe: (() => {
                                    // Le mot le plus long doit tenir sur sa ligne.
                                    const style = getComputedStyle(b);
                                    const place = b.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
                                    const toile = document.createElement('canvas').getContext('2d');
                                    return texte.flatMap((e) => {
                                        toile.font = getComputedStyle(e).fontWeight + ' ' + getComputedStyle(e).fontSize + ' ' + getComputedStyle(e).fontFamily;
                                        const blocs = e.matches('.fond-chrono-detail') ? [...e.children] : [e];
                                        return blocs.map((x) => x.textContent).join(' ').split(/[\s-]+/).filter((mot) => toile.measureText(mot).width > place);
                                    });
                                })()
                                }];
                            }))
                        };
                    });
                    const noms = Object.keys(m.barres);
                    if (m.debord > 0) throw new Error(largeur + ' : la page deborde de ' + m.debord + 'px');
                    if (noms.length !== 7) throw new Error(largeur + ' : attendu 7 entrees, trouve ' + noms.length);
                    if (largeur > 1300 && Math.abs(m.centre - m.milieu) > 2) throw new Error(largeur + ' : ligne decentree de ' + (m.centre - m.milieu) + 'px');
                    if (!/transparent|rgba\(0, 0, 0, 0\)/.test(m.fondu)) throw new Error(largeur + ' : la ligne ne s efface plus en bas');
                    const recoupe = (x, y, a, b) => x[a] < y[b] - 0.5 && y[a] < x[b] - 0.5;
                    const minimum = largeur > 760 ? [18, 16] : largeur > 360 ? [15, 14] : [14, 14];
                    noms.forEach((nom, i) => {
                        const x = m.barres[nom];
                        if (x.sw > 0) throw new Error(largeur + ' : ' + nom + ' deborde');
                        if (x.sh > 0) throw new Error(largeur + ' : le texte de ' + nom + ' depasse son rectangle de ' + x.sh + 'px');
                        if (x.dateCoupee) throw new Error(largeur + ' ' + adresse + ' : la date de ' + nom + ' sort de son rectangle');
                        if (x.motCoupe.length) throw new Error(largeur + ' ' + adresse + ' : mot coupe dans ' + nom + ' : ' + x.motCoupe.join(', '));
                        if (x.tailles[0] < minimum[0] || x.tailles[1] < minimum[1]) throw new Error(largeur + ' : ' + nom + ' trop petit : ' + x.tailles.join(' / '));
                        if (x.retrait > 20) throw new Error(largeur + ' : le texte de ' + nom + ' ne part plus de la gauche, retrait ' + x.retrait + 'px');
                        if (x.aligne === 'right' || x.aligne === 'end') throw new Error(largeur + ' : ' + nom + ' aligne a droite');
                        const aDroite = nom === 'msc' || nom === 'dueti' || (nom === 'consulting' && largeur <= 1300);
                        if (aDroite ? x.g < m.centre : x.d > m.centre) throw new Error(largeur + ' : ' + nom + ' du mauvais cote de la ligne');
                        noms.slice(i + 1).forEach((autre) => {
                            const y = m.barres[autre];
                            if (recoupe(x, y, 'g', 'd') && recoupe(x, y, 'h', 'b')) throw new Error(largeur + ' ' + adresse + ' : ' + nom + ' chevauche ' + autre);
                        });
                    });
                    const pas = m.annees.slice(1).map((y, i) => y - m.annees[i]);
                    if (m.annees.length !== 9) throw new Error(largeur + ' : attendu 9 annees');
                    if (Math.max(...pas) - Math.min(...pas) > 1) throw new Error(largeur + ' : annees inegales : ' + pas.map(Math.round).join(', '));
                    noms.forEach((nom, i) => noms.slice(i + 1).forEach((autre) => {
                        const x = m.textes[nom], y = m.textes[autre];
                        if (recoupe(x, y, 'g', 'd') && recoupe(x, y, 'h', 'b')) throw new Error(largeur + ' : le texte de ' + nom + ' touche celui de ' + autre);
                    }));
                    const b = m.barres;
                    const ensemble = [['cm', 'consulting'], ['stage', 'consulting'], ['nutri', 'msc'], ['exki', 'msc']];
                    if (largeur > 1300) ensemble.push(['stage', 'msc']);
                    for (const [x, y] of ensemble) {
                        if (!recoupe(b[x], b[y], 'h', 'b')) throw new Error(largeur + ' : ' + x + ' et ' + y + ' ne sont plus a la meme hauteur');
                    }
                    if (largeur > 1300 && Math.abs((b.cm.d - b.cm.g) - (b.consulting.d - b.consulting.g)) > 12) throw new Error(largeur + ' : le consulting et les postes n ont plus la meme largeur');
                    if (b.cm.chiffres !== 3 || b.consulting.chiffres !== 4) throw new Error(largeur + ' : chiffres manquants, Lindt ' + b.cm.chiffres + ', consulting ' + b.consulting.chiffres);
                    if (!b.cm.detache || !b.consulting.detache) throw new Error(largeur + ' : les chiffres ne sont plus detaches du titre');
                    if (b.stage.centrage > 2) throw new Error(largeur + ' : le texte du stage n est plus centre, ecart ' + b.stage.centrage + 'px');
                    if (b.nutri.b > b.exki.h) throw new Error(largeur + ' : les deux stages de 2020 se suivent, ils ne doivent pas se toucher');
                    if (b.stage.h < b.cm.b) throw new Error(largeur + ' : le stage de 2022 remonte dans le poste de 2023');
                    }
                }
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        // Une note attend son tour sans se montrer : au rechargement, ni ses mots ni
        // son trait ne paraissent avec la carte pour s effacer ensuite.
        name: 'CV: une note ne se montre pas avant de s ecrire',
        async run(page) {
            const onglet = await page.browser().newPage();
            try {
                await onglet.setViewport({ width: 1440, height: 1100 });
                await onglet.evaluateOnNewDocument(() => {
                    window.__avantTour = [];
                    function opacite(el) {
                        let o = 1;
                        for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
                        return o;
                    }
                    function image() {
                        document.querySelectorAll('.fond-note').forEach((note) => {
                            if (note.getAttribute('data-plume') === 'ecrit' || opacite(note) < 0.03) return;
                            const decoupe = /inset\(([^)]*)\)/.exec(getComputedStyle(note.querySelector('.fond-note-texte')).clipPath);
                            const droite = decoupe ? decoupe[1].split(/\s+/)[1] : null;
                            const motsCaches = droite !== undefined && parseFloat(droite) >= 99;
                            const traitsCaches = [...note.querySelectorAll('.fond-note-trait path')]
                                .every((p) => parseFloat(getComputedStyle(p).strokeDashoffset) >= 0.97);
                            if (!motsCaches || !traitsCaches) window.__avantTour.push(note.className);
                        });
                        requestAnimationFrame(image);
                    }
                    requestAnimationFrame(image);
                });
                await onglet.goto(BASE + '/cv#temoignages', { waitUntil: 'load' });
                await new Promise((r) => setTimeout(r, 4000));
                const vues = await onglet.evaluate(() => [...new Set(window.__avantTour)]);
                if (vues.length) throw new Error('visibles avant leur tour : ' + vues.join(' | '));
            } finally {
                await onglet.close();
            }
        }
    },
    {
        // En anglais, les chiffres s ecrivent a l anglaise, ceux du hero compris.
        name: 'CV: les chiffres suivent la langue',
        async run(page) {
            await page.goto(BASE + '/en/cv', { waitUntil: 'networkidle0' });
            const fautes = await page.evaluate(() => document.querySelector('.fond-page').textContent
                .match(/\d[\s\u00a0]\d{3}\b|\d[\s\u00a0]%/g));
            if (fautes) throw new Error('format francais sur /en/cv : ' + fautes.join(' | '));
            const hero = await page.evaluate(() => [...document.querySelectorAll('.fond-kpi b')].map((b) => b.textContent));
            if (hero.join('|') !== '500 → 5,000|+180%|500+|7,000+') throw new Error('hero : ' + hero.join('|'));
        }
    },
    {
        // Le cercle seul : ni fondu du navigateur, ni transitions d elements, et pas
        // de semis en milliers de noeuds, qui font tomber l animation a 7 images/s.
        name: 'CV: la bascule de theme est un cercle net',
        async run(page) {
            const onglet = await page.browser().newPage();
            try {
                await onglet.setViewport({ width: 1440, height: 900 });
                await onglet.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
                const m = await onglet.evaluate(async () => {
                    const noeuds = document.querySelectorAll('svg circle').length;
                    const bouton = document.querySelector('[data-fond-theme]');
                    const r = bouton.getBoundingClientRect();
                    bouton.click();
                    const classe = document.documentElement.classList.contains('theme-switching');
                    let cercle = null, fondus = 0, transitions = 0;
                    const debut = performance.now();
                    while (performance.now() - debut < 400) {
                        await new Promise(requestAnimationFrame);
                        document.getAnimations().forEach((a) => {
                            const pseudo = a.effect.pseudoElement || '';
                            if (!pseudo.includes('view-transition')) {
                                if (a instanceof CSSTransition && !a.effect.target.closest('.theme-toggle-icon')) transitions++;
                                return;
                            }
                            a.effect.getKeyframes().forEach((k) => {
                                if (k.clipPath && !cercle) cercle = k.clipPath;
                                if (k.opacity !== undefined) fondus++;
                            });
                        });
                    }
                    return { noeuds, classe, cercle, fondus, transitions, x: r.left + r.width / 2, y: r.top + r.height / 2, bas: r.top > innerHeight / 2, gauche: r.left < innerWidth / 2 };
                });
                if (m.noeuds > 5000) throw new Error(m.noeuds + ' cercles SVG sur la page');
                if (!m.classe) throw new Error('theme-switching n est pas pose');
                if (!m.gauche || !m.bas) throw new Error('le bouton n est plus en bas a gauche');
                const depart = /circle\(0px at ([\d.]+)px ([\d.]+)px\)/.exec(m.cercle || '');
                if (!depart) throw new Error('pas de cercle : ' + m.cercle);
                if (Math.abs(depart[1] - m.x) > 1 || Math.abs(depart[2] - m.y) > 1) throw new Error('le cercle ne part pas du bouton');
                if (m.fondus) throw new Error('un fondu se joue avec le cercle');
                if (m.transitions) throw new Error(m.transitions + ' transitions d elements pendant le cercle');
                await onglet.evaluate(async () => {
                    await new Promise((r) => setTimeout(r, 900));
                    localStorage.removeItem('site-theme');
                });
            } finally {
                await onglet.close();
            }
        }
    },
    {
        // Un seul stylo : a aucun moment deux gestes ne se dessinent ensemble, et dans
        // une note ils se suivent dans l ordre, le corps de la fleche avant sa pointe.
        name: 'CV: le stylo ne dessine qu un trait a la fois',
        async run(page) {
            const onglet = await page.browser().newPage();
            try {
                await onglet.setViewport({ width: 1440, height: 1400 });
                await onglet.goto(BASE + '/cv#temoignages', { waitUntil: 'load' });
                const journal = await onglet.evaluate(async () => {
                    const notes = [...document.querySelectorAll('.fond-avis .fond-note')];
                    const gestes = notes.flatMap((n) => [n.querySelector('.fond-note-texte'), ...n.querySelectorAll('path')].map((el, i) => ({
                        el, nom: n.className.replace('fond-note fond-note--', '') + (i ? ':trait' + i : ':mots')
                    })));
                    const actif = (el) => el.getAnimations().some((a) => {
                        const { delay, duration } = a.effect.getTiming();
                        return a.playState === 'running' && a.currentTime > delay + 1 && a.currentTime < delay + duration - 1;
                    });
                    const ordre = [];
                    let ensemble = null;
                    const debut = performance.now();
                    while (performance.now() - debut < 20000) {
                        const encours = gestes.filter((g) => actif(g.el));
                        if (encours.length > 1 && !ensemble) ensemble = encours.map((g) => g.nom).join(' + ');
                        encours.forEach((g) => { if (!ordre.includes(g.nom)) ordre.push(g.nom); });
                        if (ordre.length === gestes.length) break;
                        await new Promise(requestAnimationFrame);
                    }
                    return { ordre, ensemble, total: gestes.length };
                });
                if (journal.ensemble) throw new Error('dessines ensemble : ' + journal.ensemble);
                if (journal.ordre.length !== journal.total) throw new Error('gestes vus : ' + journal.ordre.join(', '));
                const attendu = [
                    'etoile:trait1', 'etoile:trait2', 'etoile:trait3', 'etoile:mots',
                    'traits:mots', 'traits:trait1', 'traits:trait2', 'traits:trait3',
                    'fleche:mots', 'fleche:trait1', 'fleche:trait2', 'fleche:trait3',
                    'marge:mots', 'marge:trait1'
                ].join(', ');
                if (journal.ordre.join(', ') !== attendu) throw new Error('ordre : ' + journal.ordre.join(', '));
            } finally {
                await onglet.close();
            }
        }
    },
    {
        // Une seule main : les notes visibles ensemble s ecrivent l une apres l autre,
        // dans l ordre de lecture, et jamais deux a la fois.
        name: 'CV: les notes visibles ensemble s ecrivent a la file',
        async run(page) {
            await page.setViewport({ width: 1440, height: 1400 });
            try {
                await page.goto(BASE + '/cv', { waitUntil: 'networkidle0' });
                await new Promise((r) => setTimeout(r, 2500));
                const journal = await page.evaluate(async () => {
                    const notes = [...document.querySelectorAll('.fond-avis .fond-note')];
                    const titre = document.querySelector('#temoignages').getBoundingClientRect().top + scrollY - 40;
                    if (window.gumiLenis) window.gumiLenis.scrollTo(titre, { immediate: true });
                    else window.scrollTo(0, titre);
                    const debut = performance.now();
                    const ecrites = new Map();
                    while (performance.now() - debut < 15000 && ecrites.size < notes.length) {
                        notes.forEach((n, i) => {
                            if (n.getAttribute('data-plume') === 'ecrit' && !ecrites.has(i)) ecrites.set(i, performance.now());
                        });
                        await new Promise((r) => setTimeout(r, 40));
                    }
                    return { ordre: [...ecrites.keys()], temps: [...ecrites.values()], total: notes.length };
                });
                if (journal.ordre.length !== journal.total) throw new Error('seulement ' + journal.ordre.length + ' notes ecrites sur ' + journal.total);
                if (journal.ordre.join() !== '0,1,2,3') throw new Error('ordre de lecture rompu : ' + journal.ordre.join());
                for (let i = 1; i < journal.temps.length; i++) {
                    const ecart = journal.temps[i] - journal.temps[i - 1];
                    if (ecart < 500) throw new Error('deux notes a ' + Math.round(ecart) + ' ms d intervalle');
                }
            } finally {
                await page.setViewport({ width: 1440, height: 900 });
            }
        }
    },
    {
        // L'accent designe trois choses et rien d'autre, dans les deux langues :
        // la bascule de langue reecrit la phrase du hero, elle ne doit pas lui
        // faire perdre sa couleur.
        name: 'CV: l accent reste sur la demande, les preuves et le bouton',
        async run(page) {
            await sansMouvement(page, () => page.goto(BASE + '/cv', { waitUntil: 'networkidle0' }));
            const lire = () => page.evaluate(() => {
                const accent = getComputedStyle(document.querySelector('.fond-rail a[aria-current="true"]')).color;
                const couleur = (s) => getComputedStyle(document.querySelector(s)).color;
                return {
                    accent,
                    demande: couleur('.fond-hero-phrase strong.fond-cle'),
                    preuve: couleur('.fond-projet-chiffre b'),
                    bouton: getComputedStyle(document.querySelector('.fond-action--principale')).backgroundColor,
                    note: couleur('.fond-note-texte')
                };
            });
            for (const langue of ['fr', 'en', 'fr']) {
                await page.evaluate((l) => window.GumiI18n.set(l), langue);
                const c = await lire();
                for (const nom of ['demande', 'preuve', 'bouton']) {
                    if (c[nom] !== c.accent) throw new Error(langue + ' : ' + nom + ' nest pas a laccent : ' + c[nom]);
                }
                if (c.note === c.accent) throw new Error(langue + ' : les notes manuscrites ont repris laccent');
            }
        }
    },
    {
        // Une mesure sur fond clair et sombre : le gris du texte et les voisines
        // du rail ne doivent pas repasser sous 4,5:1. Le rail s'efface ensuite
        // cran par cran, sans qu'aucune entree ne disparaisse.
        name: 'CV: le gris du texte tient 4,5:1, en clair comme en sombre',
        async run(page) {
            await sansMouvement(page, () => page.goto(BASE + '/cv', { waitUntil: 'networkidle0' }));
            for (const theme of ['light', 'dark']) {
                const r = await page.evaluate((t) => {
                    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
                    else document.documentElement.removeAttribute('data-theme');
                    const lum = (c) => {
                        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
                        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
                    };
                    const rgb = (s) => s.match(/[\d.]+/g).map(Number);
                    const sonde = document.createElement('div');
                    sonde.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg');
                    document.body.appendChild(sonde);
                    const fond = rgb(getComputedStyle(sonde).backgroundColor);
                    sonde.remove();
                    const rapport = (el, extra) => {
                        const c = rgb(getComputedStyle(el).color);
                        const a = (c[3] === undefined ? 1 : c[3]) * (extra || 1);
                        const m = [0, 1, 2].map((i) => c[i] * a + fond[i] * (1 - a));
                        const [x, y] = [lum(m), lum(fond)].sort((p, q) => q - p);
                        return (x + 0.05) / (y + 0.05);
                    };
                    const rail = [...document.querySelectorAll('.fond-rail a')].map((a) =>
                        rapport(a, Number(getComputedStyle(a).opacity)));
                    return {
                        seuils: {
                            gris: rapport(document.querySelector('.fond-hero-phrase')),
                            libelle: rapport(document.querySelector('.fond-kpi small')),
                            rail: rail[1]
                        },
                        rail
                    };
                }, theme);
                for (const [nom, v] of Object.entries(r.seuils)) {
                    if (v < 4.5) throw new Error(theme + ' : ' + nom + ' a ' + v.toFixed(2) + ':1');
                }
                for (let i = 2; i < r.rail.length; i++) {
                    if (r.rail[i] >= r.rail[i - 1]) throw new Error(theme + ' : le rail ne seffaiblit plus a lentree ' + i);
                }
                if (r.rail[r.rail.length - 1] < 1.6) throw new Error(theme + ' : la derniere entree du rail est a ' + r.rail[r.rail.length - 1].toFixed(2) + ':1');
                console.log('      rail ' + theme + ' : ' + r.rail.map((v) => v.toFixed(1)).join(' / '));
            }
            await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
        }
    },
    {
        // Un script qui ne repond jamais bloque tous les suivants, donc aussi
        // fond-anim.js, le seul a reveler la page. Elle doit s afficher quand
        // meme, a la bonne place, y compris sans fond-titre.js qui pose tout.
        name: 'CV: un script bloque ne laisse jamais la page vide',
        async run(page) {
            for (const script of ['fond-outils.js', 'fond-titre.js', 'fond-anim.js']) {
                const onglet = await page.browser().newPage();
                try {
                    await onglet.setViewport({ width: 1440, height: 900 });
                    await onglet.setRequestInterception(true);
                    onglet.on('request', (r) => { if (!r.url().includes('/scripts/' + script)) r.continue(); });
                    onglet.goto(BASE + '/cv').catch(() => {});
                    await new Promise((r) => setTimeout(r, 3800));
                    const m = await onglet.evaluate(() => {
                        const opacite = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
                        const cibles = ['.fond-hero-phrase', '.fond-kpi b', '.fond-projet', '#projet-ardacraft .fond-projet-texte', '.fond-chrono', '#contact', '.fond-action--principale']
                            .map((s) => document.querySelector(s));
                        const hauts = ['#realisations', '#parcours', '#contact', '.fond-chrono', '.fond-actions']
                            .map((s) => document.querySelector(s).getBoundingClientRect().top);
                        return {
                            pales: cibles.filter((c) => opacite(c) < 0.99).map((c) => c.className || c.id),
                            ferme: document.querySelector('#projet-ardacraft .fond-projet-texte').getBoundingClientRect().height < 40,
                            enOrdre: hauts.every((h, i) => i === 0 || h >= hauts[0]) && hauts[1] > hauts[0] && hauts[2] > hauts[1]
                        };
                    });
                    if (m.pales.length) throw new Error(script + ' : restent invisibles : ' + m.pales.join(', '));
                    if (m.ferme) throw new Error(script + ' : un projet reste ferme, sans script pour louvrir');
                    if (!m.enOrdre) throw new Error(script + ' : les sections sempilent');
                } finally {
                    await onglet.close();
                }
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
