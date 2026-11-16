// Le fond de l'accueil : la Sainte-Victoire au-dessus d'un champ de lavande.
//
// Même règle que le reste du site : un seul réseau de points, celui du
// champ à demi-pas, une seule encre grise, et c'est la taille de chaque
// point qui dessine. On voit :
//   · le ciel, qui se charge vers le haut comme le champ du site ;
//   · la Sainte-Victoire comme Cézanne la peint depuis Bellevue : une
//     longue pente à l'ouest, un sommet arrondi, un flanc est plus raide
//     et son épaulement. Elle n'est pas un mur : elle est faite de plans,
//     le versant ouest au soleil, le flanc est dans l'ombre, et chaque plan
//     est une tache de touches orientées, comme les coups de pinceau du
//     tableau. Deux arêtes descendent du sommet ;
//   · devant elle, deux rangs de collines qui se recouvrent, chacun avec
//     sa crête claire et son ombre dessous : c'est ce qui donne la
//     profondeur ;
//   · sur la colline de droite, le petit viaduc du tableau, qui rappelle
//     le pont du fond de l'autre accueil ;
//   · quelques cyprès ;
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
    var encre = 'rgba(26, 26, 26, 0.12)', sombre = false;
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
        sombre = document.documentElement.getAttribute('data-theme') === 'dark';
        encre = 'rgba(' + rgb + ', ' + (sombre ? 0.15 : 0.12) + ')';
    }

    // La crête, relevée sur le tableau : [part de la largeur, hauteur de 0
    // à 1]. Le sommet est vers 0,45.
    var CRETE = [
        [0.00, 0.30], [0.08, 0.38], [0.18, 0.50], [0.28, 0.64], [0.36, 0.80],
        [0.41, 0.93], [0.45, 1.00], [0.52, 1.00], [0.56, 0.96], [0.60, 0.84],
        [0.66, 0.64], [0.70, 0.55], [0.73, 0.54], [0.78, 0.46], [0.86, 0.40],
        [0.94, 0.38], [1.00, 0.40]
    ];
    function profil(u) {
        if (u <= 0) return CRETE[0][1];
        if (u >= 1) return CRETE[CRETE.length - 1][1];
        for (var k = 1; k < CRETE.length; k++) {
            if (u <= CRETE[k][0]) {
                var a = CRETE[k - 1], b = CRETE[k];
                var t = (u - a[0]) / (b[0] - a[0]);
                t = t * t * (3 - 2 * t);           // des épaules arrondies, pas des angles
                return a[1] + (b[1] - a[1]) * t + 0.006 * Math.sin(u * 230);
            }
        }
        return 0;
    }

    // Un bruit en cases : chaque case a sa valeur, comme une touche de
    // pinceau a sa couleur.
    function hasard(i, j) {
        var n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }
    // Les touches : des cases allongées, inclinées, décalées d'une rangée à
    // l'autre comme des coups de pinceau posés côte à côte.
    function touche(x, y, angle, long, large) {
        var ca = Math.cos(angle), sa = Math.sin(angle);
        var a = x * ca + y * sa, b = -x * sa + y * ca;
        var j = Math.floor(b / large);
        var i = Math.floor(a / long + j * 0.37);
        return hasard(i, j) - 0.5;
    }

    // Les cyprès : [part de la largeur de l'écran, hauteur en part de l'écran].
    var CYPRES = [[0.215, 0.1], [0.231, 0.075], [0.905, 0.11], [0.921, 0.085]];

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
        var mg = -largeur * 0.06, ml = largeur * 1.12;   // la montagne : bord gauche, largeur
        var mh = hauteur * 0.36;                          // sa hauteur au sommet
        var pied = hy - hauteur * 0.07;                   // où elle disparaît derrière les collines
        var sx = mg + ml * 0.485, sy = pied - mh;         // le sommet
        var bas = hauteur - hy;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();

        for (var i = 0; i < xs.length; i++) {
            var x = xs[i], y = ys[i], ton = 0;

            var u = (x - mg) / ml;
            var sommet = pied - mh * profil(u);
            // Les deux rangs de collines, de l'arrière vers l'avant.
            var col1 = hy - hauteur * (0.095 + 0.03 * Math.sin(x * 0.0052 + 0.8) + 0.014 * Math.sin(x * 0.0145 + 2.1));
            var col2 = hy - hauteur * (0.042 + 0.018 * Math.sin(x * 0.0071 + 3.3) + 0.008 * Math.sin(x * 0.023));

            // Les cyprès : une flamme étroite, plus large au tiers du bas.
            var cypres = 0;
            for (var c = 0; c < CYPRES.length; c++) {
                var cxp = CYPRES[c][0] * largeur, ch = CYPRES[c][1] * hauteur;
                var v = (hy - y) / ch;                       // 0 au pied, 1 à la pointe
                if (v < 0 || v > 1) continue;
                var demiL = hauteur * 0.013 * Math.sin(Math.PI * Math.pow(v, 0.62)) * (1 - v * 0.2);
                if (Math.abs(x - cxp) < demiL) cypres = 0.55;
            }

            // Le viaduc, posé sur la première colline, à droite.
            var viaduc = 0;
            var vg = largeur * 0.70, vd = largeur * 0.86;
            if (x > vg && x < vd) {
                var vb = col1 + hauteur * 0.02, vh = hauteur * 0.045;   // son pied, sa hauteur
                if (y < vb && y > vb - vh) {
                    var portee = (vd - vg) / 7, w = (x - vg) % portee - portee / 2;
                    var ra = portee * 0.36;
                    var dansArche = Math.abs(w) < ra && y > vb - vh * 0.72 - Math.sqrt(Math.max(0, ra * ra - w * w));
                    if (!dansArche) viaduc = 0.5;
                }
            }

            if (cypres) {
                ton = cypres;
            } else if (viaduc) {
                ton = viaduc;
            } else if (y >= col2 && y < hy) {
                // La colline de devant, la plus foncée : une crête claire,
                // puis l'ombre qui gagne en descendant, en touches.
                var d2 = y - col2;
                ton = 0.1 + 0.16 * lisse(0, hauteur * 0.035, d2) + 0.13 * touche(x, y, -0.35, 34, 12);
                if (d2 < 6) ton = 0.34;
            } else if (y >= col1 && y < col2) {
                var d1 = y - col1;
                ton = 0.05 + 0.14 * lisse(0, hauteur * 0.05, d1) + 0.12 * touche(x, y, 0.3, 40, 13);
                if (d1 < 6) ton = 0.3;
            } else if (y >= sommet && y < col1) {
                // La face. Son ombre vient de la pente de la crête au-dessus :
                // là où la crête descend vers l'est, le versant tourne le dos
                // au soleil.
                var pente = (profil(u + 0.012) - profil(u - 0.012)) / 0.024;
                var ombre = lisse(-0.2, -1.6, pente);               // 0 au soleil, 1 à l'ombre
                // L'ombre suit le versant en descendant : sous le sommet, le
                // partage entre les deux côtés penche vers l'est.
                var prof = (y - sommet) / Math.max(1, pied - sommet);
                var partage = sx + (y - sy) * 0.55;
                ombre = Math.max(ombre * (1 - 0.4 * prof), lisse(-20, 60, x - partage) * 0.75);
                // Les touches : orientées comme les plans, plus serrées en
                // haut, où la roche est nue.
                var pinceau = touche(x, y, ombre > 0.4 ? 0.55 : -0.45, 30 + 30 * prof, 11);
                // Le pied se perd dans une brume claire : les collines de devant
                // s'y détachent.
                var brume = lisse(0.7, 1, prof);
                ton = (0.05 + 0.24 * ombre + (0.12 + 0.1 * ombre) * pinceau) * (1 - 0.6 * brume);
                // Les deux arêtes qui descendent du sommet, en traits plus
                // sombres, et quelques plis plus loin.
                var ax = x - sx, ay = y - sy;
                var dist1 = Math.abs(ay - (-ax) * 0.95) / 1.38;                // pente descendant à gauche
                var dist2 = Math.abs(ay - ax * 1.6) / 1.89;                    // pente descendant à droite
                if (ax < 0 && ay > 0 && dist1 < 4) ton = Math.max(ton, 0.3 * (1 - prof));
                if (ax > 0 && ay > 0 && dist2 < 4) ton = Math.max(ton, 0.34 * (1 - prof));
                // L'arête se lit par une ligne de points un peu plus forts.
                if (y - sommet < 7) ton = Math.max(ton, 0.34);
                if (ton < 0.03) ton = 0.03;
                // En sombre, l'encre est claire : elle dessine la lumière.
                if (sombre) ton = 0.44 - ton;
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
                // Près de l'horizon, le champ a le ton de la garrigue, sans
                // rangs : ils y seraient plus fins qu'un point. En
                // descendant, le rang fonce et l'entre-rang s'éclaircit, l'un
                // et l'autre progressivement, si bien que les rangs sortent
                // du ton commun au lieu de commencer sur une ligne.
                var sortie = lisse(0.02, 0.7, p);
                var plein = 0.24 + (0.52 * rang - 0.24) * sortie;   // le rang
                var vide = 0.24 * (1 - sortie);                     // l'entre-rang
                ton = (rang > 0 ? plein : vide) * (1 - 0.22 * lisse(0.6, 1, p));
            }

            // Un seuil bas : les points s'éteignent en rétrécissant, pas d'un coup
            // sur une même rangée, ce qui y tracerait une ligne.
            if (ton < 0.003) continue;
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
