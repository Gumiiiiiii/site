// Variante B de l'accueil : un champ de lavande sous le soleil.
//
// Même règle que scripts/trame.js : un seul réseau de points, celui du
// champ du site à demi-pas, une seule encre grise, et c'est la taille de
// chaque point qui dessine. Ici on voit :
//   · le ciel, qui se charge vers le haut comme le champ du site ;
//   · le soleil, un disque fait d'anneaux, entouré de rayons ;
//   · la ligne des collines, qui le coupe ;
//   · les rangs de lavande, qui filent vers un point de fuite et que le
//     vent fait onduler, lentement.
// Pas de calcul en volume : c'est une perspective plate, ligne par ligne.
(function () {
    var toile = document.getElementById('lavande');
    if (!toile || !toile.getContext) return;

    var SEUIL = window.matchMedia('(min-width: 1100px) and (min-height: 600px)');
    var CALME = window.matchMedia('(prefers-reduced-motion: reduce)');
    var PAS_X = 10, PAS_Y = 9, RAYON_MAX = 5.2, CADENCE = 40;

    var ctx = null, largeur = 0, hauteur = 0, dpr = 1, xs, ys;
    var encre = 'rgba(26, 26, 26, 0.12)';
    var boucle = 0, dernier = 0;

    function mesurer() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        largeur = window.innerWidth;
        hauteur = window.innerHeight;
        toile.width = Math.round(largeur * dpr);
        toile.height = Math.round(hauteur * dpr);
        var rangees = Math.round(hauteur / PAS_Y), pas = hauteur / rangees;
        var centre = largeur / 2, demi = Math.ceil(centre / PAS_X) + 1;
        var n = (rangees + 1) * (demi * 2 + 1);
        xs = new Float32Array(n);
        ys = new Float32Array(n);
        var k = 0;
        for (var j = 0; j <= rangees; j++) {
            var dec = (j % 2) ? PAS_X / 2 : 0;
            for (var i = -demi; i <= demi; i++) { xs[k] = centre + i * PAS_X + dec; ys[k] = j * pas; k += 1; }
        }
    }

    function lireTheme() {
        var rgb = (getComputedStyle(document.documentElement).getPropertyValue('--text-rgb') || '26, 26, 26').trim();
        var sombre = document.documentElement.getAttribute('data-theme') === 'dark';
        encre = 'rgba(' + rgb + ', ' + (sombre ? 0.15 : 0.12) + ')';
    }

    function lisse(a, b, x) {
        var t = (x - a) / (b - a);
        t = t < 0 ? 0 : (t > 1 ? 1 : t);
        return t * t * (3 - 2 * t);
    }

    function tracer(maintenant) {
        boucle = 0;
        if (!SEUIL.matches || !ctx) return;
        if (maintenant - dernier < CADENCE) { reveiller(); return; }
        dernier = maintenant;
        var t = CALME.matches ? 0 : maintenant / 1000;

        // La scène : l'horizon un peu sous le milieu, le point de fuite à
        // droite du centre, le soleil posé sur les collines.
        var hy = hauteur * 0.6, vx = largeur * 0.4;
        var sx = largeur * 0.36, sy = hy - hauteur * 0.05, R = hauteur * 0.13;
        var bas = hauteur - hy;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();

        for (var i = 0; i < xs.length; i++) {
            var x = xs[i], y = ys[i], ton = 0;

            // La ligne des collines : deux ondulations, l'une longue,
            // l'autre courte, comme un Luberon vu de loin.
            var colline = hy - hauteur * (0.035 + 0.03 * Math.sin(x * 0.0042 + 1.3) + 0.014 * Math.sin(x * 0.011 + 0.4));

            if (y < colline) {
                // Le ciel, qui se charge vers le haut.
                var haut = 1 - y / colline;
                ton = 0.13 * haut * haut;
                // Le soleil : des anneaux dans le disque, des rayons autour.
                var dx = x - sx, dy = y - sy, d = Math.sqrt(dx * dx + dy * dy);
                if (d < R) {
                    var anneau = Math.cos(d / R * 9) > 0 ? 1 : 0;
                    ton = Math.max(ton, 0.12 + 0.6 * anneau);
                } else if (d < R * 1.75) {
                    var angle = Math.atan2(dy, dx);
                    var rayon = Math.cos(angle * 14 + t * 0.05);
                    if (rayon > 0.5) ton = Math.max(ton, 0.42 * (1 - (d - R * 1.12) / (R * 0.63)) * lisse(R * 1.08, R * 1.18, d));
                }
            } else if (y < hy) {
                // Les collines : un aplat léger, plus dense vers leur crête.
                ton = 0.16 + 0.08 * (1 - (y - colline) / (hy - colline + 1));
            } else {
                // La lavande. La profondeur suit l'inverse de la distance à
                // l'horizon ; la coordonnée de rang suit la perspective.
                var p = (y - hy) / bas;                       // 0 à l'horizon, 1 en bas
                var prof = 1 / (p + 0.02);
                var X = (x - vx) / (p + 0.02) / largeur;      // position dans le champ
                var vent = Math.sin(t * 0.7 + prof * 0.35) * 0.012;
                var u = X * 4 + vent;
                var f = u - Math.floor(u);
                var crete = 1 - Math.abs(f - 0.5) * 2;        // 1 au milieu du rang
                var touffe = 0.75 + 0.25 * Math.cos(prof * 2.6 + Math.floor(u) * 1.7);
                var rang = crete > 0.45 ? touffe : 0;
                // Près de l'horizon, les rangs sont plus fins qu'un point :
                // on passe à leur ton moyen pour éviter le moiré.
                var finesse = lisse(0.02, 0.16, p);
                ton = (0.22 + (rang * 0.85 - 0.22) * finesse) * (0.55 + 0.45 * p);
            }

            if (ton < 0.02) continue;
            var r = RAYON_MAX * Math.sqrt(ton > 1 ? 1 : ton);
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, 6.2832);
        }
        ctx.fill();
        if (!CALME.matches) reveiller();
    }

    function reveiller() {
        if (!boucle && ctx && SEUIL.matches && !document.hidden) boucle = requestAnimationFrame(tracer);
    }
    document.addEventListener('visibilitychange', reveiller);

    var redim;
    function reprendre() {
        if (!SEUIL.matches) { if (ctx) ctx.clearRect(0, 0, toile.width, toile.height); return; }
        if (!ctx) ctx = toile.getContext('2d');
        if (!ctx) return;
        lireTheme();
        mesurer();
        dernier = 0;
        reveiller();
    }
    window.addEventListener('resize', function () { clearTimeout(redim); redim = setTimeout(reprendre, 120); });
    new MutationObserver(function () { if (ctx) { lireTheme(); dernier = 0; reveiller(); } })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    reprendre();
})();
