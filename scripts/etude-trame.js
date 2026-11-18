// Fond des pages d'expérimentation : deux dégradés de points en nappes douces, sur la grille du site.
(function () {
    // Sans 2D (jsdom des tests), rien à dessiner.
    if (typeof CanvasRenderingContext2D === 'undefined') return;
    var toiles = [
        { el: document.getElementById('etude-trame'), bas: false, autour: '.article-header, .outil-tete' },
        { el: document.getElementById('etude-trame-bas'), bas: true, autour: '.read-next-section' },
        { el: document.getElementById('trame-pleine'), plein: true, autour: '.nf' },
        { el: document.getElementById('accueil-pied'), bas: true, autour: null }
    ].filter(function (t) { return t.el; });
    if (!toiles.length) return;

    var PAS_X = 10, PAS_Y = 9, RAYON_MAX = 5.2;

    function lisse(a, b, x) {
        var t = (x - a) / (b - a);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    }
    function hasard(i, j) {
        var n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }
    function bruit(x, y) {
        var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
        fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
        var a = hasard(i, j), b = hasard(i + 1, j), c = hasard(i, j + 1), d = hasard(i + 1, j + 1);
        return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    // Des nappes : deux échelles de bruit, étirées en largeur.
    function nappe(x, y) {
        return 0.65 * bruit(x * 1.1, y * 2.2) + 0.35 * bruit(x * 2.7 + 5.3, y * 5.1 + 1.7);
    }

    function dessiner() { toiles.forEach(dessinerUne); }

    function dessinerUne(t) {
        var toile = t.el, ctx = toile.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var largeur = toile.clientWidth, hauteur = toile.clientHeight;
        if (!largeur || !hauteur) return;
        toile.width = Math.round(largeur * dpr);
        toile.height = Math.round(hauteur * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);

        var racine = document.documentElement;
        var sombre = racine.getAttribute('data-theme') === 'dark';
        var rgb = (getComputedStyle(racine).getPropertyValue('--text-rgb') || '26, 26, 26').trim();
        ctx.fillStyle = 'rgba(' + rgb + ', ' + (sombre ? 0.17 : 0.13) + ')';

        // La clairière : une ellipse douce autour du titre, ou des cartes du bas.
        var cible = t.autour && document.querySelector(t.autour), boite = toile.getBoundingClientRect();
        var r = cible ? cible.getBoundingClientRect() : { left: largeur * 0.25, right: largeur * 0.75, top: boite.top + 100, bottom: boite.top + 300 };
        var cx = (r.left + r.right) / 2 - boite.left, cy = (r.top + r.bottom) / 2 - boite.top;
        var rx = (r.right - r.left) / 2 + 90, ry = (r.bottom - r.top) / 2 + 70;

        var echelle = 1 / 360;
        var centre = largeur / 2;
        ctx.beginPath();
        for (var j = 0, y = PAS_Y / 2; y < hauteur; j++, y += PAS_Y) {
            var dec = (j % 2) ? PAS_X / 2 : 0;
            var depuisBord = t.bas ? hauteur - y : y;
            var haut = t.plein ? 1 : 1 - lisse(hauteur * 0.05, hauteur * 0.92, depuisBord);
            if (haut <= 0) continue;
            for (var x = ((centre + dec) % PAS_X); x < largeur; x += PAS_X) {
                var ex = (x - cx) / rx, ey = (y - cy) / ry;
                var clairiere = t.autour ? lisse(0.75, 1.6, Math.sqrt(ex * ex + ey * ey)) : 1;
                var n = lisse(0.36, 0.7, nappe(x * echelle, (y + (t.bas ? 4000 : 0)) * echelle));
                var ton = haut * haut * clairiere * (0.03 + 0.72 * n);
                if (ton < 0.012) continue;
                var rayon = RAYON_MAX * Math.sqrt(ton);
                ctx.moveTo(x + rayon, y);
                ctx.arc(x, y, rayon, 0, 6.2832);
            }
        }
        ctx.fill();
        toile.classList.add('prete');
    }

    var attente;
    function bientot() { clearTimeout(attente); attente = setTimeout(dessiner, 120); }
    window.addEventListener('resize', bientot);
    new MutationObserver(dessiner).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(dessiner);
    dessiner();
})();
