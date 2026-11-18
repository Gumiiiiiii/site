// Les lignes de projets : un nom, une phrase, une flèche.
(function () {
    var lignes = Array.prototype.slice.call(document.querySelectorAll('.fond-projet'));
    if (!lignes.length) return;

    lignes.forEach(function (ligne) {
        var tete = ligne.querySelector('.fond-projet-tete');
        var corps = ligne.querySelector('.fond-projet-corps');
        if (!tete || !corps) return;

        tete.addEventListener('click', function () {
            var ouvert = ligne.hasAttribute('data-ouvert');

            if (ouvert) {
                ligne.removeAttribute('data-ouvert');
                tete.setAttribute('aria-expanded', 'false');
                // Replié, le contenu sort de l'ordre de tabulation et de l'arbre d'accessibilité.
                corps.setAttribute('inert', '');
            } else {
                ligne.setAttribute('data-ouvert', '');
                tete.setAttribute('aria-expanded', 'true');
                corps.removeAttribute('inert');
            }
        });
    });
})();
