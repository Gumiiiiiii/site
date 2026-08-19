// Les titres sont écrits sur les rangées de points, comme sur du papier
// pointé : la ligne de base de chacun tombe exactement sur une rangée, et
// cette rangée-là est plus foncée que les autres.
//
// Le placement se calcule ici parce que les rangées visées dépendent de la
// hauteur de la fenêtre, de la largeur réelle du titre une fois composé, et
// maintenant de la hauteur du contenu placé sous chaque titre — un contenu
// qui change de taille quand on déplie un projet.
(function () {
    // La trame du champ de points (scripts/points-champ.js) : 20x18, dont la
    // grille du milieu ne garde qu'une colonne et une rangée sur quatre.
    var PAS_CHAMP = 18;
    var PAS_Y = 4 * PAS_CHAMP;   // 72 : le pas de la grille du milieu
    var PAS_X = 80;              // 4 x 20, ses colonnes
    var RAYON = 3;               // le point de la grille, a l'identique
    var ENCRE_LIGNE = 0.18;      // l'encre de la rangee d'un titre
    var ECART_RANGEES = 5;    // rangées minimales entre deux titres
    var MARGE = 20;           // respiration de part et d'autre du titre
    // Part de la rangée qui subsiste aux bords de l'écran. La rangée est
    // maintenant tracée à 0,18 d'opacité ; 0,46 de 0,18 fait 0,083, la valeur
    // uniforme qu'elle avait avant qu'on la fasse varier.
    var PLANCHER = 0.46;
    var AIR_SECTION = 48;     // entre la rangée du titre et son contenu
    var AIR_APRES = 192;      // entre la fin d'un contenu et le titre suivant
    // Sous le pied de page. Il en faut au moins 180 : c'est la hauteur du
    // dégradé de points qui ferme la page (.dots-bg-bottom), et ses points
    // sont bien plus gros que le semis du bloc — s'ils passaient dessous, les
    // deux trames se mélangeraient.
    var MARGE_BAS = 220;

    var titres = Array.prototype.slice.call(document.querySelectorAll('.fond-titre'));
    var lignes = Array.prototype.slice.call(document.querySelectorAll('.fond-ligne'));
    // La section qui ferme la page : sa présence remplace l'écran de rab par
    // une simple marge basse.
    var pied = document.querySelector('.fond-contact');
    var contenu = document.querySelector('.site-content');
    if (!titres.length || !contenu) return;

    // Le contenu d'un titre, s'il en a un : le .fond-section qui le suit.
    var sections = titres.map(function (titre) {
        var suivant = titre.nextElementSibling;
        return (suivant && suivant.classList.contains('fond-section')) ? suivant : null;
    });

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

    // La rangée de points la plus proche, en descendant.
    function rangeeSous(y) {
        return Math.ceil(y / PAS_Y) * PAS_Y;
    }

    // La rangée assombrie est une rangée du champ redessinée par-dessus, à
    // une encre plus forte. Elle doit donc en reprendre la géométrie au point
    // près : les colonnes s'y comptent depuis l'axe de la page, et non depuis
    // le bord gauche — c'est ainsi que le champ garantit sa symétrie quelle
    // que soit la largeur de la fenêtre.
    function dessinerLigne(ligne) {
        var largeur = ligne.offsetWidth;
        if (!largeur) return;
        var centre = largeur / 2;

        // cy = 8 : la boîte fait 16 px de haut et fond-titre la pose 8 px
        // au-dessus de la rangée visée.
        var svg = '<svg width="100%" height="16" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="currentColor" opacity="' + ENCRE_LIGNE + '">';

        for (var i = 0; i * PAS_X <= centre + PAS_X; i++) {
            var ecart = i * PAS_X;
            if (ecart === 0) {
                svg += '<circle cx="' + centre + '" cy="8" r="' + RAYON + '"/>';
            } else {
                svg += '<circle cx="' + (centre - ecart).toFixed(1) + '" cy="8" r="' + RAYON + '"/>' +
                       '<circle cx="' + (centre + ecart).toFixed(1) + '" cy="8" r="' + RAYON + '"/>';
            }
        }

        ligne.innerHTML = svg + '</g></svg>';
    }

    function placer() {
        // Le premier titre passe sous le hero, qui occupe tout le viewport :
        // on prend la première rangée située après lui, et non la plus
        // proche — sinon le titre remonte dans l'écran, sous les chiffres.
        var cible = rangeeSous(window.innerHeight + 120);
        var bas = cible;

        titres.forEach(function (titre, i) {
            titre.style.top = (cible - ecartLigneDeBase(titre)) + 'px';
            bas = cible;

            var ligne = lignes[i];
            if (ligne) {
                dessinerLigne(ligne);
                // La boîte fait 16 px de haut et son tracé y est centré : on la
                // pose donc 8 px au-dessus de la rangée.
                ligne.style.top = (cible - 8) + 'px';

                // La rangée s'interrompt sur toute la largeur du titre : les
                // points sont centrés sur la ligne de base, donc ceux que le
                // texte recouvre seraient coupés en deux par les lettres.
                //
                // Et elle s'éclaircit en s'éloignant du titre. La rangée est
                // dessinée à pleine force (voir data-opacity dans fond.html) ;
                // c'est ce masque qui la ramène, aux deux extrémités de
                // l'écran, à PLANCHER de cette force — soit exactement la
                // teinte qu'avait la rangée uniforme d'avant.
                var r = titre.getBoundingClientRect();
                var debut = Math.round(r.left) - MARGE;
                var fin = Math.round(r.right) + MARGE;
                // L'assombrissement ne déborde pas de la colonne de texte :
                // au-delà des marges, la rangée reprend la teinte du semis.
                // La marge est mesurée sur le titre lui-même (posé à
                // left: var(--fond-marge)) et vaut autant à droite.
                var marge = Math.round(r.left);
                var margeD = Math.round(ligne.offsetWidth - marge);
                // Le trou est bride par les marges : sans cela ses bornes
                // passent devant celles de la colonne, les arrets du degrade
                // sortent dans le desordre, et CSS ecrase les uns sur les
                // autres tous ceux qui reculent.
                debut = Math.max(marge, debut);
                fin = Math.min(margeD, fin);
                var masque = 'linear-gradient(to right,' +
                    ' transparent 0, transparent ' + marge + 'px,' +
                    ' rgba(0,0,0,' + PLANCHER + ') ' + marge + 'px, #000 ' + debut + 'px,' +
                    ' transparent ' + debut + 'px, transparent ' + fin + 'px,' +
                    ' #000 ' + fin + 'px, rgba(0,0,0,' + PLANCHER + ') ' + margeD + 'px,' +
                    ' transparent ' + margeD + 'px, transparent 100%)';
                ligne.style.webkitMaskImage = masque;
                ligne.style.maskImage = masque;
            }

            // Le contenu se pose sous la rangée du titre, et c'est lui qui
            // décide alors où tombe le titre suivant.
            var section = sections[i];
            if (section) {
                section.style.top = (cible + AIR_SECTION) + 'px';
                bas = cible + AIR_SECTION + section.offsetHeight;
            }

            // Titre suivant : jamais moins de ECART_RANGEES rangées plus bas,
            // et toujours après la fin du contenu qu'on vient de poser.
            cible = Math.max(
                cible + ECART_RANGEES * PAS_Y,
                rangeeSous(bas + AIR_APRES)
            );
        });

        // Le bloc de contact ferme la colonne : il est la section du dernier
        // titre, donc déjà posé. Il ne reste qu'à lui laisser sa marge basse.
        // Sans lui, un écran de rab pour le dégradé du bas.
        var voulue = bas + (pied ? MARGE_BAS : window.innerHeight);

        // Le champ divise la hauteur de la page par le nombre entier de
        // rangées le plus proche : son pas ne vaut donc exactement 18 px que
        // si cette hauteur en est un multiple. On la monte au multiple de 72
        // suivant — 72 et non 18, pour que la dernière rangée du bas soit
        // elle aussi une rangée de la grille. Sans cela, le pas dérive d'un
        // demi pour cent, et sur trois mille pixels les titres finissent à
        // côté des points au lieu d'être dessus.
        voulue = Math.ceil(voulue / PAS_Y) * PAS_Y;

        // La page se dimensionne sur son contenu. Changer la hauteur oblige à
        // redessiner le semis, qui la suit (data-height="auto").
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

    // Une section qui grandit (un projet qu'on déplie, une image qui arrive)
    // repousse tout ce qui la suit : on suit sa hauteur au lieu d'attendre la
    // fin d'une animation dont on ne connaît pas la durée ici.
    if (window.ResizeObserver) {
        var observateur = new ResizeObserver(placer);
        sections.forEach(function (section) {
            if (section) observateur.observe(section);
        });
    }

    // Changer de langue change la largeur des titres, donc le trou perce
    // dans chaque rangee de points. On replace apres coup.
    document.addEventListener('gumi:lang', function () { placer(); });

    // Le reste de la page peut avoir besoin de forcer un replacement.
    window.fondPlacer = placer;
})();
