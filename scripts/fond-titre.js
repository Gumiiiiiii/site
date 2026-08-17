// Le titre est écrit sur une rangée de points, comme sur du papier pointé :
// sa ligne de base tombe exactement sur une rangée, et cette rangée-là est
// plus foncée que les autres.
//
// Le placement se calcule ici parce que la rangée choisie dépend de la
// hauteur de la fenêtre.
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

        // La rangée s'interrompt sur toute la largeur du titre. Les points
        // sont centrés sur la ligne de base : ceux que le texte recouvre
        // seraient coupés en deux par les lettres, et une moitié de point
        // qui dépasse d'un jambage se lit comme une scorie. La ligne est
        // donc percée d'un trou, avec une marge de respiration.
        var MARGE = 20;
        var r = titre.getBoundingClientRect();
        var debut = Math.round(r.left) - MARGE;
        var fin = Math.round(r.right) + MARGE;
        var masque = 'linear-gradient(to right,' +
            ' #000 0, #000 ' + debut + 'px,' +
            ' transparent ' + debut + 'px, transparent ' + fin + 'px,' +
            ' #000 ' + fin + 'px, #000 100%)';
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
