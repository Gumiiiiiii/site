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
// Trois règles le tiennent :
//   · une seule encre, en gris : la couleur du site est réservée à ce qui
//     se clique ;
//   · une encre légère, pour que le texte se lise par-dessus sans qu'on
//     ait à découper le fond derrière lui ;
//   · un mouvement lent : on longe le pont au pas, et le curseur déplace
//     à peine le regard.
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
    var souris = { x: 0.5, y: 0.5, cx: 0.5, cy: 0.5 };

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

    function tracer(maintenant) {
        boucle = 0;
        if (!SEUIL.matches || !ctx) return;
        if (maintenant - dernier < CADENCE) { reveiller(); return; }
        dernier = maintenant;

        souris.cx += (souris.x - souris.cx) * 0.05;
        souris.cy += (souris.y - souris.cy) * 0.05;
        var t = CALME.matches ? 0 : maintenant / 1000;

        // L'œil : devant le pont, à droite, tourné vers la gauche le long
        // de l'ouvrage. Il avance lentement ; le pont étant le même à
        // chaque travée, la marche ne finit jamais.
        var ex = t * 0.035 + (souris.cx - 0.5) * 0.35;
        var ey = 0.02 - (souris.cy - 0.5) * 0.14;
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

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();

        for (var i = 0; i < xs.length; i++) {
            var a = (xs[i] - cx) / focale, b = (cy - ys[i]) / focale;
            var dx = fx + rx * a + ux * b, dy = fy + uy * b, dz = fz + rz * a + uz * b;
            var dn = Math.sqrt(dx * dx + dy * dy + dz * dz);
            dx /= dn; dy /= dn; dz /= dn;

            // La marche. Au-delà de la portée, le pont s'est fondu dans l'air.
            var s = 1.2, touche = false, proche = 1, px = 0, py = 0, pz = 0;
            for (var n = 0; n < 56; n++) {
                px = ex + dx * s; py = ey + dy * s; pz = ez + dz * s;
                var d = distance(px, py, pz);
                if (d < proche) proche = d;
                if (d < 0.004 * s) { touche = true; break; }
                s += d * 0.92;
                if (s > 15) break;
            }

            var ton;
            if (touche) {
                // La pente de la surface, par différences, donne sa normale.
                var h = 0.004;
                var nx = distance(px + h, py, pz) - distance(px - h, py, pz);
                var ny = distance(px, py + h, pz) - distance(px, py - h, pz);
                var nz = distance(px, py, pz + h) - distance(px, py, pz - h);
                var nn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
                var eclat = (nx * LUM[0] + ny * LUM[1] + nz * LUM[2]) / nn;
                if (eclat < 0) eclat = 0;
                var clair = 0.10 + 0.90 * eclat;
                // En clair, l'encre est sombre : elle dessine les ombres.
                // En sombre, elle est claire : elle dessine les lumières.
                ton = sombre ? 0.16 + 0.84 * clair : 0.24 + 0.76 * (1 - clair);
            } else if (proche < 0.03 && s <= 15) {
                // L'arête s'achève en quelques points plus petits.
                ton = (1 - proche / 0.03) * 0.2;
            } else {
                continue;
            }
            // L'air : plus la pierre est loin, plus ses points s'amenuisent,
            // jusqu'à rejoindre le papier.
            var air = 1 - (s - 2.6) / 10.5;
            if (air <= 0) continue;
            if (air < 1) ton *= air * air;
            if (ton < 0.015) continue;
            // La loi du halftone : c'est l'aire du point qui suit le ton.
            var rayon = RAYON_MAX * Math.sqrt(ton > 1 ? 1 : ton);
            ctx.moveTo(xs[i] + rayon, ys[i]);
            ctx.arc(xs[i], ys[i], rayon, 0, 6.2832);
        }
        ctx.fill();

        // En mouvement réduit, le pont est une image fixe.
        if (!CALME.matches) reveiller();
    }

    function reveiller() {
        if (!boucle && ctx && SEUIL.matches && !document.hidden) boucle = requestAnimationFrame(tracer);
    }
    document.addEventListener('visibilitychange', reveiller);

    window.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        souris.x = e.clientX / (largeur || 1);
        souris.y = e.clientY / (hauteur || 1);
    }, { passive: true });

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
