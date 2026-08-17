// Rail de navigation : il suit la lecture et signale la section courante.
//
// L'état actif n'est pas porté par la seule couleur : aria-current le dit
// aussi aux lecteurs d'écran. Et le libellé reste dans le DOM même quand le
// rail se réduit à des points sur mobile — le point n'est jamais un lien
// sans nom.
(function () {
    var liens = Array.prototype.slice.call(document.querySelectorAll('.fond-rail a'));
    if (!liens.length) return;

    var cibles = liens.map(function (a) {
        return document.querySelector(a.getAttribute('href'));
    });

    var enAttente = false;

    function marquer() {
        enAttente = false;
        // La section courante est la dernière dont le titre est passé au-dessus
        // du tiers haut de la fenêtre : on change d'entrée quand le titre
        // suivant arrive à hauteur de lecture, pas quand il touche le bas.
        var seuil = window.scrollY + window.innerHeight * 0.35;
        var actif = 0;

        cibles.forEach(function (el, i) {
            if (!el) return;
            var haut = el.getBoundingClientRect().top + window.scrollY;
            if (haut <= seuil) actif = i;
        });

        liens.forEach(function (a, i) {
            if (i === actif) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
            // Éloignement à la section courante : c'est la feuille de style
            // qui en tire l'opacité, pour que le survol et l'état courant
            // puissent encore la reprendre.
            a.style.setProperty('--eloignement', Math.abs(i - actif));
        });
    }

    function planifier() {
        if (enAttente) return;
        enAttente = true;
        window.requestAnimationFrame(marquer);
    }

    marquer();
    window.addEventListener('scroll', planifier, { passive: true });
    window.addEventListener('resize', planifier);
})();
