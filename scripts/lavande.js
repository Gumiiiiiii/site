// Le fond de l'accueil : la Sainte-Victoire au-dessus d'un champ de lavande.
//
// Même règle que le reste du site : un seul réseau de points, celui du
// champ à demi-pas, une seule encre grise, et c'est la taille de chaque
// point qui dessine. On voit :
//   · le ciel, qui se charge vers le haut comme le champ du site ;
//   · la Sainte-Victoire, sa crête relevée d'après la vue depuis le sud,
//     côté Aix : la longue montée de l'ouest, le pic de la Croix de
//     Provence, la crête dentelée, puis la falaise qui tombe à l'est. Le
//     calcaire est clair ; ce sont les ravines de sa face qui y posent
//     l'encre ;
//   · la garrigue à son pied, sombre, et quelques cyprès ;
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

    // La crête : [part de la largeur de la montagne, hauteur de 0 à 1].
    var CRETE = [
        [0.00, 0.62], [0.06, 0.66], [0.13, 0.70], [0.19, 0.76], [0.23, 0.85],
        [0.25, 0.87], [0.29, 0.97], [0.33, 0.99], [0.37, 0.98], [0.40, 1.00],
        [0.43, 0.94], [0.47, 0.93], [0.50, 0.87], [0.53, 0.88], [0.57, 0.81],
        [0.60, 0.82], [0.63, 0.76], [0.66, 0.80], [0.71, 0.81], [0.75, 0.76],
        [0.78, 0.60], [0.80, 0.40], [0.84, 0.21], [0.92, 0.09], [1.00, 0.00]
    ];
    function profil(u) {
        if (u <= 0) return CRETE[0][1];
        if (u >= 1) return 0;
        for (var k = 1; k < CRETE.length; k++) {
            if (u <= CRETE[k][0]) {
                var a = CRETE[k - 1], b = CRETE[k];
                var v = a[1] + (b[1] - a[1]) * (u - a[0]) / (b[0] - a[0]);
                // Le calcaire n'a pas d'arête lisse : un grain fin la dentelle.
                return v + 0.012 * Math.sin(u * 190) + 0.008 * Math.sin(u * 470 + 1.3);
            }
        }
        return 0;
    }

    // Les cyprès : [part de la largeur de l'écran, hauteur en part de l'écran].
    var CYPRES = [[0.215, 0.11], [0.235, 0.085], [0.705, 0.12], [0.722, 0.095], [0.93, 0.105]];

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

        // La scène : l'horizon sous le milieu, le point de fuite au centre
        // de l'espace libre, la montagne posée sur l'horizon.
        var hy = hauteur * 0.5, vx = largeur * 0.56;
        var mg = -largeur * 0.03, ml = largeur * 0.98;    // l'ouest de la crête sort de l'écran      // la montagne : bord gauche, largeur
        var mh = hauteur * 0.4;                           // sa hauteur au pic
        var pied = hy - hauteur * 0.035;                   // où elle sort de la garrigue
        var bas = hauteur - hy;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();

        for (var i = 0; i < xs.length; i++) {
            var x = xs[i], y = ys[i], ton = 0;

            var u = (x - mg) / ml;
            var sommet = pied - mh * profil(u);
            // La garrigue : une bande sombre et irrégulière au pied du mont.
            var garrigue = hy - hauteur * (0.028 + 0.01 * Math.sin(x * 0.03) + 0.006 * Math.sin(x * 0.11));

            // Les cyprès : une flamme étroite, plus large au tiers du bas.
            var cypres = 0;
            for (var c = 0; c < CYPRES.length; c++) {
                var cxp = CYPRES[c][0] * largeur, ch = CYPRES[c][1] * hauteur;
                var v = (hy - y) / ch;                       // 0 au pied, 1 à la pointe
                if (v < 0 || v > 1) continue;
                var demiL = hauteur * 0.015 * Math.sin(Math.PI * Math.pow(v, 0.62)) * (1 - v * 0.2);
                if (Math.abs(x - cxp) < demiL) cypres = 0.62;
            }

            if (cypres) {
                ton = cypres;
            } else if (y >= garrigue && y < hy) {
                ton = 0.3 + 0.1 * Math.sin(x * 0.07 + y * 0.2);
            } else if (y >= sommet && y < garrigue && u > -0.05 && u < 1) {
                // La face. Le calcaire est clair : l'encre ne se pose que
                // dans les ravines, qui descendent presque droit et
                // s'élargissent vers le bas, et dans les bancs de rocher.
                var prof = (y - sommet) / Math.max(1, pied - sommet);   // 0 à la crête, 1 au pied
                var ravine = Math.sin(x * 0.11 + 1.1 * Math.sin(y * 0.035 + x * 0.013) + 2.4 * Math.sin(x * 0.019));
                var r2 = ravine > 0.72 ? (ravine - 0.72) / 0.28 : 0;
                // Les ravines ne sont pas régulières : certaines pans en ont peu.
                r2 *= 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(x * 0.023 + 1.1));
                var banc = Math.sin(y * 0.09 - x * 0.012) > 0.86 ? 0.12 : 0;
                // Le bas de la face, boisé, s'assombrit vers la garrigue.
                var boise = lisse(0.62, 1.0, prof) * 0.26;
                ton = 0.1 + r2 * (0.26 + 0.2 * prof) + banc * (1 - prof) + boise;
                // L'arête se lit par une ligne de points un peu plus forts.
                if (y - sommet < 9) ton = Math.max(ton, 0.42);
            } else if (y < hy) {
                // Le ciel, qui se charge vers le haut.
                var haut = 1 - y / hy;
                ton = 0.13 * haut * haut;
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
                ton = (0.2 + (rang * 0.7 - 0.2) * finesse) * (0.6 + 0.4 * p) * (1 - 0.25 * lisse(0.55, 1, p));
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
