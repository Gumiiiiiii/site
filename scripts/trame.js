// La trame vivante de l'accueil.
//
// Le fond pointé du site est un halftone : un dessin fait de points d'une
// seule encre, dont seule la taille dit le ton. Ici ce dessin devient un
// volume. Trois anneaux plats, emboîtés comme ceux d'un gyroscope, tournent
// lentement dans l'espace ; une lumière les éclaire, et c'est l'ombre de
// chaque face qui règle la taille de ses points. Le volume n'est donc
// jamais un aplat ni une image : c'est le réseau du champ
// (scripts/points-champ.js, à demi-pas) qui le porte, point par point.
//
// Trois règles le tiennent :
//   · une seule encre, en gris : la couleur du site est réservée à ce qui
//     se clique ;
//   · une encre légère, pour que le texte se lise par-dessus sans qu'on
//     ait à découper le fond derrière lui ;
//   · un mouvement lent, que le curseur incline à peine.
//
// Le calcul : pour chaque point du réseau, un rayon part droit dans
// l'écran et avance jusqu'à toucher un anneau (marche par distance). Au
// point touché, la pente de la surface donne son éclairage.
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

    // Le volume. r : rayon de l'anneau ; l : demi-largeur de sa bande ;
    // e : demi-épaisseur. vx, vy, vz : vitesses de rotation, en rad/s ;
    // p : phase de départ. L'unité est le rayon du plus grand anneau.
    var ANNEAUX = [
        { r: 1.00, l: 0.150, e: 0.030, vx: 0.11, vy: 0.07, vz: 0.03, p: 0.4 },
        { r: 0.72, l: 0.130, e: 0.030, vx: -0.06, vy: 0.13, vz: 0.05, p: 2.1 },
        { r: 0.46, l: 0.110, e: 0.030, vx: 0.09, vy: -0.05, vz: 0.12, p: 4.0 }
    ];
    var ARRONDI = 0.022;
    // La lumière vient d'en haut à gauche, devant l'écran.
    var LUM = (function () {
        var x = -0.48, y = -0.62, z = -0.62, n = Math.sqrt(x * x + y * y + z * z);
        return [x / n, y / n, z / n];
    })();

    var ctx = null;
    var largeur = 0, hauteur = 0, dpr = 1;
    var xs, ys;                    // les points du réseau
    var encre = 'rgba(26, 26, 26, 0.13)', sombre = false;
    var boucle = 0, dernier = 0;
    var souris = { x: 0.5, y: 0.5, cx: 0.5, cy: 0.5 };
    var mats = [];                 // la rotation de chaque anneau, pour l'image en cours

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
    // Le volume
    // ------------------------------------------------------------------

    // Rotation X puis Y puis Z, rangée en neuf nombres.
    function rotation(a, b, c) {
        var ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
        return [
            cb * cc, sa * sb * cc - ca * sc, ca * sb * cc + sa * sc,
            cb * sc, sa * sb * sc + ca * cc, ca * sb * sc - sa * cc,
            -sb, sa * cb, ca * cb
        ];
    }

    // Distance du point (x, y, z) à la surface la plus proche. Chaque
    // anneau est un tore dont la section est un rectangle arrondi : une
    // bande plate, large le long de son axe et mince dans son rayon.
    function distance(x, y, z) {
        var d = 1e9;
        for (var i = 0; i < ANNEAUX.length; i++) {
            var m = mats[i], A = ANNEAUX[i];
            var px = m[0] * x + m[1] * y + m[2] * z;
            var py = m[3] * x + m[4] * y + m[5] * z;
            var pz = m[6] * x + m[7] * y + m[8] * z;
            var qx = Math.abs(Math.sqrt(px * px + pz * pz) - A.r) - A.e;
            var qy = Math.abs(py) - A.l;
            var ex = qx > 0 ? qx : 0, ey = qy > 0 ? qy : 0;
            var di = Math.sqrt(ex * ex + ey * ey) + Math.min(qx > qy ? qx : qy, 0) - ARRONDI;
            if (di < d) d = di;
        }
        return d;
    }

    // ------------------------------------------------------------------
    // Le tracé
    // ------------------------------------------------------------------

    function tracer(maintenant) {
        boucle = 0;
        if (!SEUIL.matches || !ctx) return;
        if (maintenant - dernier < CADENCE) { reveiller(); return; }
        dernier = maintenant;

        // Le curseur incline le volume, avec un temps de retard.
        souris.cx += (souris.x - souris.cx) * 0.05;
        souris.cy += (souris.y - souris.cy) * 0.05;
        var t = CALME.matches ? 14 : maintenant / 1000;
        var penche = (souris.cy - 0.5) * 0.5, tourne = (souris.cx - 0.5) * 0.7;
        for (var a = 0; a < ANNEAUX.length; a++) {
            var A = ANNEAUX[a];
            mats[a] = rotation(A.p + t * A.vx + penche, A.p * 1.7 + t * A.vy + tourne, A.p * 0.6 + t * A.vz);
        }

        // Le volume se tient à droite du centre, un peu bas, et déborde de
        // l'écran : on n'en voit jamais le tour entier.
        var echelle = Math.max(hauteur * 0.66, largeur * 0.3);
        var ox = largeur * 0.64, oy = hauteur * 0.55;
        var portee = 1.2;          // au-delà, il n'y a rien à chercher

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = encre;
        ctx.beginPath();

        for (var i = 0; i < xs.length; i++) {
            var x = (xs[i] - ox) / echelle, y = (ys[i] - oy) / echelle;
            var r2 = x * x + y * y;
            if (r2 > portee * portee) continue;

            // La marche : le rayon entre par l'avant de la sphère englobante.
            var fond = Math.sqrt(portee * portee - r2);
            var z = -fond, touche = false, proche = 1;
            for (var pasN = 0; pasN < 34; pasN++) {
                var d = distance(x, y, z);
                if (d < proche) proche = d;
                if (d < 0.004) { touche = true; break; }
                z += d;
                if (z > fond) break;
            }

            var ton;
            if (touche) {
                // La pente de la surface, par différences, donne sa normale.
                var h = 0.003;
                var nx = distance(x + h, y, z) - distance(x - h, y, z);
                var ny = distance(x, y + h, z) - distance(x, y - h, z);
                var nz = distance(x, y, z + h) - distance(x, y, z - h);
                var nn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
                var eclat = (nx * LUM[0] + ny * LUM[1] + nz * LUM[2]) / nn;
                if (eclat < 0) eclat = 0;
                // Ce qui est près de l'œil ressort un peu : les anneaux se
                // détachent les uns des autres là où ils se croisent.
                var pres = 0.5 - z / (2 * portee);
                var clair = 0.04 + 0.82 * eclat + 0.14 * pres;
                // En clair, l'encre est sombre : elle dessine les ombres.
                // En sombre, elle est claire : elle dessine les lumières.
                ton = sombre ? 0.14 + 0.86 * clair : 0.2 + 0.8 * (1 - clair);
            } else if (proche < 0.02) {
                // Le bord du volume s'achève en quelques points plus petits.
                ton = (1 - proche / 0.02) * 0.22;
            } else {
                continue;
            }
            if (ton < 0.015) continue;
            // La loi du halftone : c'est l'aire du point qui suit le ton.
            var rayon = RAYON_MAX * Math.sqrt(ton > 1 ? 1 : ton);
            ctx.moveTo(xs[i] + rayon, ys[i]);
            ctx.arc(xs[i], ys[i], rayon, 0, 6.2832);
        }
        ctx.fill();

        // En mouvement réduit, le volume est une image fixe.
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
