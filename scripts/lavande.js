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
//   · à droite, un aqueduc romain en volume : il entre par le bas de
//     l'écran, au premier plan, puis tourne et s'en va vers le milieu, sur
//     deux rangs d'arches, et finit en ruine ;
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
    var lumiere = 'rgba(255, 249, 238, 0.36)', lx, ly, lr;
    var boucle = 0, dernier = 0, debut = -1;
    // L'apparition : au premier dessin, les points se développent depuis
    // l'horizon vers les bords, comme une image qui monte dans le bain du
    // tirage. Le texte de la page attend la fin (--intro, styles/accueil.css).
    var INTRO = 0.9;

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
        encre = 'rgba(' + rgb + ', ' + (sombre ? 0.17 : 0.145) + ')';
        ruPret = false;      // les tons de la ruine dépendent du thème et de la trame
        lumiere = sombre ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 249, 238, 0.36)';
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

    // Les collines : des dos ronds qui se recouvrent, du plus lointain au plus
    // proche. [centre, demi-largeur (parts de la largeur de l'écran), hauteur
    // (part de sa hauteur)]. Chacune a son côté au soleil, à gauche, et son
    // côté à l'ombre : c'est ce modelé qui les fait lire comme des collines.
    var COLLINES = [[0.33, 0.30, 0.17], [0.83, 0.27, 0.15], [0.04, 0.2, 0.135], [0.58, 0.2, 0.11], [1.0, 0.16, 0.12]];

    // ------------------------------------------------------------------
    // La ruine du premier plan
    // ------------------------------------------------------------------
    //
    // Un aqueduc romain, modelé en volume et vu par le même œil que le
    // champ. Il entre par le bas de l'écran, à droite, tout près, puis
    // tourne et s'éloigne vers le milieu, où il finit en ruine. Deux rangs
    // d'arches, un cordon entre les deux, une corniche au sommet. L'unité est
    // la hauteur de l'œil au-dessus du sol. Le soleil vient de la gauche,
    // comme sur la montagne.
    //
    // pierres() donne la distance à la pierre la plus proche (et dans
    // abscisse, la position le long de l'ouvrage) ; un rayon parti de
    // chaque point de la trame avance jusqu'à la toucher. Rien ne bouge :
    // tout est calculé une fois par mise en page.

    // Son tracé, au sol : une courbe de Bézier, de l'avant à droite vers le
    // fond : elle part à droite, puis tourne et revient vers le milieu.
    var TRACE = (function () {
        var p0 = [1.75, 0.95], p1 = [3.6, 3.6], p2 = [1.7, 10.5], n = 32, pts = [], l = 0;
        for (var k = 0; k <= n; k++) {
            var t = k / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
            var x = a * p0[0] + b * p1[0] + c * p2[0], z = a * p0[1] + b * p1[1] + c * p2[1];
            if (k) l += Math.sqrt((x - pts[k - 1][0]) * (x - pts[k - 1][0]) + (z - pts[k - 1][1]) * (z - pts[k - 1][1]));
            pts.push([x, z, l]);
        }
        return pts;
    })();
    var LONGUEUR = TRACE[TRACE.length - 1][2], ECHELLE = 0.62;
    var abscisse = 0, matiere = 0;

    function pierres(px, py, pz) {
        // Le point du tracé le plus proche : l'écart à l'axe, et l'abscisse.
        var best = 1e9, sBest = 0;
        for (var k = 1; k < TRACE.length; k++) {
            var ax = TRACE[k - 1][0], az = TRACE[k - 1][1], bx = TRACE[k][0], bz = TRACE[k][1];
            var ex = bx - ax, ez = bz - az, l2 = ex * ex + ez * ez;
            var t = ((px - ax) * ex + (pz - az) * ez) / l2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            var dx = px - ax - ex * t, dz = pz - az - ez * t, d2 = dx * dx + dz * dz;
            if (d2 < best) { best = d2; sBest = TRACE[k - 1][2] + (TRACE[k][2] - TRACE[k - 1][2]) * t; }
        }
        // L'ouvrage est dessiné à l'échelle ECHELLE : ses proportions restent
        // les mêmes, il monte juste un peu au-dessus de l'horizon.
        var K = ECHELLE;
        var ecart = Math.sqrt(best) / K, sv = sBest / K;
        py = py / K;
        abscisse = sv;
        matiere = 0;
        // La hauteur : 2,1 ; vers le bout, l'ouvrage tombe par gradins.
        var H = 2.1;
        var ruine = sv - (LONGUEUR / K - 3.2);
        if (ruine > 0) H = Math.max(0.35, 2.1 - Math.floor(ruine / 0.55) * 0.36 - 0.12 * hasard(Math.floor(sv / 0.3), 2));
        // Le mur, la corniche au sommet, le cordon entre les deux rangs.
        var d = Math.max(ecart - 0.26, py - H, -py - 0.1);
        var m = Math.max(ecart - 0.33, Math.abs(py - (H - 0.05)) - 0.05, py - H);
        if (H > 1.9 && m < d) d = m;
        m = Math.max(ecart - 0.34, Math.abs(py - 1.42) - 0.045);
        if (H > 1.42 && m < d) d = m;
        // Les grandes arches du bas.
        var L = 1.2, r = 0.42, sm = ((sv % L) + L) % L - L / 2;
        var o = Math.min(Math.max(Math.abs(sm) - r, py - 0.95), Math.sqrt(sm * sm + (py - 0.95) * (py - 0.95)) - r);
        d = Math.max(d, -o);
        // Les petites arches du haut, deux par grande.
        var L2 = L / 2, r2 = 0.15, sm2 = ((sv % L2) + L2) % L2 - L2 / 2;
        var o2 = Math.min(Math.max(Math.abs(sm2) - r2, Math.abs(py - 1.68) - 0.12), Math.sqrt(sm2 * sm2 + (py - 1.8) * (py - 1.8)) - r2);
        d = Math.max(d, -o2);
        return d * K;
    }
    // Avance le long du rayon ; renvoie la distance du premier contact, ou -1.
    function toucher(ox, oy, oz, dx, dy, dz, jusque) {
        var t = 0;
        for (var n = 0; n < 110; n++) {
            var d = pierres(ox + dx * t, oy + dy * t, oz + dz * t);
            if (d < 0.008) return t;
            t += d < 0.02 ? 0.02 : (d > 0.6 ? 0.36 : d * 0.6);
            if (t > jusque) return -1;
        }
        return -1;
    }

    // Par point de la trame : le ton de la ruine (-1 hors d'elle), sa
    // lumière, et si le sol y est dans son ombre portée.
    var ruTon, ruEclat, ruOmbre, ruPret = false;
    function preparerRuine() {
        var n = xs.length;
        if (!ruTon || ruTon.length !== n) { ruTon = new Float32Array(n); ruEclat = new Float32Array(n); ruOmbre = new Uint8Array(n); }
        // L'œil du champ : à hauteur 1, l'horizon à hy, le point de fuite à vx.
        var hy = hauteur * 0.5, vx = largeur * 0.56, bas = hauteur - hy;
        // Le soleil : de face et de la gauche, haut. La façade est en pleine
        // lumière, le pignon dans un demi-jour, les jours restent noirs.
        var lx0 = -0.4, ly0 = 0.7, lz0 = -0.62, ln = Math.sqrt(lx0 * lx0 + ly0 * ly0 + lz0 * lz0);
        lx0 /= ln; ly0 /= ln; lz0 /= ln;
        var e = 0.006;
        // Le rayon qui passe par le point (x, y) de l'écran : sa direction
        // dans R, et ce qu'il touche avant le sol (ou -1).
        var R = [0, 0, 0];
        function viser(x, y) {
            var dx = (x - vx) / bas, dy = -((y - hy) / bas + 0.02), dn = Math.sqrt(dx * dx + dy * dy + 1);
            R[0] = dx / dn; R[1] = dy / dn; R[2] = 1 / dn;
            var t = toucher(0, 1, 0, R[0], R[1], R[2], 18);
            var sol = R[1] < -0.0005 ? -1 / R[1] : 1e9;
            return (t >= 0 && t < sol) ? t : -1;
        }

        for (var i = 0; i < n; i++) {
            ruTon[i] = -1; ruEclat[i] = 0; ruOmbre[i] = 0;
            var x = xs[i], y = ys[i];
            if (x < vx + bas * 0.35 || y < hy - bas * 0.95) continue;
            var t = viser(x, y);
            var dx = R[0], dy = R[1], dz = R[2];
            if (t >= 0) {
                var px = dx * t, py = 1 + dy * t, pz = dz * t;
                var nx = pierres(px + e, py, pz) - pierres(px - e, py, pz);
                var ny = pierres(px, py + e, pz) - pierres(px, py - e, pz);
                var nz = pierres(px, py, pz + e) - pierres(px, py, pz - e);
                var feuille = matiere === 1, tuile = matiere === 2;
                var nn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
                nx /= nn; ny /= nn; nz /= nn;
                var jour = nx * lx0 + ny * ly0 + nz * lz0;
                if (jour < 0) jour = 0;
                if (jour > 0 && toucher(px + nx * 0.05, py + ny * 0.05, pz + nz * 0.05, lx0, ly0, lz0, 8) >= 0) jour = 0;
                var clair, grain;
                if (feuille) {
                    // Le feuillage : sombre, modelé en boule, moucheté.
                    clair = 0.75 * jour;
                    grain = bruitLisse(px * 9, py * 9 + pz * 9) - 0.5;
                    ruTon[i] = sombre ? 0.22 + 0.5 * clair + 0.2 * grain : 0.34 + 0.56 * (1 - clair) + 0.22 * grain;
                } else {
                    // La pierre, en trois valeurs franches : le pignon et le
                    // toit en plein soleil, la façade dans un demi-jour, le
                    // reste à l'ombre. Chaque pierre a son ton.
                    clair = jour * 1.5;
                    if (clair > 1) clair = 1;
                    var matiereMur;
                    if (tuile) {
                        // Les tuiles : des rangs qui courent le long de la pente,
                        // un sur deux plus sombre, quelques-unes manquantes.
                        var rangT = Math.floor((pz - MZ) / 0.15);
                        matiereMur = (rangT % 2 ? 0.1 : -0.08) + 0.16 * (hasard(Math.floor(px / 0.2), rangT) - 0.5);
                    } else {
                        // Le mur : des assises de pierres inégales, chacune avec
                        // son ton ; par endroits l'enduit est resté, plus clair ;
                        // le pied est noirci par la terre, le haut par l'ombre
                        // de l'égout.
                        var rang = Math.floor(py / ECHELLE / 0.29);
                        var le = abscisse / 0.5 + rang * 0.5;
                        grain = hasard(Math.floor(le + 0.3 * hasard(rang, 8)), rang) - 0.5;
                        var enduit = bruitLisse(abscisse * 1.4 + 5, py / ECHELLE * 1.9) - 0.5;
                        matiereMur = 0.46 * grain + (enduit > 0.06 ? -0.13 : 0.1)
                            + 0.16 * (1 - lisse(0, 0.4, py / ECHELLE)) + 0.12 * lisse(1.88, 2.06, py / ECHELLE);
                    }
                    ruTon[i] = sombre ? 0.1 + 0.68 * clair - 0.5 * matiereMur : 0.27 + 0.58 * (1 - clair) + matiereMur;
                    if (ruTon[i] < 0.04) ruTon[i] = 0.04;
                    // La lumière ne se pose que sur les pierres les plus claires : posée
                    // partout, elle effacerait le grain du mur.
                    ruEclat[i] = clair > 0.8 && matiereMur < -0.1 ? 0.16 : 0;
                    // Le contour : là où le rayon voisin passe à côté de la
                    // pierre, ou touche bien plus loin, on est sur une arête.
                    // Un trait la dessine, comme la crête de la montagne.
                    var arete = false;
                    for (var v = 0; v < 3 && !arete; v++) {
                        var tv = viser(x + (v === 0 ? -5 : v === 1 ? 5 : 0), y - (v === 2 ? 5 : 0));
                        if (tv < 0 || Math.abs(tv - t) > 0.3) arete = true;
                    }
                    if (arete) { ruTon[i] = sombre ? 0.03 : 0.84; ruEclat[i] = 0; }
                }
            } else if (dy < -0.0005) {
                var sol = -1 / dy, gx = dx * sol, gz = dz * sol;
                if (toucher(gx, 0.02, gz, lx0, ly0, lz0, 8) >= 0) ruOmbre[i] = 1;
            }
        }
        ruPret = true;
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
    // Les deux échelles ne vont pas à la même allure : le détail glisse sur
    // la masse, si bien qu'un nuage change de forme en avançant.
    var temps = 0;
    function nuage(x, y, seuil) {
        var n = 0.65 * bruitLisse(x, y + temps * 0.012)
            + 0.35 * bruitLisse(x * 2.3 + 7.1 + temps * 0.05, y * 2.3 + 3.4 - temps * 0.035);
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
        // Le cabanon se calcule avant que l'apparition commence : sinon ce
        // calcul mangerait ses premières images et elle partirait d'un saut.
        if (!ruPret) { preparerRuine(); reveiller(); return; }
        if (debut < 0) debut = maintenant;
        var e = CALME.matches ? INTRO : (maintenant - debut) / 1000;   // le temps depuis l'apparition
        if (e >= INTRO && maintenant - dernier < CADENCE) { reveiller(); return; }
        dernier = maintenant;
        var t = CALME.matches ? 0 : maintenant / 1000;
        temps = t;

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
            var x = xs[i], y = ys[i], ton = 0, eclat = 0, bord = 0;

            var u = (x - mg) / ml;
            var sommet = pied - mh * profil(u);
            // Le plan du milieu : les collines au loin, la haie devant.
            // col1 est le haut des collines à cet endroit ; colline, celle qui
            // est devant ; versant, de -1 (son bord gauche) à 1 (son bord droit).
            var col1 = hy, colline = -1, hautColline = hy, versant = 0;
            for (var k = 0; k < COLLINES.length; k++) {
                var ecart = (x / largeur - COLLINES[k][0]) / COLLINES[k][1];
                if (ecart <= -1 || ecart >= 1) continue;
                var dos = Math.cos(ecart * 1.5708);
                var haut1 = hy - hauteur * COLLINES[k][2] * Math.pow(dos, 1.25);
                if (haut1 < col1) col1 = haut1;
                if (y >= haut1) { colline = k; hautColline = haut1; versant = ecart; }
            }
            // La haie n'est pas un mur droit : elle monte en bosquets, retombe
            // presque à ras du champ, et son faîte reste festonné.
            var bosquet = 0.3 + 0.7 * lisse(-0.5, 0.6, Math.sin(x * 0.0037 + 0.6) + 0.55 * Math.sin(x * 0.0091 + 2.2));
            var col2 = hy - hauteur * bosquet * (0.04 + 0.018 * Math.sin(x * 0.0061 + 3.3) + 0.024 * Math.abs(Math.sin(x * 0.047)) + 0.012 * Math.abs(Math.sin(x * 0.113 + 1.3)));

            // Les cyprès : une flamme étroite, plus large au tiers du bas.
            var cypres = 0;
            for (var c = 0; c < CYPRES.length; c++) {
                var cxp = CYPRES[c][0] * largeur, ch = CYPRES[c][1] * hauteur;
                var v = (hy - y) / ch;                       // 0 au pied, 1 à la pointe
                if (v < 0 || v > 1) continue;
                var demiL = hauteur * 0.013 * Math.sin(Math.PI * Math.pow(v, 0.62)) * (1 - v * 0.2);
                if (Math.abs(x - cxp) < demiL) cypres = 0.85;
            }

            // La ruine, entre les expérimentations et les outils.
            if (ruTon[i] >= 0) {
                ton = ruTon[i]; eclat = ruEclat[i];
            } else if (cypres) {
                ton = cypres;
            } else if (y >= col2 && y < hy) {
                // La haie : un aplat sombre, qui rejoint en bas le ton du
                // champ. Son faîte accroche la lumière.
                var d2 = y - col2;
                ton = 0.6 - 0.18 * lisse(0, hy - col2, d2);
                // Son faîte : un trait plein, sur une rangée entière de points.
                if (d2 < 9.5) bord = 0.66;
            } else if (colline >= 0 && y < hy) {
                // Une colline : claire du côté du soleil, plus dense en
                // tournant vers la droite et vers son pied ; les plus proches
                // sont un peu plus sombres.
                var d1 = y - hautColline;
                var aOmbre = lisse(-0.35, 0.85, versant);
                ton = 0.17 + 0.27 * aOmbre + 0.08 * lisse(0, hauteur * 0.07, d1) + 0.025 * colline;
                eclat = 0.22 * (1 - lisse(-0.7, 0.1, versant)) * (1 - lisse(0, hauteur * 0.035, d1));
                if (d1 < 9.5) bord = 0.44;
                // Juste derrière la haie, la colline s'éclaircit : la haie
                // se détache.
                ton *= 0.6 + 0.4 * lisse(0, 20, col2 - y);
            } else if (y >= sommet && y < hy) {
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
                // La crête : un trait franc sur une rangée, une seconde plus
                // légère dessous. C'est elle qui découpe la montagne sur le ciel.
                if (y - sommet < 9.5) bord = 0.42;
                else if (y - sommet < 19) ton = Math.max(ton, 0.14);
                if (ton < 0.03) ton = 0.03;
                // En sombre, l'encre est claire : elle dessine la lumière.
                if (sombre) ton = 0.44 - ton;
            } else if (y < hy) {
                // Le ciel, qui se charge vers le haut.
                var haut = 1 - y / hy;
                ton = 0.055 + 0.11 * haut * haut;
                // Au ras des reliefs, le ciel se vide : un liseré de papier
                // nu qui détache leur silhouette.
                var ras = 0.45 + 0.55 * lisse(0, 20, Math.min(sommet, col1, col2) - y);
                // Les nuages : petits, clairs, le ventre un peu gris.
                var nx = x / hauteur * 4.4 - t * 0.06, ny = y / hauteur * 10.5;
                var blanc = nuage(nx, ny, 0.56);
                if (blanc > 0) {
                    var ventre = blanc - nuage(nx, ny - 0.32, 0.56);
                    if (ventre < 0) ventre = 0;
                    ton = ton * (1 - blanc) + (sombre ? 0 : 0.32 * ventre);
                    eclat = 0.42 * blanc * (1 - 0.8 * ventre);
                }
                ton *= ras; eclat *= ras;
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
                // Le rang est un volume : son flanc à l'ombre, à droite, est
                // plus dense que son dos. Et le premier plan est le plus
                // contrasté : c'est lui qui donne la profondeur.
                var epaule = 1 + 0.45 * lisse(0.5, 0.66, f);
                var plein = 0.24 + (0.6 * rang * epaule - 0.24) * sortie;   // le rang
                var vide = 0.24 * (1 - sortie);                               // l'entre-rang
                ton = rang > 0 ? plein : vide;
                // Chaque rang a son flanc au soleil : un liseré de lumière
                // du côté d'où elle vient.
                var flanc = lisse(0.275, 0.3, f) * (1 - lisse(0.36, 0.43, f)) * sortie;
                eclat = 0.5 * flanc * touffe;
                ton *= 1 - 0.85 * flanc;
                // L'ombre des nuages court sur le champ, en perspective.
                var os = nuage(X * 1.1 - t * 0.04, prof * 0.3, 0.54) * sortie;
                ton *= sombre ? 1 - 0.4 * os : 1 + 0.45 * os;
                eclat *= 1 - os;
                // L'ombre portée de l'aqueduc.
                if (ruOmbre[i]) { ton = sombre ? ton * 0.3 : Math.min(1, ton * 0.6 + 0.42); eclat = 0; }
            }

            // L'ombre des nuages sur la montagne et les collines.
            if (y < hy && y >= Math.min(sommet, col1)) {
                var ot = nuage(x / hauteur * 3.2 - t * 0.045 + 0.4, y / hauteur * 6 + 1.7, 0.54);
                ton *= sombre ? 1 - 0.4 * ot : 1 + 0.45 * ot;
                if (!sombre) ton += 0.03 * ot;
                eclat *= 1 - ot;
            }
            // Les silhouettes passent après les nuages : ni ombre ni lumière
            // ne les efface. En sombre, le trait est clair.
            if (bord) { ton = bord; eclat = 0; }

            // Un seuil bas : les points s'éteignent en rétrécissant, pas d'un coup
            // sur une même rangée, ce qui y tracerait une ligne.
            if (ton < 0.003 && eclat < 0.02) continue;
            var paru = 1;
            if (e < INTRO) {
                var ox = (x - vx) / largeur, oy = (y - hy) * 1.6 / largeur;
                // Une onde large et douce : les points voisins grandissent
                // presque ensemble, le front n'est pas une ligne.
                var retard = 0.34 * Math.min(1, Math.sqrt(ox * ox + oy * oy) / 0.75) + 0.03 * hasard(i, 7);
                paru = lisse(retard, retard + 0.52, e);
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
