// Builds accueil-b.html and accueil-c.html from index.html: same head,
// same content, different composition. Rerun after editing index.html.
const fs = require('fs');
process.chdir(require('path').join(__dirname, '..'));
const src = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

const head = src.slice(0, src.indexOf('<body'));
const outils = src.slice(src.indexOf('            <ol class="outils-liste">'), src.indexOf('            </ol>', src.indexOf('<ol class="outils-liste">')) + '            </ol>'.length);
const expsOl = src.slice(src.indexOf('            <ol class="exps-liste">'), src.indexOf('            </ol>', src.indexOf('<ol class="exps-liste">')) + '            </ol>'.length);
const phrase = src.slice(src.indexOf('        <h1 class="hero-text accueil-phrase"'), src.indexOf('</h1>') + 5);
const scripts = src.slice(src.indexOf('    <script src="scripts/page-effects.js"></script>'), src.indexOf('    <script src="scripts/points-champ.js"></script>'));
const outilsTete = src.slice(src.indexOf('            <header class="bloc-tete">', src.indexOf('<section class="bloc outils"')), src.indexOf('            </header>', src.indexOf('<section class="bloc outils"')) + '            </header>'.length);
for (const [k, v] of Object.entries({ head, outils, expsOl, phrase, scripts, outilsTete })) if (!v || v.length < 20) throw new Error('extract ' + k);

const expsTete = `            <header class="bloc-tete">
                <h2 id="exps-titre" data-i18n="home_exp_title">Mes expérimentations</h2>
            </header>`;

function page(nom, css, titre, corps, js) {
    let h = head.replace('    <link rel="stylesheet" href="styles/accueil.css">', '    <link rel="stylesheet" href="styles/accueil.css">\n    <link rel="stylesheet" href="styles/' + css + '">')
        .replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n    <meta name="viewport"');
    if (!h.includes(css)) throw new Error('css link');
    const out = h + corps + '\n' + scripts + js + '</body>\n</html>\n';
    fs.writeFileSync(nom, out);
    console.log('wrote ' + nom + ' (' + titre + ')');
}

// ---- B : la mise en page de A, sur le fond de la Sainte-Victoire. Seul le
// fond change : la page est celle de l'accueil, mot pour mot.
{
    let b = src.replace('<canvas class="trame" id="trame" aria-hidden="true"></canvas>', '<canvas class="trame" id="lavande" aria-hidden="true"></canvas>')
        .replace('<script src="scripts/trame.js"></script>', '<script src="scripts/lavande.js"></script>')
        .replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n    <meta name="viewport"')
        .replace('<main class="accueil" id="main">', '<!-- Variante B de l\'accueil, générée depuis index.html : ne pas\n         l\'éditer à la main. -->\n    <main class="accueil" id="main">');
    if (!b.includes('scripts/lavande.js') || !b.includes('id="lavande"')) throw new Error('B swap');
    fs.writeFileSync('accueil-b.html', b);
    console.log('wrote accueil-b.html (A + lavande)');
}

// ---- C : la fenêtre
const phraseC = phrase.replace('class="hero-text accueil-phrase"', 'class="hero-text fen-phrase"');
const expsC = expsOl.replace(/\n {24}<img class="exp-image"[^>]*>/g, '');
const images = [...expsOl.matchAll(/<img class="exp-image" src="([^"]+)"/g)].map((m) => m[1]);
if (images.length !== 3) throw new Error('images');
const fenetre = `        <a class="fen-arche" href="experiments/ardacraft-social">
            <span class="fen-cadre">
                <span class="fen-ouverture">
${images.map((s) => '                    <img src="' + s + '" alt="" width="1200" height="675">').join('\n')}
                </span>
            </span>
        </a>`;
page('accueil-c.html', 'accueil-c.css', 'fenetre', `<body id="top" class="ecran accueil-c">
    <a class="skip-link" href="#main" data-i18n="skip_link">Aller au contenu</a>
    <div class="points-champ" aria-hidden="true"></div>

    <nav class="navbar" data-navbar-root></nav>

    <!-- Variante C de l'accueil, générée depuis index.html : ne pas
         l'éditer à la main. -->
    <main class="fen" id="main">
${phraseC}

        <section class="bloc exps fen-exps" aria-labelledby="exps-titre">
${expsTete}
${expsC}
        </section>

${fenetre}

        <section class="bloc outils fen-outils" aria-labelledby="outils-titre">
${outilsTete}
${outils}
        </section>
    </main>
`, '    <script src="scripts/points-champ.js"></script>\n    <script src="scripts/fenetre.js"></script>\n');
