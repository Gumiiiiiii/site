// Le fond de l'accueil : la Sainte-Victoire au-dessus d'un champ de lavande.
(function () {
    var toile = document.getElementById('lavande');
    if (!toile || !toile.getContext) return;

    var CALME = window.matchMedia('(prefers-reduced-motion: reduce)');
    var PAS_X = 10, PAS_Y = 9, RAYON_MAX = 5.2, CADENCE = 40;
    // Sur un téléphone, le paysage est une image fixe : une bande en haut de la page.
    var PETIT = window.matchMedia('(max-width: 759px)');

    var ctx = null, largeur = 0, hauteur = 0, dpr = 1, xs, ys;
    // Sur un écran étroit, la scène garde ses proportions de paysage.
    var vue = 0, decal = 0, gI0 = 0, parRang = 1;
    var encre = 'rgba(26, 26, 26, 0.12)', sombre = false, papier = '#F9F4EF', encreVoile = 'rgba(26, 26, 26, 0.3)';
    // Les lumières : une seconde encre, claire, pour ce que le soleil touche.
    var lumiere = 'rgba(255, 249, 238, 0.36)', lx, ly, lr;
    var boucle = 0, dernier = 0, debut = -1;
    // L'apparition : au premier dessin, les points se développent depuis l'horizon vers les bords.
    var INTRO = 0.9;

    function mesurer() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        var f = PETIT.matches ? 2 : 1;
        PAS_X = 10 / f; PAS_Y = 9 / f; RAYON_MAX = 5.2 / f;
        vue = toile.clientWidth || window.innerWidth;
        if (PETIT.matches) toile.style.height = Math.round(vue / 1.3) + 'px';
        else toile.style.height = '';
        hauteur = toile.clientHeight || window.innerHeight;
        largeur = Math.max(vue, Math.round(hauteur * 1.2));
        decal = Math.min(largeur - vue, Math.max(0, largeur * 0.56 - vue / 2));
        toile.width = Math.round(vue * dpr);
        toile.height = Math.round(hauteur * dpr);
        var rangees = Math.round(hauteur / PAS_Y), pas = hauteur / rangees;
        var centre = largeur / 2;
        gI0 = Math.floor((decal - centre) / PAS_X) - 1;
        var gI1 = Math.ceil((decal + vue - centre) / PAS_X) + 1;
        parRang = gI1 - gI0 + 1;
        var n = (rangees + 1) * parRang;
        xs = new Float32Array(n);
        ys = new Float32Array(n);
        lx = new Float32Array(n); ly = new Float32Array(n); lr = new Float32Array(n);
        var k = 0;
        for (var j = 0; j <= rangees; j++) {
            var dec = (j % 2) ? PAS_X / 2 : 0;
            for (var i = gI0; i <= gI1; i++) { xs[k] = centre + i * PAS_X + dec; ys[k] = j * pas; k += 1; }
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

    // La crête, relevée sur une photo prise du sud : à l'ouest une longue pente douce.
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

    // Un bruit en cases : chaque case a sa valeur, comme une touche de pinceau a sa couleur.
    function hasard(i, j) {
        var n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }
    // Les touches : des cases allongées, inclinées.
    function touche(x, y, angle, long, large) {
        var ca = Math.cos(angle), sa = Math.sin(angle);
        var a = x * ca + y * sa, b = -x * sa + y * ca;
        var j = Math.floor(b / large);
        var i = Math.floor(a / long + j * 0.37);
        return hasard(i, j) - 0.5;
    }

    // Les collines : des dos ronds qui se recouvrent, du plus lointain au plus proche.
    var COLLINES = [[0.33, 0.30, 0.17], [0.83, 0.27, 0.15], [0.04, 0.2, 0.135], [0.58, 0.2, 0.11], [1.0, 0.16, 0.12]];

    // L'aqueduc du premier plan, modelé en volume et vu par le même œil que le champ.

    // Son tracé, au sol : un C ouvert vers la droite.
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
    var abscisse = 0, assise = 0;

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
        abscisse = sv; assise = py;
        var H = 2.1;
        // Le mur, sa corniche au sommet, le socle au pied et, aux naissances des arches.
        var d = Math.max(ecart - 0.24, py - H, -py - 0.1);
        d = Math.min(d, Math.max(ecart - 0.32, Math.abs(py - (H - 0.08)) - 0.08));
        d = Math.min(d, Math.max(ecart - 0.29, py - 0.24, -py - 0.1));
        d = Math.min(d, Math.max(ecart - 0.285, Math.abs(py - 1.17) - 0.05));
        var L = 1.3, r = 0.46, sm = ((sv % L) + L) % L - L / 2;
        var o = Math.min(Math.max(Math.abs(sm) - r, py - 1.2), Math.sqrt(sm * sm + (py - 1.2) * (py - 1.2)) - r);
        return Math.max(d, -o) * K;
    }
    function scene(px, py, pz) { var d = pierres(px, py, pz); return py < d ? py : d; }
    // Avance le long du rayon ; renvoie la distance du premier contact, ou -1.
    function toucher(ox, oy, oz, dx, dy, dz, jusque) {
        var t = 0;
        for (var n = 0; n < 110; n++) {
            var d = pierres(ox + dx * t, oy + dy * t, oz + dz * t);
            if (d < 0.004) return t;
            t += d < 0.015 ? 0.015 : (d > 0.6 ? 0.36 : d * 0.7);
            if (t > jusque) return -1;
        }
        return -1;
    }
    // L'ombre du soleil, à bord doux, comme celle des buissons.
    function penombre(ox, oy, oz, lx, ly, lz) {
        var res = 1, t = 0.03;
        for (var n = 0; n < 48 && t < 8; n++) {
            var d = pierres(ox + lx * t, oy + ly * t, oz + lz * t);
            if (d < 0.002) return 0;
            res = Math.min(res, 8 * d / t);
            t += Math.max(0.025, d * 0.9);
        }
        return res < 0 ? 0 : res > 1 ? 1 : res;
    }
    function occlusion(px, py, pz, nx, ny, nz) {
        var o = 0, w = 1;
        for (var k = 1; k <= 5; k++) {
            var h = 0.06 * k;
            o += w * (h - scene(px + nx * h, py + ny * h, pz + nz * h));
            w *= 0.7;
        }
        o = 1 - 2.2 * o;
        return o < 0 ? 0 : o > 1 ? 1 : o;
    }

    // Par point de la trame : la part que la pierre en couvre, son encre (thème clair).
    var ruCouv, ruEncre, ruClarte, ruEclat, ruBord, ruOmbre, ruT, ruPret = false;
    function preparerRuine() {
        var n = xs.length;
        if (!ruCouv || ruCouv.length !== n) {
            ruCouv = new Float32Array(n); ruEncre = new Float32Array(n); ruClarte = new Float32Array(n);
            ruEclat = new Float32Array(n); ruBord = new Uint8Array(n); ruOmbre = new Float32Array(n); ruT = new Float32Array(n);
        }
        ruCouv.fill(0); ruEncre.fill(0); ruClarte.fill(0); ruEclat.fill(0); ruBord.fill(0); ruOmbre.fill(0); ruT.fill(-1);
        var hy = hauteur * 0.5, vx = largeur * 0.56, bas = hauteur - hy;
        // Le soleil : de face et de la gauche, haut, comme sur la montagne.
        var lx0 = -0.4, ly0 = 0.7, lz0 = -0.62, ln = Math.sqrt(lx0 * lx0 + ly0 * ly0 + lz0 * lz0);
        lx0 /= ln; ly0 /= ln; lz0 /= ln;
        var e = 0.004, R = [0, 0, 0];
        function viser(x, y) {
            var dx = (x - vx) / bas, dy = -((y - hy) / bas + 0.02), dn = Math.sqrt(dx * dx + dy * dy + 1);
            R[0] = dx / dn; R[1] = dy / dn; R[2] = 1 / dn;
            var t = toucher(0, 1, 0, R[0], R[1], R[2], 18);
            var sol = R[1] < -0.0005 ? -1 / R[1] : 1e9;
            return (t >= 0 && t < sol) ? t : -1;
        }
        // Un échantillon : la pierre touchée et sa lumière, ou le sol et son ombre.
        var S = { t: -1, encre: 0, clarte: 0, eclat: 0, sol: 0 };
        function echantillon(x, y) {
            var t = viser(x, y), dx = R[0], dy = R[1], dz = R[2];
            S.t = t;
            if (t < 0) {
                S.sol = 0;
                if (dy < -0.0005) {
                    var sol = -1 / dy, gx = dx * sol, gz = dz * sol;
                    var so = penombre(gx, 0.01, gz, lx0, ly0, lz0);
                    var ao = pierres(gx, 0, gz) < 0.4 ? occlusion(gx, 0.002, gz, 0, 1, 0) : 1;
                    S.sol = Math.min(1, 0.85 * (1 - so) + 0.7 * (1 - ao));
                }
                return;
            }
            var px = dx * t, py = 1 + dy * t, pz = dz * t;
            pierres(px, py, pz);
            var ab = abscisse, as = assise;
            var nx = pierres(px + e, py, pz) - pierres(px - e, py, pz);
            var ny = pierres(px, py + e, pz) - pierres(px, py - e, pz);
            var nz = pierres(px, py, pz + e) - pierres(px, py, pz - e);
            var nn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            nx /= nn; ny /= nn; nz /= nn;
            var cosL = nx * lx0 + ny * ly0 + nz * lz0;
            var so = cosL > 0 ? penombre(px + nx * 0.01, py + ny * 0.01, pz + nz * 0.01, lx0, ly0, lz0) : 0;
            var ao = occlusion(px, py, pz, nx, ny, nz);
            // Le soleil, le ciel, et sous les arches la lumière que renvoie le sol.
            var jour = Math.max(0, cosL) * so + (0.1 + 0.08 * ny) * ao + 0.2 * Math.max(0, -ny) * ao;
            // Les assises : chaque bloc a sa pierre, et les joints sont filtrés à la taille d'un point.
            var pied = t * PAS_X / bas / ECHELLE, w = Math.max(0.03, pied * 0.55);
            var fy = as / 0.3, rang = Math.floor(fy), fx = ab / 0.55 + rang * 0.5, bloc = Math.floor(fx);
            var dj = Math.min((0.5 - Math.abs(fy - rang - 0.5)) * 0.3, (0.5 - Math.abs(fx - bloc - 0.5)) * 0.55);
            var joint = (1 - lisse(0, w, dj)) * Math.min(1, 0.04 / w);
            // La forme d'abord ; le grain de la pierre et sa patine, plus sale vers le pied.
            var grain = 0.5 * (hasard(bloc, rang + 40) - 0.5) + 0.4 * (bruitLisse(ab * 1.3, as * 2.2 + 5) - 0.5);
            var salete = 1 - lisse(0, 0.9, as);
            // Des valeurs franches : la pierre au soleil presque papier, les dessous bien noirs.
            grain *= 0.5;
            var r = 1 - Math.min(1, jour * 1.35);
            S.encre = 0.95 * (0.02 + 0.98 * r * r * (2 - r)) * (0.5 + 0.5 * ao) * (1 + grain) + 0.08 * joint + 0.04 * salete;
            S.clarte = 0.8 * (0.06 + 0.94 * Math.min(1, jour * 1.35)) * (0.55 + 0.45 * ao) * (1 - 0.6 * grain) * (1 - 0.3 * joint) * (1 - 0.15 * salete);
            S.eclat = lisse(0.4, 0.8, jour) * (1 - joint) * (1 - grain) * (1 - 0.4 * salete);
        }

        // D'abord un rayon par point ; puis, aux bords, quatre de plus.
        var zone = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            var x = xs[i], y = ys[i];
            if (x < vx - bas * 0.1 || y < hy - bas * 0.95) continue;
            zone[i] = 1;
            ruT[i] = viser(x, y);
        }
        function voisin(k, a) {
            // a : 0 gauche, 1 droite, 2 et 3 au-dessus, 4 et 5 au-dessous.
            var j = Math.floor(k / parRang), c = k - j * parRang, imp = j % 2;
            if (a < 2) c += a ? 1 : -1;
            else { j += a < 4 ? -1 : 1; c += (a % 2 ? 0 : -1) + imp; }
            if (c < 0 || c >= parRang || j < 0 || j * parRang + c >= n) return -1;
            return j * parRang + c;
        }
        function rompt(a, b) {
            if ((a < 0) !== (b < 0)) return true;
            return a >= 0 && Math.abs(a - b) > 0.12 * Math.min(a, b);
        }
        var OFF = [[0, 0], [-2.6, -1.1], [2.6, 1.1], [-1.1, 2.3], [1.1, -2.3]];
        var a, v;
        for (i = 0; i < n; i++) {
            if (!zone[i]) continue;
            var bord = false;
            for (a = 0; a < 6 && !bord; a++) { v = voisin(i, a); if (v >= 0 && zone[v] && rompt(ruT[i], ruT[v])) bord = true; }
            if (!bord && ruT[i] < 0 && ys[i] < hy) continue;
            var m = bord ? OFF.length : 1, hits = 0, sols = 0;
            var en = 0, cl = 0, ec = 0, so = 0, tm = 0;
            for (var q = 0; q < m; q++) {
                echantillon(xs[i] + OFF[q][0] * PAS_X / 10, ys[i] + OFF[q][1] * PAS_X / 10);
                if (S.t >= 0) { hits++; en += S.encre; cl += S.clarte; ec += S.eclat; tm += S.t; }
                else { sols++; so += S.sol; }
            }
            ruCouv[i] = hits / m;
            if (hits) { ruEncre[i] = en / hits; ruClarte[i] = cl / hits; ruEclat[i] = ec / hits; ruT[i] = tm / hits; }
            if (sols) ruOmbre[i] = so / sols;
        }
        // Le contour, comme celui des buissons.
        for (i = 0; i < n; i++) {
            if (ruCouv[i] <= 0.5) continue;
            for (a = 0; a < 4; a++) {
                v = voisin(i, a);
                if (v < 0) continue;
                if (ruCouv[v] < 0.3 || ruT[v] > ruT[i] * 1.18) { ruBord[i] = 1; break; }
            }
        }
        // Autour, un liseré de papier nu, comme au ras de la montagne.
        for (i = 0; i < n; i++) {
            if (ruBord[i] !== 1) continue;
            for (a = 0; a < 4; a++) {
                v = voisin(i, a);
                if (v >= 0 && ruBord[v] === 0 && ruCouv[v] < 0.5) ruBord[v] = 2;
            }
        }
        ruPret = true;
    }

    // Les cyprès : [part de la largeur de l'écran, hauteur en part de l'écran].
    var CYPRES = [[0.215, 0.1], [0.231, 0.075], [0.905, 0.11], [0.921, 0.085]];

    // Les buissons de lavande : des dômes d'épis rendus d'avance (build/buissons-lavande.js).
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
    // Les réductions de moitié en moitié.
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

    // Pose un buisson sur la trame, penché de « penche » (unités du modèle, au sommet).
    var s5 = new Float32Array(BU_C);
    function poser(B, penche, z) {
        var rangees = Math.round(hauteur / PAS_Y), pas = hauteur / rangees, centre = largeur / 2;
        var pasS = PAS_X / B.ppu * BU_PX, pasV = pas / B.ppu * BU_PX;     // d'un point à son voisin, dans le rendu
        var marge = Math.abs(penche) * B.ppu;
        var j0 = Math.max(z ? z.j0 : 0, Math.ceil(Math.max(B.haut, hauteur * 0.5) / pas)), j1 = Math.min(z ? z.j1 : rangees, Math.floor(B.basS / pas));
        for (var j = j0; j <= j1; j++) {
            var dec = (j % 2) ? PAS_X / 2 : 0, y = j * pas;
            var i0 = Math.max(z ? z.i0 : gI0, Math.ceil((B.gauche - marge - centre - dec) / PAS_X));
            var i1 = Math.min(z ? z.i1 : gI0 + parRang - 1, Math.floor((B.droite + marge - centre - dec) / PAS_X));
            var v = (B.by - y) / B.ppu, sy = (BU_V0 - v) * BU_PX;
            // Le vent couche le haut du buisson ; le pied et l'ombre au sol restent.
            var dx = v > 0 ? penche * Math.pow(v / 1.25, 1.6) * BU_PX : 0;
            for (var ii = i0; ii <= i1; ii++) {
                var x = centre + ii * PAS_X + dec, sx = ((x - B.bx) / B.ppu - BU_U0) * BU_PX - dx;
                s5[0] = s5[1] = s5[2] = s5[3] = s5[4] = 0;
                lireSprite(B.mA, sx, sy, B.niveau, 1 - B.fa, s5);
                if (B.fa > 0) lireSprite(B.mB, sx, sy, B.niveau, B.fa, s5);
                if (s5[1] < 0.002 && s5[3] < 0.002) continue;
                var k = j * parRang + ii - gI0, vide = 1 - s5[1], sh = 0.6 * s5[3];
                // Le buisson couvre ce qui est derrière ; son ombre tombe sur le reste.
                var e0 = buEncre[k], l0 = buLum[k], c0 = buEclat[k];
                buEncre[k] = 0.08 * s5[1] + s5[0] + vide * e0 + sh * (OMBRE_SOL - e0);
                buLum[k] = Math.max(0, 1.2 * s5[2] + vide * l0 - 0.85 * sh * l0);
                buEclat[k] = Math.max(0, s5[4] + vide * c0 - sh * c0);
                // Son contour, comme la crête et les collines : un trait d'un point, sauf au pied.
                if (s5[1] > 0.5 && (couv(B.mA, B.mB, B.fa, sx - pasS, sy, B.niveau) < 0.3 || couv(B.mA, B.mB, B.fa, sx + pasS, sy, B.niveau) < 0.3
                    || couv(B.mA, B.mB, B.fa, sx - pasS / 2, sy - pasV, B.niveau) < 0.3 || couv(B.mA, B.mB, B.fa, sx + pasS / 2, sy - pasV, B.niveau) < 0.3)) {
                    buEncre[k] = Math.max(buEncre[k], 0.5); buLum[k] = Math.max(buLum[k], 0.55); buEclat[k] = 0;
                }
            }
        }
    }

    // Le buisson dans le vent : près du bas de l'écran.
    var vent = null;
    function cibleVent() {
        var ex = document.querySelector('.exps'), ou = document.querySelector('.outils');
        if (ex && ou) {
            var a = ex.getBoundingClientRect(), b = ou.getBoundingClientRect();
            if (b.left - a.right > 8) return (a.right + b.left) / 2;
        }
        return vue / 2;
    }

    function preparerBuissons() {
        var n = xs.length;
        if (!buEncre || buEncre.length !== n) { buEncre = new Float32Array(n); buLum = new Float32Array(n); buEclat = new Float32Array(n); }
        buEncre.fill(TERRE); buLum.fill(TERRE_SOMBRE); buEclat.fill(0);
        buPret = true;
        vent = null;
        if (!buMips) return;
        var hy = hauteur * 0.5, vx = largeur * 0.56, bas = hauteur - hy;
        var ecart = largeur / (4 * bas);                  // entre deux rangs, en hauteurs d'œil
        var K = 0.7 * ecart / 2.25;                      // un buisson : 2,25 unités de son modèle
        var D = 0.62 * ecart, zMax = Math.min(40, 2.2 * K * bas / 7);
        var tous = [];
        for (var nT = Math.ceil(zMax / D) + 1; nT >= 0; nT--) {
            var zr = (nT + 0.5) * D;
            var nMax = Math.ceil((largeur * 0.6 * zr / bas) / ecart) + 1;
            for (var nR = -nMax; nR <= nMax; nR++) {
                var h1 = hasard(nT, nR), h2 = hasard(nR, nT + 40), h3 = hasard(nT + 7, nR - 3);
                var Z = zr - hasard(nR, 11) * D + (h2 - 0.5) * 0.08;
                if (Z < 0.55 || Z > zMax) continue;
                var W = (nR + 0.5 + (h3 - 0.5) * 0.12) * ecart, vr = Math.floor(h2 * BU_VAR) % BU_VAR;
                var B = { Z: Z, bx: vx + W * bas / Z, by: hy + bas * (1 / Z - 0.02), ppu: K * (0.88 + 0.24 * h1) * bas / Z };
                B.gauche = B.bx + BU_U0 * B.ppu; B.droite = B.bx + (BU_U0 + BU_L / BU_PX) * B.ppu;
                B.haut = B.by - BU_V0 * B.ppu; B.basS = B.by + (BU_H / BU_PX - BU_V0) * B.ppu;
                if (B.droite < decal || B.gauche > decal + vue || B.haut > hauteur || B.basS < hy) continue;
                // L'angle sous lequel l'œil le voit, entre deux des rendus.
                var th = Math.atan(1 / Z) * 57.2958, ia = 0;
                while (ia < BU_ANGLES.length - 2 && th > BU_ANGLES[ia + 1]) ia++;
                var fa = (th - BU_ANGLES[ia]) / (BU_ANGLES[ia + 1] - BU_ANGLES[ia]);
                B.fa = fa < 0 ? 0 : fa > 1 ? 1 : fa;
                B.mA = buMips[vr * BU_ANGLES.length + ia]; B.mB = buMips[vr * BU_ANGLES.length + ia + 1];
                B.niveau = Math.max(0, Math.log(PAS_X / B.ppu * BU_PX) / Math.LN2 - 0.5);
                tous.push(B);
            }
        }
        tous.sort(function (a, b) { return b.Z - a.Z; });

        // Le plus proche de la cible parmi ceux qui ont le pied au bas de l'écran.
        var tx = decal + cibleVent(), ty = hauteur * 0.93, choisi = -1, meilleur = 1e9;
        for (var q = 0; q < tous.length; q++) {
            var c = tous[q];
            if (c.by < hauteur * 0.8 || c.by > hauteur * 1.02) continue;
            var d = Math.abs(c.bx - tx) + 0.5 * Math.abs(c.by - ty);
            if (d < meilleur) { meilleur = d; choisi = q; }
        }
        var rangees = Math.round(hauteur / PAS_Y), pas = hauteur / rangees, centre = largeur / 2;
        for (var oi = 0; oi < tous.length; oi++) {
            if (oi === choisi) {
                // Ce qui est derrière lui est gardé, pour être reposé à chaque image.
                var Bv = tous[oi], m = 0.45 * Bv.ppu;
                var zone = {
                    j0: Math.max(0, Math.floor(Bv.haut / pas) - 1), j1: Math.min(rangees, Math.ceil(Bv.basS / pas) + 1),
                    i0: Math.max(gI0, Math.floor((Bv.gauche - m - centre) / PAS_X) - 1),
                    i1: Math.min(gI0 + parRang - 1, Math.ceil((Bv.droite + m - centre) / PAS_X) + 1)
                };
                var l = zone.i1 - zone.i0 + 1, h = zone.j1 - zone.j0 + 1;
                var fond = new Float32Array(l * h * 3);
                for (var j = 0; j < h; j++) for (var ii = 0; ii < l; ii++) {
                    var k = (zone.j0 + j) * parRang + zone.i0 + ii - gI0, o = (j * l + ii) * 3;
                    fond[o] = buEncre[k]; fond[o + 1] = buLum[k]; fond[o + 2] = buEclat[k];
                }
                vent = { B: Bv, zone: zone, fond: fond, devant: [] };
            } else if (vent) {
                var A = tous[oi], mv = 0.35 * vent.B.ppu;
                if (A.droite > vent.B.gauche - mv && A.gauche < vent.B.droite + mv && A.basS > vent.B.haut) vent.devant.push(A);
            }
            poser(tous[oi], 0, null);
        }
    }

    // À chaque image : le fond gardé, le buisson penché, puis ce qui est devant lui.
    function souffler(t) {
        if (!vent) return;
        var z = vent.zone, l = z.i1 - z.i0 + 1;
        for (var j = z.j0; j <= z.j1; j++) for (var ii = z.i0; ii <= z.i1; ii++) {
            var k = j * parRang + ii - gI0, o = ((j - z.j0) * l + ii - z.i0) * 3;
            buEncre[k] = vent.fond[o]; buLum[k] = vent.fond[o + 1]; buEclat[k] = vent.fond[o + 2];
        }
        // Des rafales : une poussée lente vers la droite, et deux balancements dessus.
        var penche = 0.08 + 0.06 * Math.sin(t * 0.45) + 0.08 * Math.sin(t * 1.7) + 0.035 * Math.sin(t * 3.3 + 1.3);
        poser(vent.B, penche, z);
        for (var q = 0; q < vent.devant.length; q++) poser(vent.devant[q], 0, z);
    }

    // Les nuages : un bruit lisse, à deux échelles, qui dérive lentement.
    function bruitLisse(x, y) {
        var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
        fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
        var a = hasard(i, j), b = hasard(i + 1, j), c = hasard(i, j + 1), d = hasard(i + 1, j + 1);
        return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    // Les deux échelles ne vont pas à la même allure : le détail glisse sur la masse.
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
        if (!ctx) return;
        // Le cabanon se calcule avant que l'apparition commence.
        if (!ruPret) { preparerRuine(); reveiller(); return; }
        if (buEtat === 0) return;
        if (!buPret) { preparerBuissons(); reveiller(); return; }
        CHAMP_UNI = sombre ? 0.26 : 0.24;
        if (debut < 0) debut = maintenant;
        var fixe = CALME.matches || PETIT.matches;
        var e = fixe ? INTRO : (maintenant - debut) / 1000;   // le temps depuis l'apparition
        if (e >= INTRO && maintenant - dernier < CADENCE) { reveiller(); return; }
        dernier = maintenant;
        var t = fixe ? 0 : maintenant / 1000;
        temps = t;
        if (!PETIT.matches) souffler(t);

        // La scène : l'horizon sous le milieu, le point de fuite au centre de l'espace libre.
        var hy = hauteur * 0.5, vx = largeur * 0.56;
        var mg = -largeur * 0.24, ml = largeur * 1.1;    // la montagne : bord gauche, largeur
        var mh = hauteur * 0.36;                          // sa hauteur au sommet
        var pied = hy - hauteur * 0.07;                   // où elle disparaît derrière les collines
        var sx = mg + ml * 0.639, sy = pied - mh;         // le sommet
        var bas = hauteur - hy;

        ctx.setTransform(dpr, 0, 0, dpr, -decal * dpr, 0);
        ctx.clearRect(decal, 0, vue, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();
        var nl = 0;

        for (var i = 0; i < xs.length; i++) {
            var x = xs[i], y = ys[i], ton = 0, eclat = 0, bord = 0;

            var u = (x - mg) / ml;
            var sommet = pied - mh * profil(u);
            // Le plan du milieu : les collines au loin, la haie devant.
            var col1 = hy, colline = -1, hautColline = hy, versant = 0;
            for (var k = 0; k < COLLINES.length; k++) {
                var ecart = (x / largeur - COLLINES[k][0]) / COLLINES[k][1];
                if (ecart <= -1 || ecart >= 1) continue;
                var dos = Math.cos(ecart * 1.5708);
                var haut1 = hy - hauteur * COLLINES[k][2] * Math.pow(dos, 1.25);
                if (haut1 < col1) col1 = haut1;
                if (y >= haut1) { colline = k; hautColline = haut1; versant = ecart; }
            }
            // La haie n'est pas un mur droit : elle monte en bosquets, retombe presque à ras du champ.
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

            if (cypres) {
                ton = cypres;
            } else if (y >= col2 && y < hy) {
                // La haie : un aplat sombre, qui rejoint en bas le ton du champ.
                var d2 = y - col2;
                ton = 0.6 - 0.18 * lisse(0, hy - col2, d2);
                // Son faîte : un trait plein, sur une rangée entière de points.
                if (d2 < PAS_Y * 1.06) bord = 0.66;
            } else if (colline >= 0 && y < hy) {
                // Une colline : claire du côté du soleil, plus dense en tournant vers la droite et vers son pied.
                var d1 = y - hautColline;
                var aOmbre = lisse(-0.35, 0.85, versant);
                ton = 0.17 + 0.27 * aOmbre + 0.08 * lisse(0, hauteur * 0.07, d1) + 0.025 * colline;
                eclat = 0.22 * (1 - lisse(-0.7, 0.1, versant)) * (1 - lisse(0, hauteur * 0.035, d1));
                if (d1 < PAS_Y * 1.06) bord = 0.44;
                // Juste derrière la haie, la colline s'éclaircit : la haie se détache.
                ton *= 0.6 + 0.4 * lisse(0, PAS_Y * 2.2, col2 - y);
            } else if (y >= sommet && y < hy) {
                // La face de la montagne : ombrée selon la pente de la crête.
                var pente = (profil(u + 0.05) - profil(u - 0.05)) / 0.1;
                var ombre = lisse(-0.2, -1.6, pente);               // 0 au soleil, 1 à l'ombre
                // L'ombre suit le versant en descendant.
                var prof = (y - sommet) / Math.max(1, pied - sommet);
                var partage = sx + (y - sy) * 0.9;
                ombre = Math.max(ombre * (1 - 0.7 * prof), lisse(-90, 150, x - partage) * 0.7);
                // Les touches : orientées comme les plans, plus serrées en haut, où la roche est nue.
                var pinceau = touche(x, y, ombre > 0.4 ? 0.55 : -0.45, (30 + 30 * prof) * PAS_X / 10, 11 * PAS_X / 10);
                // Le pied se perd dans une brume claire : les collines de devant s'y détachent.
                var brume = lisse(0.7, 1, prof);
                ton = (0.09 + 0.22 * ombre + (0.12 + 0.1 * ombre) * pinceau) * (1 - 0.6 * brume);
                // Le versant au soleil : les touches les plus claires passent en lumière.
                eclat = 0.4 * (1 - ombre) * (1 - ombre) * lisse(0.05, 0.4, -pinceau) * (1 - brume);
                // Les deux arêtes qui descendent du sommet, en traits plus sombres, et quelques plis plus loin.
                var ax = x - sx, ay = y - sy;
                var dist1 = Math.abs(ay - (-ax) * 0.95) / 1.38;                // pente descendant à gauche
                var dist2 = Math.abs(ay - ax * 1.6) / 1.89;                    // pente descendant à droite
                if (ax < 0 && ay > 0 && dist1 < PAS_X * 0.4) ton = Math.max(ton, 0.3 * (1 - prof));
                if (ax > 0 && ay > 0 && dist2 < PAS_X * 0.4) ton = Math.max(ton, 0.34 * (1 - prof));
                // L'arête se lit par une ligne de points un peu plus forts.
                if (y - sommet < PAS_Y * 1.06) bord = 0.42;
                else if (y - sommet < PAS_Y * 2.1) ton = Math.max(ton, 0.14);
                if (ton < 0.03) ton = 0.03;
                // En sombre, l'encre est claire : elle dessine la lumière.
                if (sombre) ton = 0.44 - ton;
            } else if (y < hy) {
                // Le ciel, qui se charge vers le haut.
                var haut = 1 - y / hy;
                ton = 0.055 + 0.11 * haut * haut;
                // Au ras des reliefs, le ciel se vide : un liseré de papier nu qui détache leur silhouette.
                var ras = 0.45 + 0.55 * lisse(0, PAS_Y * 2.2, Math.min(sommet, col1, col2) - y);
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
                // La lavande.
                var p = (y - hy) / bas;                       // 0 à l'horizon, 1 en bas
                // Les buissons, posés une fois par mise en page ; uni près de l'horizon.
                var sortie = lisse(0.01, 0.22, p);
                var champ = sombre ? buLum[i] : buEncre[i];
                eclat = 0.8 * buEclat[i] * sortie;
                ton = CHAMP_UNI + (champ - CHAMP_UNI) * sortie;
                // L'ombre portée de l'aqueduc.
                var oa = ruOmbre[i];
                if (oa > 0) { ton = sombre ? ton * (1 - 0.5 * oa) : ton + (0.62 - ton) * 0.6 * oa; eclat *= 1 - oa; }
            }

            // L'ombre des nuages glisse sur la montagne et les collines, pas sur le champ : le fond vit.
            if (y < hy && y >= Math.min(sommet, col1)) {
                var ot = nuage(x / hauteur * 3.2 - t * 0.045 + 0.4, y / hauteur * 6 + 1.7, 0.54);
                ton *= sombre ? 1 - 0.4 * ot : 1 + 0.45 * ot;
                if (!sombre) ton += 0.03 * ot;
                eclat *= 1 - ot;
            }
            // Les silhouettes : un trait que rien n'efface. En sombre, il est clair.
            if (bord) { ton = bord; eclat = 0; }

            // L'aqueduc, par-dessus, fondu au bord selon la part qu'il couvre.
            var cv = ruCouv[i], rb = ruBord[i];
            if (rb === 2) { ton *= 0.3; eclat *= 0.5; }
            if (cv > 0) {
                var tp = rb === 1 ? (sombre ? 0.62 : 0.62) : (sombre ? ruClarte[i] : ruEncre[i]);
                var ep = rb === 1 ? 0 : ruEclat[i] * (sombre ? 0.7 : 1);
                ton += (tp - ton) * cv; eclat += (ep - eclat) * cv;
            }

            // Un seuil bas : les points s'éteignent en rétrécissant, pas d'un coup sur une même rangée.
            if (ton < 0.003 && eclat < 0.02) continue;
            var paru = 1;
            if (e < INTRO) {
                var ox = (x - vx) / largeur, oy = (y - hy) * 1.6 / largeur;
                // Une onde large et douce : les points voisins grandissent presque ensemble.
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
        if (!PETIT.matches) voiles(t, e, maintenant);
        if (!fixe || e < INTRO) reveiller();
    }

    // Les parapentes : l'un traverse le ciel, l'autre tourne dans un thermique au-dessus de la montagne.
    var POP = 0.7, ABSENCE = 25, RETOUR = 2;
    var voilesVues = [null, null], crevee = [-1e9, -1e9], eclatAngle = [0, 0];

    function voiles(t, e, maintenant) {
        var vu = lisse(INTRO * 0.6, INTRO + 0.5, e);
        if (vu <= 0) return;
        var h = maintenant / 1000;
        var W = Math.max(24, Math.min(38, hauteur * 0.044));
        // Le premier traverse en un peu plus de trois minutes.
        var k = (0.55 + t / 200) % 1;
        voile(0, decal - 3 * W + (vue + 6 * W) * k, hauteur * 0.12 + 5 * Math.sin(t * 0.29), W, 0.06 * Math.sin(t * 0.37), vu, 1, h);
        // Le second spirale, plus loin : il penche vers le centre de son virage.
        var a = t * 6.2832 / 52;
        var loin = 0.72 + 0.08 * Math.sin(a);
        voile(1, decal + vue * 0.8 + 70 * Math.cos(a), hauteur * 0.19 + 12 * Math.sin(a) - 3 * Math.sin(t * 0.21), W * loin, -0.22 * Math.sin(a + 1.5708), vu * 0.9, Math.sin(a) > 0 ? -1 : 1, h);
    }

    function voile(n, cx, cy, W, penche, vu, sens, h) {
        var depuis = h - crevee[n];
        voilesVues[n] = null;
        if (depuis < POP && !CALME.matches) eclater({ x: cx, y: cy + 0.15 * W, W: W }, depuis / POP, eclatAngle[n]);
        if (depuis < ABSENCE) return;
        vu *= lisse(ABSENCE, ABSENCE + RETOUR, depuis);
        if (vu <= 0) return;
        voilesVues[n] = { x: cx - decal, y: cy, W: W };
        parapente(cx, cy, W, penche, vu, sens);
    }

    // La voile crevée : huit traits en pointillé filent du centre vers l'extérieur.
    function eclater(o, p, rot) {
        var W = o.W, file = 1 - Math.pow(1 - p, 2), g = 3.4;
        var r0 = W * (0.15 + 1.1 * file), r1 = r0 + W * 0.6 * (1 - p);
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.fillStyle = encreVoile;
        ctx.beginPath();
        for (var l = 0; l < 8; l++) {
            var a = rot + l * 0.7854, ca = Math.cos(a), sa = Math.sin(a);
            for (var d = r0; d <= r1; d += g) {
                var r = 1.7 * (1 - p) * (1 - 0.4 * (d - r0) / (r1 - r0 + 0.01));
                if (r < 0.3) continue;
                ctx.moveTo(ca * d + r, sa * d);
                ctx.arc(ca * d, sa * d, r, 0, 6.2832);
            }
        }
        ctx.fill();
        ctx.restore();
    }

    function toucheVoile(x, y) {
        for (var n = 0; n < 2; n++) {
            var v = voilesVues[n];
            if (v && Math.abs(x - v.x) < v.W * 1.1 && y > v.y - 0.75 * v.W && y < v.y + 0.95 * v.W) return n;
        }
        return -1;
    }
    var INTERACTIF = 'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable]';
    document.addEventListener('click', function (ev) {
        if (ev.target.closest && ev.target.closest(INTERACTIF)) return;
        var n = toucheVoile(ev.clientX, ev.clientY);
        if (n < 0) return;
        crevee[n] = performance.now() / 1000;
        eclatAngle[n] = Math.random() * 0.6;
        voilesVues[n] = null;
        document.body.style.cursor = '';
        dernier = 0;
        reveiller();
    });
    document.addEventListener('pointermove', function (ev) {
        if (ev.pointerType !== 'mouse') return;
        var sur = !(ev.target.closest && ev.target.closest(INTERACTIF)) && toucheVoile(ev.clientX, ev.clientY) >= 0;
        document.body.style.cursor = sur ? 'pointer' : '';
    }, { passive: true });

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
        if (!boucle && ctx && !document.hidden) boucle = requestAnimationFrame(tracer);
    }
    document.addEventListener('visibilitychange', reveiller);

    var redim;
    function reprendre() {
        if (!toile.clientWidth) return;
        if (!ctx) ctx = toile.getContext('2d');
        if (!ctx) return;
        if (vue === toile.clientWidth && hauteur === toile.clientHeight && xs) return;
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
