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
//   · devant elle, le plan du milieu, en deux aplats nets pour qu'il se
//     lise d'un coup : au loin une ligne de collines claires, unies ;
//     devant, une haie d'arbres sombre, au faîte festonné, qui borde le
//     champ ;
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
    // Les lumières : une seconde encre, claire, pour ce que le soleil touche.
    // L'encre grise dessine les ombres ; celle-ci pose des points blancs sur
    // le papier (en sombre, des points plus vifs que les autres).
    var lumiere = 'rgba(255, 249, 238, 0.6)', lx, ly, lr;
    var boucle = 0, dernier = 0, debut = -1;
    // L'apparition : au premier dessin, les points se développent depuis
    // l'horizon vers les bords, comme une image qui monte dans le bain du
    // tirage. Le texte de la page attend la fin (--intro, styles/accueil.css).
    var INTRO = 1.4;

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
        lx = new Float32Array(n); ly = new Float32Array(n); lr = new Float32Array(n);
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
        lumiere = sombre ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 249, 238, 0.6)';
    }

    // La crête, relevée sur une photo prise du sud : à l'ouest une longue
    // pente douce, puis la face qui se redresse ; en haut un faîte presque
    // plat mais accidenté, jusqu'au pic de la Croix (u = 0,639) ; à l'est un
    // second palier, puis la chute raide. [part de la largeur, hauteur 0 à 1]
    var CRETE = [
        [0.000, 0.300], [0.070, 0.420], [0.150, 0.587], [0.201, 0.651], [0.261, 0.689],
        [0.320, 0.753], [0.362, 0.791], [0.396, 0.821], [0.405, 0.842], [0.430, 0.880],
        [0.473, 0.906], [0.507, 0.944], [0.532, 0.982], [0.558, 0.964], [0.592, 0.974],
        [0.626, 0.990], [0.639, 1.000], [0.660, 0.931], [0.677, 0.893], [0.703, 0.885],
        [0.728, 0.855], [0.745, 0.829], [0.779, 0.829], [0.822, 0.821], [0.847, 0.778],
        [0.864, 0.663], [0.890, 0.548], [0.915, 0.472], [0.941, 0.421], [0.958, 0.383],
        [0.975, 0.306], [1.000, 0.230]
    ];
    function profil(u) {
        if (u <= 0) return CRETE[0][1];
        if (u >= 1) return CRETE[CRETE.length - 1][1];
        for (var k = 1; k < CRETE.length; k++) {
            if (u <= CRETE[k][0]) {
                var a = CRETE[k - 1], b = CRETE[k];
                var t = (u - a[0]) / (b[0] - a[0]);
                t = 0.5 * t + 0.5 * t * t * (3 - 2 * t);   // à peine adouci : le calcaire garde ses ressauts
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

    // Les nuages : un bruit lisse, à deux échelles, qui dérive lentement. Dans
    // le ciel il pose de petits nuages clairs, au ventre un peu gris ; au
    // sol, leur ombre glisse sur le paysage. C'est le seul mouvement du
    // fond : la lumière qui change.
    function bruitLisse(x, y) {
        var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
        fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
        var a = hasard(i, j), b = hasard(i + 1, j), c = hasard(i, j + 1), d = hasard(i + 1, j + 1);
        return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    function nuage(x, y, seuil) {
        var n = 0.65 * bruitLisse(x, y) + 0.35 * bruitLisse(x * 2.3 + 7.1, y * 2.3 + 3.4);
        n = (n - seuil) / 0.13;
        n = n < 0 ? 0 : n > 1 ? 1 : n;
        return n * n * (3 - 2 * n);
    }

    function lisse(a, b, x) {
        var t = (x - a) / (b - a);
        t = t < 0 ? 0 : (t > 1 ? 1 : t);
        return t * t * (3 - 2 * t);
    }

    function tracer(maintenant) {
        boucle = 0;
        if (!SEUIL.matches || !ctx) return;
        if (debut < 0) debut = maintenant;
        var e = CALME.matches ? INTRO : (maintenant - debut) / 1000;   // le temps depuis l'apparition
        if (e >= INTRO && maintenant - dernier < CADENCE) { reveiller(); return; }
        dernier = maintenant;
        var t = CALME.matches ? 0 : maintenant / 1000;

        // La scène : l'horizon sous le milieu, le point de fuite au centre
        // de l'espace libre, la montagne posée sur l'horizon.
        var hy = hauteur * 0.5, vx = largeur * 0.56;
        var mg = -largeur * 0.24, ml = largeur * 1.1;    // la montagne : bord gauche, largeur
        var mh = hauteur * 0.36;                          // sa hauteur au sommet
        var pied = hy - hauteur * 0.07;                   // où elle disparaît derrière les collines
        var sx = mg + ml * 0.639, sy = pied - mh;         // le sommet
        var bas = hauteur - hy;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();
        var nl = 0;

        for (var i = 0; i < xs.length; i++) {
            var x = xs[i], y = ys[i], ton = 0, eclat = 0;

            var u = (x - mg) / ml;
            var sommet = pied - mh * profil(u);
            // Le plan du milieu : les collines au loin, la haie devant.
            var col1 = hy - hauteur * (0.095 + 0.03 * Math.sin(x * 0.0052 + 0.8) + 0.014 * Math.sin(x * 0.0145 + 2.1));
            var col2 = hy - hauteur * (0.034 + 0.012 * Math.sin(x * 0.0061 + 3.3) + 0.02 * Math.abs(Math.sin(x * 0.047)) + 0.011 * Math.abs(Math.sin(x * 0.113 + 1.3)));

            // Les cyprès : une flamme étroite, plus large au tiers du bas.
            var cypres = 0;
            for (var c = 0; c < CYPRES.length; c++) {
                var cxp = CYPRES[c][0] * largeur, ch = CYPRES[c][1] * hauteur;
                var v = (hy - y) / ch;                       // 0 au pied, 1 à la pointe
                if (v < 0 || v > 1) continue;
                var demiL = hauteur * 0.013 * Math.sin(Math.PI * Math.pow(v, 0.62)) * (1 - v * 0.2);
                if (Math.abs(x - cxp) < demiL) cypres = 0.62;
            }

            if (cypres) {
                ton = cypres;
            } else if (y >= col2 && y < hy) {
                // La haie : un aplat sombre, qui rejoint en bas le ton du
                // champ. Son faîte accroche la lumière.
                var d2 = y - col2;
                ton = 0.44 - 0.2 * lisse(0, hy - col2, d2);
                if (d2 < 5) { ton = 0.12; eclat = 0.3; }
            } else if (y >= col1 && y < col2) {
                // Les collines : un aplat clair, à peine plus dense vers le
                // bas, sous une crête fine.
                var d1 = y - col1;
                ton = 0.11 + 0.05 * lisse(0, hauteur * 0.06, d1);
                if (d1 < 5) ton = 0.24;
            } else if (y >= sommet && y < col1) {
                // La face. Son ombre vient de la pente de la crête au-dessus :
                // là où la crête descend vers l'est, le versant tourne le dos
                // au soleil.
                // La pente est prise large : une ombre qui suivrait chaque ressaut
                // de la crête tomberait en colonnes droites.
                var pente = (profil(u + 0.05) - profil(u - 0.05)) / 0.1;
                var ombre = lisse(-0.2, -1.6, pente);               // 0 au soleil, 1 à l'ombre
                // L'ombre suit le versant en descendant : sous le sommet, le
                // partage entre les deux côtés penche vers l'est.
                var prof = (y - sommet) / Math.max(1, pied - sommet);
                var partage = sx + (y - sy) * 0.9;
                ombre = Math.max(ombre * (1 - 0.7 * prof), lisse(-90, 150, x - partage) * 0.7);
                // Les touches : orientées comme les plans, plus serrées en
                // haut, où la roche est nue.
                var pinceau = touche(x, y, ombre > 0.4 ? 0.55 : -0.45, 30 + 30 * prof, 11);
                // Le pied se perd dans une brume claire : les collines de devant
                // s'y détachent.
                var brume = lisse(0.7, 1, prof);
                ton = (0.09 + 0.22 * ombre + (0.12 + 0.1 * ombre) * pinceau) * (1 - 0.6 * brume);
                // Le versant au soleil : les touches les plus claires passent
                // en lumière, comme les blancs laissés dans le tableau.
                eclat = 0.4 * (1 - ombre) * (1 - ombre) * lisse(0.05, 0.4, -pinceau) * (1 - brume);
                // Les deux arêtes qui descendent du sommet, en traits plus
                // sombres, et quelques plis plus loin.
                var ax = x - sx, ay = y - sy;
                var dist1 = Math.abs(ay - (-ax) * 0.95) / 1.38;                // pente descendant à gauche
                var dist2 = Math.abs(ay - ax * 1.6) / 1.89;                    // pente descendant à droite
                if (ax < 0 && ay > 0 && dist1 < 4) ton = Math.max(ton, 0.3 * (1 - prof));
                if (ax > 0 && ay > 0 && dist2 < 4) ton = Math.max(ton, 0.34 * (1 - prof));
                // L'arête se lit par une ligne de points un peu plus forts.
                if (y - sommet < 7) { ton = Math.max(ton, 0.34); eclat = 0; }
                if (ton < 0.03) ton = 0.03;
                // En sombre, l'encre est claire : elle dessine la lumière.
                if (sombre) ton = 0.44 - ton;
            } else if (y < hy) {
                // Le ciel, qui se charge vers le haut.
                var haut = 1 - y / hy;
                ton = 0.055 + 0.11 * haut * haut;
                // Les nuages : petits, clairs, le ventre un peu gris.
                var nx = x / hauteur * 4.4 - t * 0.06, ny = y / hauteur * 10.5;
                var blanc = nuage(nx, ny, 0.56);
                if (blanc > 0) {
                    var ventre = blanc - nuage(nx, ny - 0.32, 0.56);
                    if (ventre < 0) ventre = 0;
                    ton = ton * (1 - blanc) + (sombre ? 0 : 0.32 * ventre);
                    eclat = 0.42 * blanc * (1 - 0.8 * ventre);
                }
            } else {
                // La lavande. La profondeur suit l'inverse de la distance à
                // l'horizon ; la coordonnée de rang suit la perspective.
                var p = (y - hy) / bas;                       // 0 à l'horizon, 1 en bas
                var prof = 1 / (p + 0.02);
                var X = (x - vx) / (p + 0.02) / largeur;      // position dans le champ
                var u = X * 4;
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
                // Chaque rang a son flanc au soleil : un liseré de lumière
                // du côté d'où elle vient.
                var flanc = lisse(0.275, 0.3, f) * (1 - lisse(0.36, 0.43, f)) * sortie;
                eclat = 0.5 * flanc * touffe;
                ton *= 1 - 0.85 * flanc;
                // L'ombre des nuages court sur le champ, en perspective.
                var os = nuage(X * 1.1 - t * 0.04, prof * 0.3, 0.54) * sortie;
                ton *= sombre ? 1 - 0.4 * os : 1 + 0.45 * os;
                eclat *= 1 - os;
            }

            // L'ombre des nuages sur la montagne et les collines.
            if (y < hy && y >= Math.min(sommet, col1)) {
                var ot = nuage(x / hauteur * 3.2 - t * 0.045 + 0.4, y / hauteur * 6 + 1.7, 0.54);
                ton *= sombre ? 1 - 0.4 * ot : 1 + 0.45 * ot;
                if (!sombre) ton += 0.03 * ot;
                eclat *= 1 - ot;
            }

            // Un seuil bas : les points s'éteignent en rétrécissant, pas d'un coup
            // sur une même rangée, ce qui y tracerait une ligne.
            if (ton < 0.003 && eclat < 0.02) continue;
            var paru = 1;
            if (e < INTRO) {
                var ox = (x - vx) / largeur, oy = (y - hy) * 1.6 / largeur;
                var retard = 0.8 * Math.min(1, Math.sqrt(ox * ox + oy * oy) / 0.75) + 0.08 * hasard(i, 7);
                paru = lisse(retard, retard + 0.5, e);
            }
            if (eclat >= 0.02) {
                var rl = RAYON_MAX * Math.sqrt(eclat > 1 ? 1 : eclat) * paru;
                if (rl >= 0.3) { lx[nl] = x; ly[nl] = y; lr[nl] = rl; nl += 1; }
            }
            if (ton < 0.003) continue;
            var r = RAYON_MAX * Math.sqrt(ton > 1 ? 1 : ton) * paru;
            if (r < 0.2) continue;
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, 6.2832);
        }
        ctx.fill();

        // Les lumières, par-dessus.
        if (nl) {
            ctx.fillStyle = lumiere;
            ctx.beginPath();
            for (var q = 0; q < nl; q++) {
                ctx.moveTo(lx[q] + lr[q], ly[q]);
                ctx.arc(lx[q], ly[q], lr[q], 0, 6.2832);
            }
            ctx.fill();
        }
        if (!CALME.matches || e < INTRO) reveiller();
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
