// Le fond d'une page d'expérimentation : un dégradé de points sur la grille
// du site, dense dans les coins du haut, qui s'efface vers le bas et
// s'écarte de la colonne du texte.
(function () {
    var toile = document.getElementById('etude-trame');
    // Sans 2D (jsdom des tests), rien à dessiner.
    if (!toile || typeof CanvasRenderingContext2D === 'undefined') return;

    var PAS_X = 10, PAS_Y = 9, RAYON_MAX = 5.2;
    var ctx = null;

    function lisse(a, b, x) {
        var t = (x - a) / (b - a);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    }

    function dessiner() {
        if (!ctx) ctx = toile.getContext('2d');
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
        ctx.fillStyle = 'rgba(' + rgb + ', ' + (sombre ? 0.16 : 0.12) + ')';

        // La colonne du texte : le dégradé reste sur ses côtés.
        var col = document.querySelector('.article-hero');
        var r = col ? col.getBoundingClientRect() : { left: largeur * 0.2, right: largeur * 0.8 };
        var marge = Math.max(60, Math.min(r.left, largeur - r.right));

        var centre = largeur / 2;
        ctx.beginPath();
        for (var j = 0, y = PAS_Y / 2; y < hauteur; j++, y += PAS_Y) {
            var dec = (j % 2) ? PAS_X / 2 : 0;
            var haut = 1 - lisse(0, hauteur * 0.85, y);
            if (haut <= 0) break;
            for (var x = ((centre + dec) % PAS_X); x < largeur; x += PAS_X) {
                var dehors = Math.max(r.left - x, x - r.right, 0) / marge;
                // Une trace légère passe au-dessus de la colonne, tout en haut.
                var cote = Math.max(lisse(0, 1, dehors), 0.35 * (1 - lisse(0, hauteur * 0.22, y)));
                var ton = 0.55 * haut * haut * cote;
                if (ton < 0.01) continue;
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
