// La trame vivante de l'accueil.
//
// Le fond pointé du site est un halftone : un dessin fait de points d'une
// seule encre, dont seule la taille varie. Ici ce dessin devient l'image de
// la page. Le numéro de l'expérimentation à l'affiche, l'icône de l'outil
// que l'on vise : ce que l'accueil montre en grand, il le montre en points,
// sur le même réseau que le champ de scripts/points-champ.js, à demi-pas.
// Le motif n'est donc pas posé sur le fond, il en sort.
//
// Quatre choses le pilotent :
//   · l'expérimentation à l'affiche, qui change toute seule ;
//   · l'outil survolé, qui prend sa place le temps du survol ;
//   · le curseur, qui porte un halo de points avec lui ;
//   · et, au survol d'une expérimentation, sa couverture, la vraie, qui
//     suit le curseur. Une photo ne se lit pas en points de cette taille :
//     la trame dessine donc des signes, et laisse l'image à l'image.
//
// Sous un texte, la trame se retire : un titre efface les points sous lui,
// c'est la règle du site (voir styles/outil-papier.css).
(function () {
    var toile = document.getElementById('trame');
    if (!toile || !toile.getContext) return;

    // Le même seuil que styles/ecran.css : en dessous, la page défile et la
    // trame reste le champ de points ordinaire.
    var SEUIL = window.matchMedia('(min-width: 1100px) and (min-height: 600px)');
    var CALME = window.matchMedia('(prefers-reduced-motion: reduce)');

    var PAS_X = 10, PAS_Y = 9;     // le demi-pas du champ (20 x 18)
    var RAYON_MAX = 5.3;           // un point plein, juste avant de toucher ses voisins
    var HALO = 190;                // portée du halo du curseur, en px
    var DUREE = 7000;              // une expérimentation à l'affiche, en ms
    var VITESSE = 0.55;            // l'onde d'un changement de motif, en ms par px

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
    var xs, ys, valeur, cible, calme, retard;   // un élément par point
    var colonnes = 0, rangees = 0;
    var encre = '26, 26, 26', sombre = false;

    var motif = null;              // { type: 'texte', texte } ou { type: 'icone', svg }
    var depart = 0, enCours = false, image = null;
    var souris = { x: -9999, y: -9999, cx: -9999, cy: -9999, vue: false };
    var boucle = 0;

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
        valeur = new Float32Array(n);
        cible = new Float32Array(n);
        calme = new Float32Array(n);
        retard = new Float32Array(n);

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

        var FONDU = 70, RESTE = 0.1;
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

    function lireTheme() {
        var style = getComputedStyle(document.documentElement);
        encre = (style.getPropertyValue('--text-rgb') || '26, 26, 26').trim();
        sombre = document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // ------------------------------------------------------------------
    // Les motifs
    // ------------------------------------------------------------------
    // Le motif est dessiné sur une toile d'un pixel par point, puis lu : la
    // luminance de chaque pixel devient la taille de son point.

    function charger(src, suite) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () { suite(img); };
        img.onerror = function () { suite(null); };
        img.src = src;
    }

    // La scène : ce qui reste libre au-dessus de la phrase et à gauche de
    // l'index. Le motif s'y loge en entier, il ne passe sous aucun texte.
    function scene() {
        var phrase = document.getElementById('hero-text');
        var index = document.querySelector('.outils');
        var haut = 78;
        var bas = (phrase ? phrase.getBoundingClientRect().top : hauteur * 0.6) - 30;
        var droite = (index ? index.getBoundingClientRect().left : largeur) - 56;
        return { g: 32, d: droite, h: haut, b: bas, l: droite - 32, ht: bas - haut };
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
        if (motif && s.ht > 120 && s.l > 200) {
            // Le tampon compte un pixel par point : on y dessine en
            // coordonnées d'écran, la mise à l'échelle fait le reste.
            tctx.setTransform(1 / PAS_X, 0, 0, rangees / hauteur, xs[0] / -PAS_X, 0);
            var axe = s.g + s.l * 0.56;
            if (motif.type === 'texte') {
                // Des chiffres hauts comme la scène : leur hauteur vaut à
                // peu près 0,72 du corps.
                var corps = Math.min(s.ht / 0.74, s.l / (0.62 * motif.texte.length));
                tctx.font = '800 ' + corps.toFixed(0) + 'px Urbanist, sans-serif';
                tctx.textAlign = 'center';
                tctx.textBaseline = 'alphabetic';
                tctx.fillStyle = '#000';
                tctx.fillText(motif.texte, axe, s.b - (s.ht - corps * 0.72) / 2);
            } else if (image) {
                var cote = Math.min(s.ht, s.l) * 0.98;
                tctx.drawImage(image, axe - cote / 2, s.h + (s.ht - cote) / 2, cote, cote);
            }
        }

        var pixels = tctx.getImageData(0, 0, w, h).data;
        var ox = origine ? origine.x : largeur / 2;
        var oy = origine ? origine.y : hauteur / 2;
        for (var k = 0; k < xs.length; k++) {
            var p = k * 4;
            var lum = (pixels[p] * 0.299 + pixels[p + 1] * 0.587 + pixels[p + 2] * 0.114) / 255;
            var ton = (1 - lum) * 1.08;
            cible[k] = ton > 1 ? 1 : ton;
            var dx = xs[k] - ox, dy = ys[k] - oy;
            retard[k] = Math.sqrt(dx * dx + dy * dy) * VITESSE;
        }
        depart = performance.now();
        enCours = true;
        if (CALME.matches) {
            valeur.set(cible);
            enCours = false;
        }
        reveiller();
    }

    // Change de motif. « origine » est le point d'où part l'onde : l'élément
    // survolé, ou le centre de l'écran.
    function montrer(nouveau, origine) {
        var cle = nouveau ? nouveau.type + ':' + (nouveau.texte || nouveau.svg) : '';
        if (motif && motif.cle === cle) return;
        motif = nouveau ? { type: nouveau.type, texte: nouveau.texte, svg: nouveau.svg, cle: cle } : null;
        if (!motif || motif.type === 'texte') { image = null; poserCible(origine); return; }

        charger('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(motif.svg), function (img) {
            // Un survol plus récent a pu passer entre-temps.
            if (!motif || motif.cle !== cle) return;
            image = img;
            poserCible(origine);
        });
    }

    // ------------------------------------------------------------------
    // Le tracé
    // ------------------------------------------------------------------

    function tracer(maintenant) {
        boucle = 0;
        var actif = false;

        if (enCours) {
            var ecoule = maintenant - depart;
            var reste = false;
            for (var k = 0; k < valeur.length; k++) {
                if (ecoule < retard[k]) { reste = true; continue; }
                var ecart = cible[k] - valeur[k];
                if (ecart > 0.004 || ecart < -0.004) {
                    valeur[k] += ecart * 0.16;
                    reste = true;
                } else {
                    valeur[k] = cible[k];
                }
            }
            enCours = reste;
            actif = reste;
        }

        // Le halo suit le curseur avec un temps de retard, comme une goutte.
        if (souris.vue) {
            var mx = souris.x - souris.cx, my = souris.y - souris.cy;
            if (Math.abs(mx) > 0.3 || Math.abs(my) > 0.3) {
                souris.cx += mx * 0.14;
                souris.cy += my * 0.14;
                actif = true;
            }
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);
        ctx.fillStyle = 'rgba(' + encre + ', ' + (sombre ? 0.22 : 0.19) + ')';
        ctx.beginPath();
        var halo2 = HALO * HALO;
        for (var i = 0; i < valeur.length; i++) {
            var v = valeur[i] * calme[i];
            if (souris.vue) {
                var dx = xs[i] - souris.cx, dy = ys[i] - souris.cy;
                var d2 = dx * dx + dy * dy;
                if (d2 < halo2) {
                    var f = 1 - Math.sqrt(d2) / HALO;
                    var h = f * f * 0.7 * (0.35 + 0.65 * calme[i]);
                    if (h > v) v = h;
                }
            }
            if (v < 0.012) continue;
            // La loi du halftone : c'est l'aire du point qui suit le ton.
            var r = RAYON_MAX * Math.sqrt(v);
            ctx.moveTo(xs[i] + r, ys[i]);
            ctx.arc(xs[i], ys[i], r, 0, 6.2832);
        }
        ctx.fill();

        if (actif) reveiller();
    }

    function reveiller() {
        if (!boucle && ctx && SEUIL.matches) boucle = requestAnimationFrame(tracer);
    }

    // ------------------------------------------------------------------
    // L'affiche : les expérimentations, à tour de rôle
    // ------------------------------------------------------------------

    var exps = Array.prototype.slice.call(document.querySelectorAll('[data-trame-image]'));
    function numero(i) { return (i < 9 ? '0' : '') + (i + 1); }
    var outils = Array.prototype.slice.call(document.querySelectorAll('[data-trame-icone]'));
    var affiche = -1, minuterie = 0, survolOutil = false;

    function centre(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function afficher(index, origine) {
        if (!exps.length || !ctx) return;
        affiche = (index + exps.length) % exps.length;
        exps.forEach(function (el, i) {
            el.classList.toggle('est-affiche', i === affiche);
            // Relance la jauge : elle est animée en CSS sur cette classe.
            var jauge = el.querySelector('.exp-jauge span');
            if (jauge && i === affiche) {
                jauge.style.animation = 'none';
                void jauge.offsetWidth;
                jauge.style.animation = '';
            }
        });
        if (!survolOutil) {
            montrer({ type: 'texte', texte: numero(affiche) }, origine || centre(exps[affiche]));
        }
        clearTimeout(minuterie);
        if (!CALME.matches && exps.length > 1) {
            minuterie = setTimeout(function () { afficher(affiche + 1); }, DUREE);
        }
    }

    // La couverture, la vraie, suit le curseur au survol d'une
    // expérimentation. Elle se tient au-dessus de lui, puisque l'affiche
    // est au bas de l'écran.
    var apercu = document.createElement('div');
    apercu.className = 'exp-apercu';
    apercu.setAttribute('aria-hidden', 'true');
    apercu.innerHTML = '<img alt="">';
    document.body.appendChild(apercu);
    var apercuImg = apercu.firstChild;
    var suivi = { x: 0, y: 0, cx: 0, cy: 0, actif: false, trame: 0 };

    function suivre() {
        suivi.trame = 0;
        suivi.cx += (suivi.x - suivi.cx) * 0.16;
        suivi.cy += (suivi.y - suivi.cy) * 0.16;
        var l = apercu.offsetWidth, h = apercu.offsetHeight;
        var x = Math.min(Math.max(suivi.cx - l / 2, 16), largeur - l - 16);
        var y = Math.max(suivi.cy - h - 26, 16);
        apercu.style.transform = 'translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, 0)';
        if (suivi.actif || Math.abs(suivi.x - suivi.cx) > 0.5) suivi.trame = requestAnimationFrame(suivre);
    }

    exps.forEach(function (el, i) {
        function prendre() { if (i !== affiche) afficher(i, centre(el)); }
        el.addEventListener('mouseenter', function (e) {
            prendre();
            if (!SEUIL.matches || CALME.matches) return;
            apercuImg.src = el.getAttribute('data-trame-image');
            if (!suivi.actif) { suivi.cx = e.clientX; suivi.cy = e.clientY; }
            suivi.x = e.clientX; suivi.y = e.clientY;
            suivi.actif = true;
            apercu.classList.add('est-visible');
            if (!suivi.trame) suivi.trame = requestAnimationFrame(suivre);
        });
        el.addEventListener('mousemove', function (e) { suivi.x = e.clientX; suivi.y = e.clientY; });
        el.addEventListener('mouseleave', function () {
            suivi.actif = false;
            apercu.classList.remove('est-visible');
        });
        el.addEventListener('focus', prendre);
    });

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

    outils.forEach(function (el) {
        function entrer() {
            survolOutil = true;
            var svg = svgDe(el);
            if (svg) montrer({ type: 'icone', svg: svg }, centre(el));
        }
        function sortir() {
            survolOutil = false;
            if (affiche >= 0) montrer({ type: 'texte', texte: numero(affiche) }, centre(el));
        }
        el.addEventListener('mouseenter', entrer);
        el.addEventListener('focus', entrer);
        el.addEventListener('mouseleave', sortir);
        el.addEventListener('blur', sortir);
    });

    // ------------------------------------------------------------------
    // Le curseur
    // ------------------------------------------------------------------

    window.addEventListener('pointermove', function (e) {
        if (CALME.matches || e.pointerType === 'touch') return;
        if (!souris.vue) { souris.cx = e.clientX; souris.cy = e.clientY; }
        souris.x = e.clientX;
        souris.y = e.clientY;
        souris.vue = true;
        reveiller();
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
        souris.vue = false;
        reveiller();
    });

    // ------------------------------------------------------------------
    // La mise en route
    // ------------------------------------------------------------------

    var redim;
    function reprendre() {
        if (!SEUIL.matches || !preparer()) {
            clearTimeout(minuterie);
            if (ctx) ctx.clearRect(0, 0, toile.width, toile.height);
            return;
        }
        lireTheme();
        mesurer();
        var garde = motif;
        motif = null;
        if (garde) montrer(garde);
        else afficher(affiche < 0 ? 0 : affiche, { x: largeur / 2, y: hauteur / 2 });
    }

    window.addEventListener('resize', function () {
        clearTimeout(redim);
        redim = setTimeout(reprendre, 120);
    });

    // Le texte change de longueur avec la langue et avec l'arrivée de la
    // fonte : les zones calmes se remesurent, sans relancer le motif.
    function remesurerZones() {
        if (!SEUIL.matches || !xs) return;
        zonesCalmes();
        reveiller();
    }
    document.addEventListener('gumi:lang', function () { setTimeout(redessiner, 1300); });
    // La fonte change la forme des chiffres : le motif se redessine quand
    // elle arrive.
    function redessiner() {
        if (!SEUIL.matches || !xs) return;
        zonesCalmes();
        var garde = motif;
        motif = null;
        if (garde) montrer(garde);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redessiner);
    window.addEventListener('load', remesurerZones);

    // Le thème change l'encre, et le sens du halftone avec elle.
    new MutationObserver(function () {
        if (!ctx) return;
        lireTheme();
        var garde = motif;
        motif = null;
        if (garde && SEUIL.matches) montrer(garde);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    reprendre();
})();
