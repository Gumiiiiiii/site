// Les titres sont écrits sur les rangées de points, comme sur du papier
// pointé : la ligne de base de chacun tombe exactement sur une rangée, et
// cette rangée-là est plus foncée que les autres.
//
// Le placement se calcule ici parce que les rangées visées dépendent de la
// hauteur de la fenêtre, et que le trou dans chaque rangée dépend de la
// largeur réelle du titre une fois composé.
(function () {
    var PAS_Y = 72;           // pas vertical du semis (voir fond.html)
    var ECART_RANGEES = 4;    // rangées entre deux titres
    var MARGE = 20;           // respiration de part et d'autre du titre

    var titres = Array.prototype.slice.call(document.querySelectorAll('.fond-titre'));
    var lignes = Array.prototype.slice.call(document.querySelectorAll('.fond-ligne'));
    var contenu = document.querySelector('.site-content');
    if (!titres.length || !contenu) return;

    var minuteur;

    // Écart entre le haut du titre et sa ligne de base. On le mesure avec un
    // repère vide aligné sur celle-ci, plutôt que de le déduire des
    // métriques de la police.
    function ecartLigneDeBase(titre) {
        var repere = document.createElement('span');
        repere.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        titre.appendChild(repere);
        var ecart = repere.getBoundingClientRect().top - titre.getBoundingClientRect().top;
        titre.removeChild(repere);
        return ecart;
    }

    function placer() {
        // Le premier titre tombe un écran plus bas, arrondi à la rangée la
        // plus proche : il doit tomber sur la trame, pas à côté.
        var premiere = Math.round(window.innerHeight / PAS_Y) * PAS_Y;
        var derniere = premiere;

        titres.forEach(function (titre, i) {
            var cible = premiere + i * ECART_RANGEES * PAS_Y;
            derniere = cible;

            titre.style.top = (cible - ecartLigneDeBase(titre)) + 'px';

            var ligne = lignes[i];
            if (!ligne) return;
            ligne.style.top = cible + 'px';

            // La rangée s'interrompt sur toute la largeur du titre : les
            // points sont centrés sur la ligne de base, donc ceux que le
            // texte recouvre seraient coupés en deux par les lettres.
            var r = titre.getBoundingClientRect();
            var debut = Math.round(r.left) - MARGE;
            var fin = Math.round(r.right) + MARGE;
            var masque = 'linear-gradient(to right,' +
                ' #000 0, #000 ' + debut + 'px,' +
                ' transparent ' + debut + 'px, transparent ' + fin + 'px,' +
                ' #000 ' + fin + 'px, #000 100%)';
            ligne.style.webkitMaskImage = masque;
            ligne.style.maskImage = masque;
        });

        // La page se dimensionne sur son contenu : de quoi loger le dernier
        // titre, plus un écran pour le dégradé du bas. Changer la hauteur
        // oblige à redessiner le semis, qui la suit (data-height="auto").
        var voulue = derniere + window.innerHeight;
        // parseInt('') vaut NaN, et toute comparaison avec NaN est fausse :
        // sans le repli à 0, la hauteur n'était jamais posée au premier tour.
        var actuelle = parseInt(contenu.style.minHeight || '0', 10);
        if (Math.abs(actuelle - voulue) > 1) {
            contenu.style.minHeight = voulue + 'px';
            window.dispatchEvent(new Event('resize'));
        }
    }

    // Les polices changent les métriques une fois chargées : on replace les
    // titres à ce moment-là, sinon leur ligne de base rate la rangée.
    placer();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placer);

    window.addEventListener('resize', function () {
        clearTimeout(minuteur);
        minuteur = setTimeout(placer, 120);
    });
})();
