// Carrousel d'avis, défilement sans fin.
//
// Le procédé : on duplique le jeu de cartes une fois avant et une fois après
// l'original, et on démarre sur le jeu du milieu. Quand le défilement sort de
// ce jeu, on y revient d'un bond sans transition — l'image est identique, le
// saut est donc invisible, et il n'y a jamais de retour en arrière visible
// comme avec un carrousel qui rembobine.
(function () {
    var cadre = document.querySelector('.fond-avis-cadre');
    var piste = document.querySelector('.fond-avis-piste');
    if (!cadre || !piste) return;

    var cartes = Array.prototype.slice.call(piste.children);
    var n = cartes.length;
    if (n < 2) return;

    // Les copies ne doivent exister que pour l'œil : elles sortent de l'arbre
    // d'accessibilité et de l'ordre de tabulation, sinon les liens LinkedIn
    // seraient annoncés trois fois chacun.
    function copier(carte) {
        var copie = carte.cloneNode(true);
        copie.setAttribute('aria-hidden', 'true');
        copie.setAttribute('inert', '');
        return copie;
    }

    cartes.map(copier).forEach(function (copie) { piste.appendChild(copie); });
    cartes.map(copier).reverse().forEach(function (copie) { piste.insertBefore(copie, piste.firstChild); });

    var index = n;  // première carte du jeu original
    var anime = true;

    function pas() {
        var style = getComputedStyle(piste);
        var ecart = parseFloat(style.columnGap || style.gap) || 0;
        return piste.children[0].getBoundingClientRect().width + ecart;
    }

    function poser(avecTransition) {
        piste.style.transition = avecTransition && anime ? '' : 'none';
        piste.style.transform = 'translateX(' + (-index * pas()) + 'px)';
        if (!(avecTransition && anime)) {
            // Forcer le recalcul avant de rendre la transition : sinon le
            // navigateur regroupe les deux changements et anime le bond.
            void piste.offsetWidth;
            piste.style.transition = '';
        }
    }

    function aller(sens) {
        index += sens;
        poser(true);
        if (!anime) recadrer();
    }

    // Revenir dans le jeu du milieu une fois l'animation terminée.
    function recadrer() {
        if (index >= 2 * n) { index -= n; poser(false); }
        else if (index < n) { index += n; poser(false); }
    }

    piste.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'transform') recadrer();
    });

    var prec = document.querySelector('[data-avis-prec]');
    var suiv = document.querySelector('[data-avis-suiv]');
    if (prec) prec.addEventListener('click', function () { aller(-1); });
    if (suiv) suiv.addEventListener('click', function () { aller(1); });

    // Les flèches du clavier, quand le cadre a le focus.
    cadre.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); aller(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); aller(1); }
    });

    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
    function suivreReglage() {
        anime = !reduit.matches;
        piste.classList.toggle('sans-animation', !anime);
    }
    suivreReglage();
    if (reduit.addEventListener) reduit.addEventListener('change', suivreReglage);

    // La largeur d'une carte suit celle du cadre : au redimensionnement, le
    // décalage en pixels n'est plus le bon.
    var minuteur;
    window.addEventListener('resize', function () {
        clearTimeout(minuteur);
        minuteur = setTimeout(function () { poser(false); }, 120);
    });

    poser(false);
})();
