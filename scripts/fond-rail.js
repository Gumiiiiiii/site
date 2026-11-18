// Rail de navigation : il suit la lecture et signale la section courante.
(function () {
    // La signature suit le même fil : elle n'apparaît qu'une fois le bas de la page atteint.
    var signature = document.querySelector('.fond-signature');

    function marquerSignature() {
        if (!signature) return;
        var restant = document.documentElement.scrollHeight
            - (window.scrollY + window.innerHeight);
        signature.classList.toggle('visible', restant <= 160);
    }

    var liens = Array.prototype.slice.call(document.querySelectorAll('.fond-rail a'));
    if (!liens.length) {
        marquerSignature();
        window.addEventListener('scroll', marquerSignature, { passive: true });
        window.addEventListener('resize', marquerSignature);
        return;
    }

    var cibles = liens.map(function (a) {
        return document.querySelector(a.getAttribute('href'));
    });

    var enAttente = false;

    function marquer() {
        enAttente = false;
        marquerSignature();
        // La section courante est la dernière dont le titre est passé au-dessus du tiers haut de la fenêtre.
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
            // Éloignement à la section courante : c'est la feuille de style qui en tire l'opacité.
            a.style.setProperty('--eloignement', Math.abs(i - actif));
        });
    }

    function planifier() {
        if (enAttente) return;
        enAttente = true;
        window.requestAnimationFrame(marquer);
    }

    // Les ancres passent par Lenis quand il est là.
    liens.forEach(function (a, i) {
        a.addEventListener('click', function (e) {
            var cible = cibles[i];
            if (!cible || !window.gumiLenis) return;
            e.preventDefault();
            window.gumiLenis.scrollTo(cible, { offset: -window.innerHeight * 0.35 });
            history.replaceState(null, '', a.getAttribute('href'));
        });
    });

    marquer();
    window.addEventListener('scroll', planifier, { passive: true });
    window.addEventListener('resize', planifier);
})();
