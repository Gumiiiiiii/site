// Rail de navigation : il suit la lecture et signale la section courante.
(function () {
    var liens = Array.prototype.slice.call(document.querySelectorAll('.fond-rail a'));
    if (!liens.length) return;

    var cibles = liens.map(function (a) {
        return document.querySelector(a.getAttribute('href'));
    });

    var enAttente = false;

    function marquer() {
        enAttente = false;
        // La section courante est la dernière dont le titre est passé au-dessus du tiers haut de la fenêtre.
        var seuil = window.scrollY + window.innerHeight * 0.35;
        var actif = 0;

        cibles.forEach(function (el, i) {
            if (!el) return;
            var haut = el.getBoundingClientRect().top + window.scrollY;
            if (haut <= seuil) actif = i;
        });
        // Au bas de la page, la dernière section l'emporte : son titre ne remonte jamais jusqu'au seuil.
        if (document.documentElement.scrollHeight - (window.scrollY + window.innerHeight) <= 4) actif = cibles.length - 1;

        liens.forEach(function (a, i) {
            if (i === actif) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
            // Éloignement à la section courante : c'est la feuille de style qui en tire l'opacité.
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
