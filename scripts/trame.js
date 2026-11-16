// La trame vivante de l'accueil.
//
// Le fond pointé du site est un halftone : un dessin fait de points, dont
// la taille dit le ton. Ici ce dessin devient un dégradé maillé. Plusieurs
// foyers dérivent lentement sur l'écran ; chacun grossit les points autour
// de lui et les teinte, de l'encre au violet du site. Là où deux foyers se
// rencontrent, les tons se mêlent. Le dégradé n'est donc jamais un aplat :
// c'est toujours le réseau du champ (scripts/points-champ.js, à demi-pas)
// qui le porte, point par point.
//
// Une chose s'y ajoute : l'outil survolé, dont l'icône se dessine en
// points par-dessus le dégradé, qui s'efface alors d'un cran.
//
// Sous un texte, la trame se retire presque entièrement : un titre efface
// les points sous lui, c'est la règle du site (styles/outil-papier.css).
(function () {
    var toile = document.getElementById('trame');
    if (!toile || !toile.getContext) return;

    // Le même seuil que styles/ecran.css : en dessous, la page défile et la
    // trame reste le champ de points ordinaire.
    var SEUIL = window.matchMedia('(min-width: 1100px) and (min-height: 600px)');
    var CALME = window.matchMedia('(prefers-reduced-motion: reduce)');

    var PAS_X = 10, PAS_Y = 9;     // le demi-pas du champ (20 x 18)
    var RAYON_MAX = 5.3;           // un point plein, juste avant de toucher ses voisins
    var VITESSE = 0.55;            // l'onde d'une icône, en ms par px
    var TONS = 12;                 // paliers de teinte, de l'encre au violet
    var CADENCE = 33;              // le dégradé avance à 30 images par seconde

    // Les foyers du dégradé. x, y : centre de la course, en part d'écran.
    // ax, ay : amplitude. vx, vy : vitesse. r : portée, en part de la
    // diagonale. ton : 0 pour l'encre, 1 pour le violet. f : force.
    var FOYERS = [
        { x: 0.26, y: 0.26, ax: 0.20, ay: 0.16, vx: 0.11, vy: 0.07, p: 0.0, r: 0.25, ton: 1.0, f: 0.95 },
        { x: 0.60, y: 0.20, ax: 0.18, ay: 0.14, vx: 0.07, vy: 0.10, p: 1.7, r: 0.20, ton: 0.0, f: 0.75 },
        { x: 0.48, y: 0.58, ax: 0.24, ay: 0.20, vx: 0.05, vy: 0.08, p: 3.1, r: 0.27, ton: 0.6, f: 0.8 },
        { x: 0.12, y: 0.66, ax: 0.12, ay: 0.20, vx: 0.09, vy: 0.05, p: 4.4, r: 0.19, ton: 0.2, f: 0.7 },
        { x: 0.84, y: 0.72, ax: 0.14, ay: 0.18, vx: 0.06, vy: 0.09, p: 5.6, r: 0.23, ton: 1.0, f: 0.85 },
        { x: 0.42, y: 0.06, ax: 0.30, ay: 0.10, vx: 0.04, vy: 0.06, p: 2.3, r: 0.18, ton: 0.8, f: 0.65 },
        { x: 0.74, y: 0.40, ax: 0.16, ay: 0.22, vx: 0.08, vy: 0.04, p: 0.9, r: 0.17, ton: 0.4, f: 0.7 },
        { x: 0.92, y: 0.16, ax: 0.10, ay: 0.14, vx: 0.05, vy: 0.11, p: 3.8, r: 0.16, ton: 0.0, f: 0.6 }
    ];

    // Les contextes ne sont demandés qu'au moment de dessiner : sous le
    // seuil, la trame ne sert pas et n'a rien à préparer.
    var ctx = null, tampon = null, tctx = null;
    function preparer() {
        if (ctx) return true;
        ctx = toile.getContext('2d');
        tampon = document.createElement('canvas');
        tctx = tampon.getContext('2d', { willReadFrequently: true });
        return !!(ctx && tctx);
    }

    var largeur = 0, hauteur = 0, dpr = 1;
    var xs, ys, calme, icone, cible, retard, rayons, tons;   // un élément par point
    var colonnes = 0, rangees = 0;
    var couleurs = [];

    var motif = null, image = null;      // l'icône en cours, s'il y en a une
    var depart = 0, enCours = false, presence = 0;
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
        rangees = Math.round(hauteur / PAS_Y);
        var pas = hauteur / rangees;
        var centre = largeur / 2;
        var demi = Math.ceil(centre / PAS_X) + 1;
        colonnes = demi * 2 + 1;

        var n = (rangees + 1) * colonnes;
        xs = new Float32Array(n);
        ys = new Float32Array(n);
        calme = new Float32Array(n);
        icone = new Float32Array(n);
        cible = new Float32Array(n);
        retard = new Float32Array(n);
        rayons = new Float32Array(n);
        tons = new Uint8Array(n);

        var k = 0;
        for (var j = 0; j <= rangees; j++) {
            var decalage = (j % 2) ? PAS_X / 2 : 0;
            for (var i = -demi; i <= demi; i++) {
                xs[k] = centre + i * PAS_X + decalage;
                ys[k] = j * pas;
                k += 1;
            }
        }
        zonesCalmes();
    }

    // Les blocs de texte : la trame s'y retire, avec un bord fondu.
    function zonesCalmes() {
        var zones = Array.prototype.map.call(document.querySelectorAll('[data-trame-calme]'), function (el) {
            var r = el.getBoundingClientRect();
            return { g: r.left, d: r.right, h: r.top, b: r.bottom };
        }).filter(function (z) { return z.d > z.g && z.b > z.h; });

        var FONDU = 80, RESTE = 0.07;
        for (var k = 0; k < xs.length; k++) {
            var q = 1;
            for (var z = 0; z < zones.length; z++) {
                var dx = Math.max(zones[z].g - xs[k], 0, xs[k] - zones[z].d);
                var dy = Math.max(zones[z].h - ys[k], 0, ys[k] - zones[z].b);
                var d = Math.sqrt(dx * dx + dy * dy);
                var t = d >= FONDU ? 1 : d / FONDU;
                q = Math.min(q, RESTE + (1 - RESTE) * t * t * (3 - 2 * t));
            }
            calme[k] = q;
        }
    }

    // Les teintes : de l'encre du thème au violet du site, par paliers.
    // L'encre reste discrète, le violet se pose plus franchement.
    function lireTheme() {
        var style = getComputedStyle(document.documentElement);
        var encre = (style.getPropertyValue('--text-rgb') || '26, 26, 26').split(',').map(Number);
        var sombre = document.documentElement.getAttribute('data-theme') === 'dark';
        var violet = sombre ? [180, 155, 255] : [156, 119, 245];
        var a0 = sombre ? 0.2 : 0.17, a1 = sombre ? 0.5 : 0.46;
        couleurs = [];
        for (var i = 0; i < TONS; i++) {
            var t = i / (TONS - 1);
            couleurs.push('rgba('
                + Math.round(encre[0] + (violet[0] - encre[0]) * t) + ', '
                + Math.round(encre[1] + (violet[1] - encre[1]) * t) + ', '
                + Math.round(encre[2] + (violet[2] - encre[2]) * t) + ', '
                + (a0 + (a1 - a0) * t).toFixed(3) + ')');
        }
    }

    // ------------------------------------------------------------------
    // L'icône d'un outil
    // ------------------------------------------------------------------
    // Elle est dessinée sur un tampon d'un pixel par point, puis lue : la
    // luminance de chaque pixel devient la taille de son point.

    // La scène : ce qui reste libre au-dessus de la phrase et à gauche de
    // l'index. L'icône s'y loge en entier, elle ne passe sous aucun texte.
    function scene() {
        var phrase = document.getElementById('hero-text');
        var index = document.querySelector('.outils');
        var haut = 76;
        var bas = (phrase ? phrase.getBoundingClientRect().top : hauteur * 0.5) - 28;
        var droite = (index ? index.getBoundingClientRect().left : largeur) - 56;
        return { g: 32, h: haut, l: droite - 32, ht: bas - haut };
    }

    function poserCible(origine) {
        if (!tctx) return;
        var w = colonnes, h = rangees + 1;
        tampon.width = w;
        tampon.height = h;
        tctx.setTransform(1, 0, 0, 1, 0, 0);
        tctx.fillStyle = '#fff';
        tctx.fillRect(0, 0, w, h);

        var s = scene();
        if (motif && image && s.ht > 110 && s.l > 200) {
            // On dessine en coordonnées d'écran, la mise à l'échelle fait
            // le reste.
            tctx.setTransform(1 / PAS_X, 0, 0, rangees / hauteur, xs[0] / -PAS_X, 0);
            var cote = Math.min(s.ht, s.l) * 0.98;
            tctx.drawImage(image, s.g + s.l * 0.58 - cote / 2, s.h + (s.ht - cote) / 2, cote, cote);
        }

        var pixels = tctx.getImageData(0, 0, w, h).data;
        var ox = origine ? origine.x : largeur / 2;
        var oy = origine ? origine.y : hauteur / 2;
        for (var k = 0; k < xs.length; k++) {
            var ton = (1 - pixels[k * 4] / 255) * 1.08;
            cible[k] = ton > 1 ? 1 : ton;
            var dx = xs[k] - ox, dy = ys[k] - oy;
            retard[k] = Math.sqrt(dx * dx + dy * dy) * VITESSE;
        }
        depart = performance.now();
        enCours = true;
        if (CALME.matches) { icone.set(cible); enCours = false; }
        reveiller();
    }

    // « origine » est le point d'où part l'onde : l'outil survolé.
    function montrer(svg, origine) {
        if ((motif || '') === (svg || '')) return;
        motif = svg || null;
        if (!motif) { image = null; poserCible(origine); return; }
        var cle = motif;
        var img = new Image();
        img.onload = function () {
            // Un survol plus récent a pu passer entre-temps.
            if (motif !== cle) return;
            image = img;
            poserCible(origine);
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    // ------------------------------------------------------------------
    // Le tracé
    // ------------------------------------------------------------------

    function tracer(maintenant) {
        boucle = 0;
        if (!SEUIL.matches) return;
        // Le dégradé dérive lentement : 30 images par seconde lui suffisent.
        if (maintenant - dernier < CADENCE && !enCours) { reveiller(); return; }
        dernier = maintenant;

        if (enCours) {
            var ecoule = maintenant - depart;
            var reste = false;
            for (var k = 0; k < icone.length; k++) {
                if (ecoule < retard[k]) { reste = true; continue; }
                var ecart = cible[k] - icone[k];
                if (ecart > 0.004 || ecart < -0.004) { icone[k] += ecart * 0.18; reste = true; }
                else icone[k] = cible[k];
            }
            enCours = reste;
        }
        // Le dégradé s'efface d'un cran pendant qu'une icône est montrée.
        presence += ((motif ? 1 : 0) - presence) * 0.09;
        var voile = 1 - 0.72 * presence;

        var t = CALME.matches ? 0 : maintenant / 1000;
        var diag = Math.sqrt(largeur * largeur + hauteur * hauteur);
        var fx = [], fy = [], fr = [];
        for (var f = 0; f < FOYERS.length; f++) {
            var F = FOYERS[f];
            fx.push((F.x + F.ax * Math.sin(t * F.vx + F.p)) * largeur);
            fy.push((F.y + F.ay * Math.cos(t * F.vy + F.p * 1.3)) * hauteur);
            var r = F.r * diag * (1 + 0.12 * Math.sin(t * 0.13 + F.p));
            fr.push(r * r);
        }
        // Une houle lente plisse le tout : sans elle, les foyers ne seraient
        // que des disques.
        var h1 = t * 0.21, h2 = t * 0.16;

        for (var i = 0; i < xs.length; i++) {
            var x = xs[i], y = ys[i];
            var somme = 0, teinte = 0;
            for (var g = 0; g < FOYERS.length; g++) {
                var dx = x - fx[g], dy = y - fy[g];
                var d2 = (dx * dx + dy * dy) / fr[g];
                if (d2 >= 1) continue;
                var w = (1 - d2) * (1 - d2) * FOYERS[g].f;
                somme += w;
                teinte += w * FOYERS[g].ton;
            }
            var v = 0, ton = 0;
            if (somme > 0.01) {
                ton = teinte / somme;
                var houle = 0.78 + 0.22 * Math.sin(x * 0.0052 + h1 + Math.sin(y * 0.0041 - h2) * 1.6);
                // Une compression douce : le ton monte sans jamais plafonner
                // en aplat, ce qui garde le dégradé lisible jusqu'au cœur.
                v = somme * houle;
                v = (1.32 * v / (0.42 + v)) * calme[i] * voile;
                if (v > 1) v = 1;
            }
            var ic = icone[i];
            if (ic > v) { v = ic; ton = 0; }
            if (v < 0.012) { rayons[i] = 0; continue; }
            // La loi du halftone : c'est l'aire du point qui suit le ton.
            rayons[i] = RAYON_MAX * Math.sqrt(v);
            tons[i] = Math.round(ton * (TONS - 1));
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        for (var c = 0; c < TONS; c++) {
            ctx.fillStyle = couleurs[c];
            ctx.beginPath();
            for (var n = 0; n < xs.length; n++) {
                if (!rayons[n] || tons[n] !== c) continue;
                ctx.moveTo(xs[n] + rayons[n], ys[n]);
                ctx.arc(xs[n], ys[n], rayons[n], 0, 6.2832);
            }
            ctx.fill();
        }

        // En mouvement réduit, le dégradé est une image fixe : on ne
        // redessine que pour une icône.
        if (!CALME.matches || enCours || Math.abs((motif ? 1 : 0) - presence) > 0.01) reveiller();
    }

    function reveiller() {
        if (!boucle && ctx && SEUIL.matches && !document.hidden) boucle = requestAnimationFrame(tracer);
    }
    document.addEventListener('visibilitychange', reveiller);

    // ------------------------------------------------------------------
    // Les outils : l'icône au survol
    // ------------------------------------------------------------------

    function centre(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    // L'icône d'un outil, redessinée à l'encre pleine pour le tampon.
    function svgDe(el) {
        var svg = el.querySelector('svg');
        if (!svg) return '';
        var copie = svg.cloneNode(true);
        copie.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        copie.setAttribute('width', '480');
        copie.setAttribute('height', '480');
        copie.setAttribute('stroke', '#000');
        copie.setAttribute('stroke-width', '2.4');
        return copie.outerHTML.replace(/currentColor/g, '#000');
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-trame-icone]'), function (el) {
        function entrer() { if (ctx) montrer(svgDe(el), centre(el)); }
        function sortir() { if (ctx) montrer(null, centre(el)); }
        el.addEventListener('mouseenter', entrer);
        el.addEventListener('focus', entrer);
        el.addEventListener('mouseleave', sortir);
        el.addEventListener('blur', sortir);
    });

    // ------------------------------------------------------------------
    // La mise en route
    // ------------------------------------------------------------------

    var redim;
    function reprendre() {
        if (!SEUIL.matches || !preparer()) {
            if (ctx) ctx.clearRect(0, 0, toile.width, toile.height);
            return;
        }
        lireTheme();
        mesurer();
        var garde = motif;
        motif = null;
        image = null;
        if (garde) montrer(garde);
        reveiller();
    }

    window.addEventListener('resize', function () {
        clearTimeout(redim);
        redim = setTimeout(reprendre, 120);
    });

    // Le texte change de place avec la langue et avec l'arrivée de la
    // fonte : les zones calmes se remesurent.
    function remesurer() {
        if (!SEUIL.matches || !xs) return;
        zonesCalmes();
        reveiller();
    }
    document.addEventListener('gumi:lang', function () { setTimeout(remesurer, 1400); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remesurer);
    window.addEventListener('load', remesurer);
    // La phrase s'écrit lettre à lettre à l'arrivée : on remesure après.
    setTimeout(remesurer, 1500);

    new MutationObserver(function () {
        if (!ctx) return;
        lireTheme();
        reveiller();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    reprendre();
})();
