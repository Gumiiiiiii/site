// Le titre d'une page d'outil, posé sur sa rangée — et les apparitions.
//
// Reprise de /brand-guidelines, ramenée à ce dont une page d'outil a
// besoin : un seul titre, une seule rangée. La géométrie du champ est
// celle de scripts/points-champ.js, reprise ici au lieu d'être devinée,
// sinon les deux trames se décaleraient d'un demi-point.
(function () {
    var couche = document.querySelector('.regles');
    var titre = document.querySelector('.header-container h1');
    var cadre = document.querySelector('.main-wrapper');
    if (!couche || !titre || !cadre) return;

    var PAS_CHAMP = 18;   // la trame du champ
    var PAS_X = 80;       // ses colonnes
    var RAYON = 3;        // le point de la grille, a l'identique
    var ENCRE = 0.18;     // l'encre d'une rangee de titre
    var PLANCHER = 0.46;  // ce qui subsiste aux bords de l'ecran

    var minuterie;
    var margeInitiale = null;

    // La ligne de base reelle du titre, mesuree et non estimee : un span
    // vide de hauteur nulle se pose dessus, et c'est son bas qui la donne.
    function ligneDeBase(haut) {
        var jalon = document.createElement('span');
        jalon.textContent = '​';
        jalon.style.cssText = 'font-size:0;line-height:0;vertical-align:baseline';
        titre.appendChild(jalon);
        var y = jalon.getBoundingClientRect().bottom + window.pageYOffset - haut;
        titre.removeChild(jalon);
        return y;
    }

    // Poser le titre sur la trame.
    //
    // Une rangee dessinee pres du titre ne suffit pas : c'est le titre qui
    // doit tomber sur la rangee. On decale donc le contenu entier de la
    // page jusqu'a ce que la ligne de base du titre y arrive.
    //
    // Deux passes : la premiere change la hauteur de la page, donc le pas
    // du champ, donc la position des rangees.
    function caler() {
        if (margeInitiale === null) {
            margeInitiale = parseFloat(getComputedStyle(cadre).paddingTop) || 0;
        }
        cadre.style.paddingTop = margeInitiale + 'px';
        for (var passe = 0; passe < 2; passe++) {
            var hauteur = couche.offsetHeight;
            if (!hauteur) return;
            var pasGrille = 4 * (hauteur / Math.round(hauteur / PAS_CHAMP));
            var haut = couche.getBoundingClientRect().top + window.pageYOffset;
            var base = ligneDeBase(haut);
            // Vers le bas, jamais vers le haut : la rangee la plus proche
            // est parfois au-dessus, et le titre viendrait alors se coller
            // au bord de la page. Le calage ne fait qu'ajouter de l'air.
            var vise = Math.ceil(base / pasGrille) * pasGrille;
            var actuel = parseFloat(getComputedStyle(cadre).paddingTop) || 0;
            cadre.style.paddingTop = Math.max(0, actuel + (vise - base)) + 'px';
        }
    }

    function tracer() {
        caler();

        var largeur = couche.offsetWidth;
        var hauteur = couche.offsetHeight;
        if (!largeur || !hauteur) return;
        var centre = largeur / 2;
        var haut = couche.getBoundingClientRect().top + window.pageYOffset;

        // Tracee sur la ligne de base elle-meme, apres calage : le titre
        // est ainsi toujours ecrit sur sa rangee, au pixel pres, meme si
        // le calage n'a pas pu tomber juste.
        var y = ligneDeBase(haut);
        if (y < 0 || y > hauteur) { couche.innerHTML = ''; return; }

        var svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">';
        for (var i = 0; i * PAS_X <= centre + PAS_X; i++) {
            var ecart = i * PAS_X;
            var nx = Math.min(1, ecart / centre);
            // La rangee s'eteint vers les bords sans jamais descendre sous
            // le plancher.
            var encre = (ENCRE * (1 - (1 - PLANCHER) * nx * nx)).toFixed(3);
            if (ecart === 0) {
                svg += '<circle cx="' + centre.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + RAYON + '" fill="currentColor" opacity="' + encre + '"/>';
            } else {
                svg += '<circle cx="' + (centre - ecart).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + RAYON + '" fill="currentColor" opacity="' + encre + '"/>' +
                       '<circle cx="' + (centre + ecart).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + RAYON + '" fill="currentColor" opacity="' + encre + '"/>';
            }
        }
        couche.innerHTML = svg + '</svg>';
    }

    // Les fontes changent la hauteur du titre en arrivant : on retrace une
    // fois qu'elles sont posees.
    tracer();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tracer);
    window.addEventListener('load', tracer);
    window.addEventListener('resize', function () {
        clearTimeout(minuterie);
        minuterie = setTimeout(tracer, 100);
    });

    // ------------------------------------------------------------------
    // Les apparitions
    // ------------------------------------------------------------------
    if (!document.documentElement.classList.contains('fond-anime')) return;

    var PAS = 70;      // ms entre deux voisins qui entrent ensemble
    var RANG_MAX = 6;  // au-dela, le dernier attendrait trop

    function reveler(element, retard) {
        if (!element) return;
        element.style.setProperty('--anim-retard', (retard || 0) + 'ms');
        element.setAttribute('data-anim', 'vu');
    }

    reveler(document.querySelector('.points-champ'), 0);
    reveler(couche, 120);

    // Liste identique a celle de styles/outil-papier.css : ce qui est cache
    // la-bas doit etre decouvert ici, faute de quoi il ne revient jamais.
    var attente = Array.prototype.slice.call(document.querySelectorAll(
        '.back-link, .header-container, .control-row, .right-col,'
        + '.advanced-section, .left-col button.primary,'
        + '.pal-actions, .left-col .drop-zone'
    ));

    var observateur = new IntersectionObserver(function (entrees) {
        // Ceux qui entrent dans le meme souffle se suivent de haut en bas ;
        // celui qui entre seul n'attend personne.
        entrees.filter(function (e) { return e.isIntersecting; })
            .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; })
            .forEach(function (entree, i) {
                observateur.unobserve(entree.target);
                var k = attente.indexOf(entree.target);
                if (k !== -1) attente.splice(k, 1);
                reveler(entree.target, Math.min(i, RANG_MAX) * PAS);
            });
    }, { threshold: 0.06, rootMargin: '0px 0px -6% 0px' });

    attente.forEach(function (cible) { observateur.observe(cible); });

    // Le filet. Un IntersectionObserver ne rend son verdict qu'en fin de
    // trame : sur un saut de defilement, un element peut traverser l'ecran
    // entre deux trames sans jamais y etre vu, et rester transparent pour
    // de bon. On balaie donc ce qui attend encore, et tout ce qui est deja
    // passe sous le bas de l'ecran entre sans retard.
    var planifie = false;

    function balayer() {
        planifie = false;
        var bas = window.innerHeight;
        attente.slice().forEach(function (element) {
            if (element.getBoundingClientRect().top < bas) {
                observateur.unobserve(element);
                var k = attente.indexOf(element);
                if (k !== -1) attente.splice(k, 1);
                reveler(element, 0);
            }
        });
    }

    window.addEventListener('scroll', function () {
        if (planifie) return;
        planifie = true;
        requestAnimationFrame(balayer);
    }, { passive: true });
})();
