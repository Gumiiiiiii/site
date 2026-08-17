// Le titre est écrit sur une rangée de points, comme sur du papier pointé :
// sa ligne de base tombe exactement sur une rangée, et cette rangée-là est
// plus foncée que les autres.
//
// Tout se calcule ici parce que la rangée choisie dépend de la hauteur de
// la fenêtre, et que le dégradé de la rangée dépend de la largeur réelle
// du titre une fois composé.
(function () {
    var PAS_Y = 72;   // pas vertical du semis (voir fond.html)

    var titre = document.querySelector('.fond-titre');
    var ligne = document.querySelector('.fond-ligne');
    if (!titre || !ligne) return;

    var minuteur;

    function placer() {
        // « Un écran plus bas », arrondi à la rangée de points la plus
        // proche : le titre doit tomber sur la trame, pas à côté.
        var cible = Math.round(window.innerHeight / PAS_Y) * PAS_Y;
        ligne.style.top = cible + 'px';

        // On mesure où tombe la ligne de base plutôt que de la déduire de
        // la police : un repère vide aligné sur la ligne de base donne
        // l'écart exact, quelles que soient la taille et la fonte.
        var repere = document.createElement('span');
        repere.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        titre.appendChild(repere);
        var ecart = repere.getBoundingClientRect().top - titre.getBoundingClientRect().top;
        titre.removeChild(repere);

        titre.style.top = (cible - ecart) + 'px';

        // La rangée est pleine derrière le titre et s'éteint vers les deux
        // bords de la page — où il ne reste que le semis, à son opacité
        // normale.
        var r = titre.getBoundingClientRect();
        var masque = 'linear-gradient(to right, transparent 0,' +
            ' #000 ' + Math.round(r.left) + 'px,' +
            ' #000 ' + Math.round(r.right) + 'px,' +
            ' transparent 100%)';
        ligne.style.webkitMaskImage = masque;
        ligne.style.maskImage = masque;
    }

    // Les polices changent les métriques une fois chargées : on replace le
    // titre à ce moment-là, sinon sa ligne de base rate la rangée.
    placer();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placer);

    window.addEventListener('resize', function () {
        clearTimeout(minuteur);
        minuteur = setTimeout(placer, 120);
    });
})();
