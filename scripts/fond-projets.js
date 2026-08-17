// Les lignes de projets : un nom, une phrase, une flèche. Au clic, la flèche
// bascule d'un quart de tour vers le bas et la ligne s'ouvre sur son contenu.
//
// L'ouverture est une transition de grid-template-rows (0fr → 1fr) : c'est ce
// qui permet d'animer vers une hauteur qu'on ne connaît pas d'avance. Le
// repositionnement des titres suivants n'est donc pas déclenché d'ici — c'est
// le ResizeObserver de fond-titre.js qui suit la hauteur pendant l'animation.
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
                // Replié, le contenu sort de l'ordre de tabulation et de
                // l'arbre d'accessibilité : sa hauteur est nulle, mais il
                // reste dans le flux, donc [inert] n'est pas facultatif.
                corps.setAttribute('inert', '');
            } else {
                ligne.setAttribute('data-ouvert', '');
                tete.setAttribute('aria-expanded', 'true');
                corps.removeAttribute('inert');
            }
        });
    });
})();
