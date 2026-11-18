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
    var encre = 'rgba(26, 26, 26, 0.12)', sombre = false, papier = '#F9F4EF', encreVoile = 'rgba(26, 26, 26, 0.3)';
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
        encreVoile = 'rgba(' + rgb + ', ' + (sombre ? 0.22 : 0.2) + ')';
        papier = (getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#F9F4EF').trim();
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

    // Son tracé, au sol : un C ouvert vers la droite. Il entre par la droite,
    // au premier plan, vient vers le milieu, tourne, et repart vers la
    // droite, au fond. L'ouvrage est bas, moins haut que l'œil : on le voit
    // d'un peu haut, le bras du fond par-dessus celui de devant, et le C se
    // lit en entier.
    var TRACE = (function () {
        var p0 = [2.6, 0.9], c1 = [2.9, 7], c2 = [1.0, 10.5], p3 = [10, 9.2], n = 44, pts = [], l = 0;
        for (var k = 0; k <= n; k++) {
            var t = k / n, q = 1 - t, a = q * q * q, b = 3 * q * q * t, c = 3 * q * t * t, d = t * t * t;
            var x = a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0], z = a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1];
            if (k) l += Math.sqrt((x - pts[k - 1][0]) * (x - pts[k - 1][0]) + (z - pts[k - 1][1]) * (z - pts[k - 1][1]));
            pts.push([x, z, l]);
        }
        return pts;
    })();
    var ECHELLE = 0.7;
    var abscisse = 0;

    function pierres(px, py, pz) {
        // Le point du tracé le plus proche : l'écart à l'axe, et l'abscisse.
        var best = 1e9, sv = 0;
        for (var k = 1; k < TRACE.length; k++) {
            var ax = TRACE[k - 1][0], az = TRACE[k - 1][1], bx = TRACE[k][0], bz = TRACE[k][1];
            var ex = bx - ax, ez = bz - az, l2 = ex * ex + ez * ez;
            var t = ((px - ax) * ex + (pz - az) * ez) / l2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            var dx = px - ax - ex * t, dz = pz - az - ez * t, d2 = dx * dx + dz * dz;
            if (d2 < best) { best = d2; sv = TRACE[k - 1][2] + (TRACE[k][2] - TRACE[k - 1][2]) * t; }
        }
        var K = ECHELLE, ecart = Math.sqrt(best) / K;
        sv /= K; py /= K;
        abscisse = sv;
        var H = 2.1;
        // Le mur, et sa corniche qui déborde au sommet.
        var d = Math.max(ecart - 0.24, py - H, -py - 0.1);
        var m = Math.max(ecart - 0.31, Math.abs(py - (H - 0.07)) - 0.07);
        if (H > 1.9 && m < d) d = m;
        // Un seul rang de hautes arches : peu de formes, et grandes, pour
        // que la trame puisse les dire.
        var L = 1.3, r = 0.46, sm = ((sv % L) + L) % L - L / 2;
        var o = Math.min(Math.max(Math.abs(sm) - r, py - 1.2), Math.sqrt(sm * sm + (py - 1.2) * (py - 1.2)) - r);
        return Math.max(d, -o) * K;
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
            if (x < vx - bas * 0.1 || y < hy - bas * 0.95) continue;
            var t = viser(x, y);
            var dx = R[0], dy = R[1], dz = R[2];
            if (t >= 0) {
                var px = dx * t, py = 1 + dy * t, pz = dz * t;
                var nx = pierres(px + e, py, pz) - pierres(px - e, py, pz);
                var ny = pierres(px, py + e, pz) - pierres(px, py - e, pz);
                var nz = pierres(px, py, pz + e) - pierres(px, py, pz - e);
                var nn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
                nx /= nn; ny /= nn; nz /= nn;
                var jour = nx * lx0 + ny * ly0 + nz * lz0;
                if (jour < 0) jour = 0;
                if (jour > 0 && toucher(px + nx * 0.05, py + ny * 0.05, pz + nz * 0.05, lx0, ly0, lz0, 8) >= 0) jour = 0;
                {
                    // La pierre, en deux valeurs franches : les faces au soleil,
                    // claires, et le dessous des arches, à l'ombre. Un léger
                    // grain d'assises, pas plus : la forme passe avant.
                    var clair = jour;
                    var rang = Math.floor(py / ECHELLE / 0.3);
                    var grain = hasard(Math.floor(abscisse / 0.55 + rang * 0.5), rang) - 0.5;
                    // La pierre au soleil est claire, presque le papier : l'ouvrage se
                    // détache en clair sur le champ, cerné d'un trait, les dessous à l'ombre.
                    ruTon[i] = sombre ? (clair > 0.3 ? 0.78 + 0.1 * grain : 0.12) : (clair > 0.3 ? 0.5 + 0.12 * grain : 0.88);
                    ruEclat[i] = clair > 0.3 && sombre ? 0.5 : 0;
                    // Le contour : là où le rayon voisin passe à côté de la
                    // pierre, ou touche bien plus loin, on est sur une arête.
                    // Un trait la dessine, comme la crête de la montagne.
                    var arete = false;
                    for (var v = 0; v < 3 && !arete; v++) {
                        var tv = viser(x + (v === 0 ? -5 : v === 1 ? 5 : 0), y - (v === 2 ? 5 : 0));
                        if (tv < 0 || Math.abs(tv - t) > 0.3) arete = true;
                    }
                    if (arete) { ruTon[i] = sombre ? 0.03 : 0.95; ruEclat[i] = 0; }
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

    // ------------------------------------------------------------------
    // Les buissons de lavande
    // ------------------------------------------------------------------
    //
    // Chaque buisson est un dôme d'épis, rendu en volume une fois pour toutes
    // (build/buissons-lavande.js) sous trois angles de vue et en trois
    // variantes. Ici on les pose debout sur les rangs, du plus loin au plus
    // proche, à la taille de leur distance : une fois par mise en page.
    var BU_L = 144, BU_H = 96, BU_PX = 42, BU_U0 = -1.3, BU_V0 = 1.29, BU_C = 5;
    var BU_ANGLES = [6, 18, 42], BU_VAR = 3;
    var TERRE = 0.05, TERRE_SOMBRE = 0.1, OMBRE_SOL = 0.6;
    var buMips = null, buEtat = 0, buPret = false, buDemande = false;      // buEtat : 0 en route, 1 reçu, 2 manqué
    var buEncre, buLum, buEclat, CHAMP_UNI = 0.24;

    function chargerBuissons() {
        if (!window.fetch || !window.DecompressionStream) { buEtat = 2; return; }
        fetch('/media/buissons-lavande.bin').then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.arrayBuffer();
        }).then(function (brut) {
            var o = new Uint8Array(brut);
            // Un serveur peut l'avoir déjà décompressé en route.
            if (o[0] !== 0x1f || o[1] !== 0x8b) return brut;
            return new Response(new Blob([brut]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
        }).then(function (b) {
            var d = new Uint8Array(b), n = BU_L * BU_H, N = d.length / BU_C;
            if (N !== BU_VAR * BU_ANGLES.length * n) throw new Error('taille');
            buMips = [];
            for (var s = 0; s < BU_VAR * BU_ANGLES.length; s++) {
                var f = new Float32Array(n * BU_C);
                for (var k = 0; k < n; k++) for (var c = 0; c < BU_C; c++) f[k * BU_C + c] = d[c * N + s * n + k] / 255;
                buMips.push(mipmaps(f));
            }
            buEtat = 1;
        }).catch(function () { buEtat = 2; }).then(function () { buPret = false; reveiller(); });
    }
    // Les réductions de moitié en moitié : un point lointain lit la moyenne de
    // tout ce que sa cellule couvre, pas un pixel au hasard.
    function mipmaps(f) {
        var niveaux = [{ l: BU_L, h: BU_H, d: f }];
        while (niveaux[niveaux.length - 1].l > 4) {
            var p = niveaux[niveaux.length - 1], l = Math.ceil(p.l / 2), h = Math.ceil(p.h / 2), d = new Float32Array(l * h * BU_C);
            for (var y = 0; y < h; y++) for (var x = 0; x < l; x++) for (var c = 0; c < BU_C; c++) {
                var s = 0;
                for (var dy = 0; dy < 2; dy++) for (var dx = 0; dx < 2; dx++) {
                    var xx = 2 * x + dx, yy = 2 * y + dy;
                    if (xx < p.l && yy < p.h) s += p.d[(yy * p.l + xx) * BU_C + c];
                }
                d[(y * l + x) * BU_C + c] = s / 4;
            }
            niveaux.push({ l: l, h: h, d: d });
        }
        return niveaux;
    }
    function lireNiveau(nv, sx, sy, poids, out) {
        var x = sx - 0.5, y = sy - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
        for (var b = 0; b < 2; b++) for (var a = 0; a < 2; a++) {
            var xx = x0 + a, yy = y0 + b;
            if (xx < 0 || yy < 0 || xx >= nv.l || yy >= nv.h) continue;
            var w = poids * (a ? fx : 1 - fx) * (b ? fy : 1 - fy), o = (yy * nv.l + xx) * BU_C;
            for (var c = 0; c < BU_C; c++) out[c] += w * nv.d[o + c];
        }
    }
    function lireSprite(mips, sx, sy, niveau, poids, out) {
        var n0 = Math.min(Math.floor(niveau), mips.length - 1), n1 = Math.min(n0 + 1, mips.length - 1), f = niveau - Math.floor(niveau);
        if (n0 === n1) f = 0;
        lireNiveau(mips[n0], sx / (1 << n0), sy / (1 << n0), poids * (1 - f), out);
        if (f > 0) lireNiveau(mips[n1], sx / (1 << n1), sy / (1 << n1), poids * f, out);
    }

    var tampon = new Float32Array(BU_C);
    function couv(mA, mB, fa, sx, sy, niveau) {
        tampon[0] = tampon[1] = tampon[2] = tampon[3] = tampon[4] = 0;
        lireSprite(mA, sx, sy, niveau, 1 - fa, tampon);
        if (fa > 0) lireSprite(mB, sx, sy, niveau, fa, tampon);
        return tampon[1];
    }

    function preparerBuissons() {
        var n = xs.length;
        if (!buEncre || buEncre.length !== n) { buEncre = new Float32Array(n); buLum = new Float32Array(n); buEclat = new Float32Array(n); }
        buEncre.fill(TERRE); buLum.fill(TERRE_SOMBRE); buEclat.fill(0);
        buPret = true;
        if (!buMips) return;
        var hy = hauteur * 0.5, vx = largeur * 0.56, bas = hauteur - hy;
        var ecart = largeur / (4 * bas);                  // entre deux rangs, en hauteurs d'œil
        var K = 0.7 * ecart / 2.25;                      // un buisson : 2,25 unités de son modèle
        var D = 0.62 * ecart, zMax = Math.min(40, 2.2 * K * bas / 7);
        var liste = [];
        for (var nT = Math.ceil(zMax / D) + 1; nT >= 0; nT--) {
            var zr = (nT + 0.5) * D;
            var nMax = Math.ceil((largeur * 0.6 * zr / bas) / ecart) + 1;
            for (var nR = -nMax; nR <= nMax; nR++) {
                var h1 = hasard(nT, nR), h2 = hasard(nR, nT + 40), h3 = hasard(nT + 7, nR - 3);
                var Z = zr - hasard(nR, 11) * D + (h2 - 0.5) * 0.08;
                if (Z < 0.55 || Z > zMax) continue;
                liste.push(Z, (nR + 0.5 + (h3 - 0.5) * 0.12) * ecart, 0.88 + 0.24 * h1, Math.floor(h2 * BU_VAR) % BU_VAR);
            }
        }
        var ordre = [];
        for (var q = 0; q < liste.length; q += 4) ordre.push(q);
        ordre.sort(function (a, b) { return liste[b] - liste[a]; });

        var rangees = Math.round(hauteur / PAS_Y), pas = hauteur / rangees;
        var centre = largeur / 2, demi = Math.ceil(centre / PAS_X) + 1, parRang = demi * 2 + 1;
        var s = new Float32Array(BU_C);
        for (var oi = 0; oi < ordre.length; oi++) {
            var b = ordre[oi], Z = liste[b], W = liste[b + 1], sc = liste[b + 2], vr = liste[b + 3];
            var bx = vx + W * bas / Z, by = hy + bas * (1 / Z - 0.02);
            var ppu = K * sc * bas / Z;                        // pixels d'écran par unité du modèle
            var gauche = bx + BU_U0 * ppu, droite = bx + (BU_U0 + BU_L / BU_PX) * ppu;
            var haut = by - BU_V0 * ppu, basS = by + (BU_H / BU_PX - BU_V0) * ppu;
            if (droite < 0 || gauche > largeur || haut > hauteur || basS < hy) continue;
            // L'angle sous lequel l'œil le voit, entre deux des rendus.
            var th = Math.atan(1 / Z) * 57.2958, ia = 0;
            while (ia < BU_ANGLES.length - 2 && th > BU_ANGLES[ia + 1]) ia++;
            var fa = (th - BU_ANGLES[ia]) / (BU_ANGLES[ia + 1] - BU_ANGLES[ia]);
            fa = fa < 0 ? 0 : fa > 1 ? 1 : fa;
            var mA = buMips[vr * BU_ANGLES.length + ia], mB = buMips[vr * BU_ANGLES.length + ia + 1];
            var niveau = Math.max(0, Math.log(PAS_X / ppu * BU_PX) / Math.LN2 - 0.5);
            var pasS = PAS_X / ppu * BU_PX, pasV = pas / ppu * BU_PX;     // d'un point à son voisin, dans le rendu
            var j0 = Math.max(0, Math.ceil(Math.max(haut, hy) / pas)), j1 = Math.min(rangees, Math.floor(basS / pas));
            for (var j = j0; j <= j1; j++) {
                var dec = (j % 2) ? PAS_X / 2 : 0, y = j * pas;
                var i0 = Math.max(-demi, Math.ceil((gauche - centre - dec) / PAS_X)), i1 = Math.min(demi, Math.floor((droite - centre - dec) / PAS_X));
                var sy = (BU_V0 - (by - y) / ppu) * BU_PX;
                for (var ii = i0; ii <= i1; ii++) {
                    var x = centre + ii * PAS_X + dec, sx = ((x - bx) / ppu - BU_U0) * BU_PX;
                    s[0] = s[1] = s[2] = s[3] = s[4] = 0;
                    lireSprite(mA, sx, sy, niveau, 1 - fa, s);
                    if (fa > 0) lireSprite(mB, sx, sy, niveau, fa, s);
                    if (s[1] < 0.002 && s[3] < 0.002) continue;
                    var k = j * parRang + ii + demi, vide = 1 - s[1], sh = 0.6 * s[3];
                    // Le buisson couvre ce qui est derrière ; son ombre tombe sur le reste.
                    var e0 = buEncre[k], l0 = buLum[k], c0 = buEclat[k];
                    buEncre[k] = 0.08 * s[1] + s[0] + vide * e0 + sh * (OMBRE_SOL - e0);
                    buLum[k] = Math.max(0, 1.2 * s[2] + vide * l0 - 0.85 * sh * l0);
                    buEclat[k] = Math.max(0, s[4] + vide * c0 - sh * c0);
                    // Son contour, comme la crête et les collines : un trait d'un point,
                    // sauf au pied, où il touche le sol.
                    if (s[1] > 0.5 && (couv(mA, mB, fa, sx - pasS, sy, niveau) < 0.3 || couv(mA, mB, fa, sx + pasS, sy, niveau) < 0.3
                        || couv(mA, mB, fa, sx - pasS / 2, sy - pasV, niveau) < 0.3 || couv(mA, mB, fa, sx + pasS / 2, sy - pasV, niveau) < 0.3)) {
                        buEncre[k] = Math.max(buEncre[k], 0.5); buLum[k] = Math.max(buLum[k], 0.55); buEclat[k] = 0;
                    }
                }
            }
        }
    }

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
        if (buEtat === 0) return;
        if (!buPret) { preparerBuissons(); reveiller(); return; }
        CHAMP_UNI = sombre ? 0.26 : 0.24;
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
                // Les buissons, posés une fois par mise en page. Près de
                // l'horizon, ils se fondent en un ton uni : ils y seraient
                // plus fins qu'un point.
                var sortie = lisse(0.01, 0.22, p);
                var champ = sombre ? buLum[i] : buEncre[i];
                eclat = 0.8 * buEclat[i] * sortie;
                ton = CHAMP_UNI + (champ - CHAMP_UNI) * sortie;
                // L'ombre des nuages court sur le champ, en perspective.
                var os = nuage(X * 1.1 - t * 0.04, prof * 0.3, 0.54) * sortie;
                ton *= sombre ? 1 - 0.4 * os : 1 + 0.45 * os;
                eclat *= 1 - os;
                // L'ombre portée de l'aqueduc.
                if (ruOmbre[i]) { ton = sombre ? ton * 0.6 : Math.min(1, ton * 0.85 + 0.14); eclat = 0; }
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
        voiles(t, e);
        if (!CALME.matches || e < INTRO) reveiller();
    }

    // Les parapentes : l'un traverse le ciel, l'autre tourne dans un thermique
    // au-dessus de la montagne. Dessinés en trame fine, découpés sur le papier.
    function voiles(t, e) {
        var vu = lisse(INTRO * 0.6, INTRO + 0.5, e);
        if (vu <= 0) return;
        var W = Math.max(24, Math.min(38, hauteur * 0.044));
        // Le premier traverse en un peu plus de trois minutes.
        var k = (0.55 + t / 200) % 1;
        parapente(-3 * W + (largeur + 6 * W) * k, hauteur * 0.12 + 5 * Math.sin(t * 0.29), W, 0.06 * Math.sin(t * 0.37), vu, 1);
        // Le second spirale, plus loin : il penche vers le centre de son virage.
        var a = t * 6.2832 / 52;
        var loin = 0.72 + 0.08 * Math.sin(a);
        parapente(largeur * 0.8 + 70 * Math.cos(a), hauteur * 0.19 + 12 * Math.sin(a) - 3 * Math.sin(t * 0.21), W * loin, -0.22 * Math.sin(a + 1.5708), vu * 0.9, Math.sin(a) > 0 ? -1 : 1);
    }

    function parapente(cx, cy, W, penche, vu, sens) {
        var g = 3.4, rmax = 2;
        function milieu(u) { return -0.34 * W * (1 - u * u); }
        function epaisseur(u) { return 0.24 * W * Math.sqrt(Math.max(0, 1 - u * u)) + 0.05 * W; }
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(penche);
        ctx.globalAlpha = vu;
        // La découpe : la voile au ton du papier, pour que le ciel ne passe pas.
        ctx.fillStyle = papier;
        ctx.beginPath();
        var u;
        for (u = -1; u <= 1.001; u += 0.1) ctx.lineTo(u * W * 1.04, milieu(u) - epaisseur(u) / 2 - 1.5);
        for (u = 1; u >= -1.001; u -= 0.1) ctx.lineTo(u * W * 1.04, milieu(u) + epaisseur(u) / 2 + 1.5);
        ctx.closePath();
        ctx.rect(-6, 0.62 * W - 7, 13, 17);
        ctx.fill();
        // La voile : des caissons en bandes, le côté au soleil plus clair.
        ctx.fillStyle = encreVoile;
        ctx.beginPath();
        var lumieres = [];
        for (var dy = -0.5 * W, rang = 0; dy <= 0.15 * W; dy += g * 0.88, rang++) {
            for (var dx = -W + (rang % 2 ? g / 2 : 0); dx <= W; dx += g) {
                u = dx / W;
                if (Math.abs(dy - milieu(u)) > epaisseur(u) / 2) continue;
                var cote = sombre ? -u : u;
                var ton = 0.28 + 0.45 * lisse(-0.8, 0.9, cote) + 0.14 * Math.cos(u * Math.PI * 4.5);
                var r = rmax * Math.sqrt(Math.min(1, ton * 1.6));
                ctx.moveTo(dx + r, dy);
                ctx.arc(dx, dy, r, 0, 6.2832);
                if (!sombre && cote < -0.35 && dy < milieu(u)) lumieres.push(dx, dy);
            }
        }
        var py = 0.62 * W;
        ctx.fill();
        // Le pilote, assis dans sa sellette, les jambes vers l'avant : un seul tracé.
        ctx.strokeStyle = encreVoile;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(0, py - 1.6); ctx.lineTo(-0.6 * sens, py + 2.6); ctx.lineTo(3 * sens, py + 3.4); ctx.lineTo(4.6 * sens, py + 6.2);
        ctx.moveTo(-1.2, py - 1.4); ctx.lineTo(-2.8, py - 5.2);
        ctx.moveTo(1.2, py - 1.4); ctx.lineTo(2.8, py - 5.2);
        ctx.moveTo(0.8, py - 4.4); ctx.arc(0, py - 4.4, 0.8, 0, 6.2832);
        ctx.lineWidth = 2;
        ctx.stroke();
        // Les suspentes, des bords et du centre de la voile au pilote.
        ctx.strokeStyle = encre;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        [-0.92, -0.45, 0.45, 0.92].forEach(function (s) {
            ctx.moveTo(s * W * 0.97, milieu(s) + epaisseur(s) / 2 + 2.5);
            ctx.lineTo(s * 3.1, py - 7.4);
        });
        ctx.stroke();
        ctx.fillStyle = lumiere;
        ctx.beginPath();
        for (var q = 0; q < lumieres.length; q += 2) {
            ctx.moveTo(lumieres[q] + 1.2, lumieres[q + 1]);
            ctx.arc(lumieres[q], lumieres[q + 1], 1.2, 0, 6.2832);
        }
        ctx.fill();
        ctx.restore();
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
        buPret = false;
        if (!buDemande) { buDemande = true; chargerBuissons(); }
        dernier = 0;
        reveiller();
    }
    window.addEventListener('resize', function () { clearTimeout(redim); redim = setTimeout(reprendre, 120); });
    new MutationObserver(function () { if (ctx) { lireTheme(); dernier = 0; reveiller(); } })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    reprendre();
})();
