// La trame vivante de l'accueil.
//
// Le fond pointé du site est un halftone : un dessin fait de points d'une
// seule encre, dont seule la taille dit le ton. Ici ce dessin devient une
// architecture. Les points sont le style ; le Midi donne les formes.
//
// Ce qu'on voit est un pont-aqueduc romain, à la manière du pont du Gard :
// un rang de grandes arches en plein cintre, et au-dessus un rang de
// petites, trois pour une. Il file en perspective vers la gauche et se
// perd dans la distance ; le soleil vient d'en haut, et c'est l'ombre de
// chaque face, le dessous des voûtes surtout, qui règle la taille de ses
// points. Le pont n'est donc jamais un aplat ni une image : c'est le
// réseau du champ (scripts/points-champ.js, à demi-pas) qui le porte.
//
// Le reste de la page appartient au même paysage. Le champ de points du
// site a une bande dense en haut et une en bas ; ici elles deviennent ce
// qu'elles sont dans le tableau. En haut, le ciel : il se charge en
// montant, et s'éclaircit du côté du soleil. En bas, la rivière : le pont
// y a les pieds, il s'y reflète, et l'eau ride le reflet. Sur l'accueil,
// la trame remplace donc le champ, elle ne se pose pas dessus.
//
// Trois règles le tiennent :
//   · une seule encre, en gris : la couleur du site est réservée à ce qui
//     se clique ;
//   · une encre légère, pour que le texte se lise par-dessus sans qu'on
//     ait à découper le fond derrière lui ;
//   · un mouvement lent : on longe le pont au pas. Le curseur n'y change
//     rien, le regard ne bouge pas avec lui.
//
// Le calcul : pour chaque point du réseau, un rayon part de l'œil et
// avance jusqu'à toucher la pierre (marche par distance). Au point touché,
// la pente de la surface donne son éclairage.
(function () {
    var toile = document.getElementById('trame');
    if (!toile || !toile.getContext) return;

    // Le même seuil que styles/ecran.css : en dessous, la page défile et le
    // fond reste le champ de points ordinaire.
    var SEUIL = window.matchMedia('(min-width: 1100px) and (min-height: 600px)');
    var CALME = window.matchMedia('(prefers-reduced-motion: reduce)');

    var PAS_X = 10, PAS_Y = 9;     // le demi-pas du champ (20 x 18)
    var RAYON_MAX = 5.2;           // un point plein, juste avant de toucher ses voisins
    var CADENCE = 33;              // 30 images par seconde suffisent à ce mouvement

    // Le pont, en unités d'ouvrage : une grande arche mesure 1,2 d'axe en
    // axe. Il est infini le long de x ; y monte ; z traverse son épaisseur.
    var TRAVEE = 1.2;              // d'un pilier au suivant, rang du bas
    var OUV = 0.44;                // demi-ouverture d'une grande arche
    var NAISS = -0.10;             // hauteur où naît le cintre des grandes arches
    var HAUT_1 = 0.46;             // dessus du rang du bas
    var EP_1 = 0.24;               // sa demi-épaisseur
    var PETITE = TRAVEE / 3;       // trois petites arches pour une grande
    var OUV_2 = 0.135;
    var NAISS_2 = 0.63;
    var HAUT_2 = 0.92;             // dessus du rang du haut, le canal
    var EP_2 = 0.16;
    var EAU = -0.62;               // le niveau de la rivière

    // Le soleil : haut, un peu à gauche, du côté de l'œil. La façade est
    // en pleine lumière, le dessous des voûtes et le flanc des piles dans
    // l'ombre : c'est ce contraste qui donne le relief.
    var LUM = (function () {
        var x = -0.30, y = 0.58, z = -0.76, n = Math.sqrt(x * x + y * y + z * z);
        return [x / n, y / n, z / n];
    })();

    var ctx = null;
    var largeur = 0, hauteur = 0, dpr = 1;
    var xs, ys;                    // les points du réseau
    var encre = 'rgba(26, 26, 26, 0.12)', sombre = false;
    var boucle = 0, dernier = 0;

    // ------------------------------------------------------------------
    // Le réseau
    // ------------------------------------------------------------------

    function mesurer() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        largeur = window.innerWidth;
        hauteur = window.innerHeight;
        toile.width = Math.round(largeur * dpr);
        toile.height = Math.round(hauteur * dpr);

        // Même construction que le champ : les rangées se répartissent sur
        // la hauteur exacte, les colonnes partent de l'axe de la page.
        var rangees = Math.round(hauteur / PAS_Y);
        var pas = hauteur / rangees;
        var centre = largeur / 2;
        var demi = Math.ceil(centre / PAS_X) + 1;

        var n = (rangees + 1) * (demi * 2 + 1);
        xs = new Float32Array(n);
        ys = new Float32Array(n);
        var k = 0;
        for (var j = 0; j <= rangees; j++) {
            var decalage = (j % 2) ? PAS_X / 2 : 0;
            for (var i = -demi; i <= demi; i++) {
                xs[k] = centre + i * PAS_X + decalage;
                ys[k] = j * pas;
                k += 1;
            }
        }
    }

    function lireTheme() {
        var style = getComputedStyle(document.documentElement);
        var rgb = (style.getPropertyValue('--text-rgb') || '26, 26, 26').trim();
        sombre = document.documentElement.getAttribute('data-theme') === 'dark';
        encre = 'rgba(' + rgb + ', ' + (sombre ? 0.15 : 0.12) + ')';
    }

    // ------------------------------------------------------------------
    // Le pont
    // ------------------------------------------------------------------

    // Distance du point (x, y, z) à la pierre la plus proche. Chaque rang
    // est un mur dans lequel on perce des arches : un rectangle surmonté
    // d'un demi-cercle, répété à chaque travée.
    function distance(x, y, z) {
        // Le rang du bas : il descend sans fin, le sol est hors de l'écran.
        var u = x - TRAVEE * Math.round(x / TRAVEE);
        var au = u < 0 ? -u : u;
        var dy = y - NAISS;
        var vide = dy > 0 ? Math.sqrt(u * u + dy * dy) - OUV : (au - OUV > dy ? au - OUV : dy);
        if (dy <= 0) vide = au - OUV;
        var az = z < 0 ? -z : z;
        var mur = az - EP_1 > y - HAUT_1 ? az - EP_1 : y - HAUT_1;
        var d1 = mur > -vide ? mur : -vide;

        // Le rang du haut : une bande, percée de petites arches.
        var u2 = x - PETITE * Math.round(x / PETITE);
        var au2 = u2 < 0 ? -u2 : u2;
        var dy2 = y - NAISS_2;
        var vide2 = dy2 > 0 ? Math.sqrt(u2 * u2 + dy2 * dy2) - OUV_2 : au2 - OUV_2;
        // Une petite arche ne descend pas sous le dessus du rang du bas.
        if (HAUT_1 - y > vide2) vide2 = HAUT_1 - y;
        var mur2 = az - EP_2;
        if (y - HAUT_2 > mur2) mur2 = y - HAUT_2;
        if (HAUT_1 - y > mur2) mur2 = HAUT_1 - y;
        var d2 = mur2 > -vide2 ? mur2 : -vide2;

        return d1 < d2 ? d1 : d2;
    }

    // ------------------------------------------------------------------
    // Le tracé
    // ------------------------------------------------------------------

    // La marche d'un rayon : il avance de la distance qui le sépare de la
    // pierre, jusqu'à la toucher ou sortir de la portée. Le résultat est
    // laissé dans M (s : chemin parcouru ; x, y, z : point touché ;
    // proche : plus petite distance croisée).
    var M = { s: 0, x: 0, y: 0, z: 0, proche: 1 };
    function marcher(ox, oy, oz, dx, dy, dz, depuis, jusque) {
        var s = depuis, proche = 1, px = 0, py = 0, pz = 0;
        for (var n = 0; n < 56; n++) {
            px = ox + dx * s; py = oy + dy * s; pz = oz + dz * s;
            var d = distance(px, py, pz);
            if (d < proche) proche = d;
            if (d < 0.004 * (s > 1 ? s : 1)) {
                M.s = s; M.x = px; M.y = py; M.z = pz; M.proche = proche;
                return true;
            }
            s += d * 0.92;
            if (s > jusque) break;
        }
        M.s = s; M.proche = proche;
        return false;
    }

    // La clarté de la pierre au point touché, de 0 (ombre) à 1 (soleil).
    // La pente de la surface, par différences, donne sa normale.
    function clarte(px, py, pz) {
        var h = 0.004;
        var nx = distance(px + h, py, pz) - distance(px - h, py, pz);
        var ny = distance(px, py + h, pz) - distance(px, py - h, pz);
        var nz = distance(px, py, pz + h) - distance(px, py, pz - h);
        var nn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        var eclat = (nx * LUM[0] + ny * LUM[1] + nz * LUM[2]) / nn;
        return 0.10 + 0.90 * (eclat < 0 ? 0 : eclat);
    }

    // En clair, l'encre est sombre : elle dessine les ombres. En sombre,
    // elle est claire : elle dessine les lumières.
    function tonPierre(clair) {
        return sombre ? 0.16 + 0.84 * clair : 0.24 + 0.76 * (1 - clair);
    }

    // L'air : plus une chose est loin, plus ses points s'amenuisent,
    // jusqu'à rejoindre le papier.
    function air(s) {
        var a = 1 - (s - 2.6) / 10.5;
        return a <= 0 ? 0 : (a >= 1 ? 1 : a * a);
    }

    function tracer(maintenant) {
        boucle = 0;
        if (!SEUIL.matches || !ctx) return;
        if (maintenant - dernier < CADENCE) { reveiller(); return; }
        dernier = maintenant;

        var t = CALME.matches ? 0 : maintenant / 1000;

        // L'œil : devant le pont, à droite, tourné vers la gauche le long
        // de l'ouvrage. Il avance lentement ; le pont étant le même à
        // chaque travée, la marche ne finit jamais.
        var ex = t * 0.035;
        var ey = 0.02;
        var ez = -3.3;
        // La direction du regard, puis la droite et le haut de l'image.
        var fx = -0.66, fy = 0.06, fz = 1.0;
        var fn = Math.sqrt(fx * fx + fy * fy + fz * fz);
        fx /= fn; fy /= fn; fz /= fn;
        var rx = fz, rz = -fx;                 // droite = haut du monde x regard
        var rn = Math.sqrt(rx * rx + rz * rz);
        rx /= rn; rz /= rn;
        var ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;   // haut = regard x droite

        // Le champ de vision se cale sur la hauteur : le pont garde sa
        // taille d'un écran à l'autre, et un écran large en voit plus long.
        var focale = hauteur * 1.08;
        var cx = largeur * 0.60, cy = hauteur * 0.54;
        var PORTEE = 15;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();

        for (var i = 0; i < xs.length; i++) {
            var a = (xs[i] - cx) / focale, b = (cy - ys[i]) / focale;
            var dx = fx + rx * a + ux * b, dy = fy + uy * b, dz = fz + rz * a + uz * b;
            var dn = Math.sqrt(dx * dx + dy * dy + dz * dz);
            dx /= dn; dy /= dn; dz /= dn;

            // Où ce rayon rencontrerait l'eau, s'il descend.
            var sEau = dy < -0.002 ? (EAU - ey) / dy : 1e9;
            var ton = 0;

            if (marcher(ex, ey, ez, dx, dy, dz, 1.2, sEau < PORTEE ? sEau : PORTEE)) {
                // La pierre.
                ton = tonPierre(clarte(M.x, M.y, M.z)) * air(M.s);
            } else if (sEau < PORTEE) {
                // La rivière. Des rides lentes courent à sa surface : elles
                // se lisent seules, en lignes de points, et elles
                // dévient le reflet.
                var wx = ex + dx * sEau, wz = ez + dz * sEau;
                var ride = Math.sin(wz * 12 + Math.sin(wx * 3.2 + t * 0.5) * 1.5 + t * 0.6);
                ton = 0.035 + 0.05 * (ride * 0.5 + 0.5);
                // Le reflet : le même rayon, renvoyé vers le haut.
                if (marcher(wx, EAU, wz, dx + 0.03 * ride, -dy, dz, 0.03, PORTEE - sEau)) {
                    ton += tonPierre(clarte(M.x, M.y, M.z)) * 0.5 * air(sEau + M.s);
                }
                ton *= air(sEau);
            } else {
                // Le ciel : il se charge en montant vers le zénith. Du côté
                // du soleil, en haut à gauche, il reste clair.
                var haut = dy / 0.42;
                if (haut > 0) {
                    if (haut > 1) haut = 1;
                    var sx = a + 0.95, sy = b - 0.5;
                    var soleil = 1 - Math.sqrt(sx * sx + sy * sy) / 1.7;
                    if (soleil < 0) soleil = 0;
                    ton = 0.16 * haut * Math.sqrt(haut) * (0.3 + 0.7 * (sombre ? soleil : 1 - soleil));
                }
                // L'arête de la pierre s'achève en quelques points plus petits.
                if (M.proche < 0.03 && M.s <= PORTEE) {
                    var arete = (1 - M.proche / 0.03) * 0.2 * air(M.s);
                    if (arete > ton) ton = arete;
                }
            }

            if (ton < 0.015) continue;
            // La loi du halftone : c'est l'aire du point qui suit le ton.
            var rayon = RAYON_MAX * Math.sqrt(ton > 1 ? 1 : ton);
            ctx.moveTo(xs[i] + rayon, ys[i]);
            ctx.arc(xs[i], ys[i], rayon, 0, 6.2832);
        }
        ctx.fill();

        // En mouvement réduit, le paysage est une image fixe.
        if (!CALME.matches) reveiller();
    }

    function reveiller() {
        if (!boucle && ctx && SEUIL.matches && !document.hidden) boucle = requestAnimationFrame(tracer);
    }
    document.addEventListener('visibilitychange', reveiller);

    // ------------------------------------------------------------------
    // La mise en route
    // ------------------------------------------------------------------

    var redim;
    function reprendre() {
        // Le contexte n'est demandé qu'au moment de dessiner : sous le
        // seuil, la trame ne sert pas et n'a rien à préparer.
        if (!SEUIL.matches) {
            if (ctx) ctx.clearRect(0, 0, toile.width, toile.height);
            return;
        }
        if (!ctx) ctx = toile.getContext('2d');
        if (!ctx) return;
        lireTheme();
        mesurer();
        dernier = 0;
        reveiller();
    }

    window.addEventListener('resize', function () {
        clearTimeout(redim);
        redim = setTimeout(reprendre, 120);
    });

    new MutationObserver(function () {
        if (!ctx) return;
        lireTheme();
        dernier = 0;
        reveiller();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    reprendre();
})();
