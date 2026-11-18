// Les titres sont écrits sur les rangées de points, comme sur du papier pointé.
(function () {
    // La trame du champ de points (scripts/points-champ.js) : 20x18.
    var PAS_CHAMP = 18;
    var PAS_Y = 4 * PAS_CHAMP;   // 72 : le pas de la grille du milieu
    var PAS_X = 80;              // 4 x 20, ses colonnes
    var RAYON = 3;               // le point de la grille, a l'identique
    var ENCRE_LIGNE = 0.18;      // l'encre de la rangee d'un titre
    var ECART_RANGEES = 5;    // rangées minimales entre deux titres
    var MARGE = 20;           // respiration de part et d'autre du titre
    // Part de la rangée qui subsiste aux bords de l'écran.
    var PLANCHER = 0.46;
    var AIR_SECTION = 48;     // entre la rangée du titre et son contenu
    var AIR_APRES = 192;      // entre la fin d'un contenu et le titre suivant
    // Sous le pied de page.
    var MARGE_BAS = 220;

    var titres = Array.prototype.slice.call(document.querySelectorAll('.fond-titre'));
    var lignes = Array.prototype.slice.call(document.querySelectorAll('.fond-ligne'));
    // La section qui ferme la page : sa présence remplace l'écran de rab par une simple marge basse.
    var pied = document.querySelector('.fond-contact');
    var contenu = document.querySelector('.site-content');
    if (!titres.length || !contenu) return;

    // Le contenu d'un titre, s'il en a un : le .fond-section qui le suit.
    var sections = titres.map(function (titre) {
        var suivant = titre.nextElementSibling;
        return (suivant && suivant.classList.contains('fond-section')) ? suivant : null;
    });

    var minuteur;
    // Ce sur quoi le dernier placement s est appuye.
    var largeurPosee = 0;
    var hauteurPosee = 0;

    // Le hero occupe exactement un ecran (height: 100vh).
    var hero = document.querySelector('.fond-hero');
    function hauteurEcran() {
        return hero ? Math.round(hero.getBoundingClientRect().height) : window.innerHeight;
    }

    // Écart entre le haut du titre et sa ligne de base.
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

    // La rangée assombrie est une rangée du champ redessinée par-dessus, à une encre plus forte.
    function dessinerLigne(ligne) {
        var largeur = ligne.offsetWidth;
        if (!largeur) return;
        var centre = largeur / 2;

        // cy = 8 : la boîte fait 16 px de haut et fond-titre la pose 8 px au-dessus de la rangée visée.
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
        // Le premier titre passe sous le hero, qui occupe tout le viewport.
        largeurPosee = window.innerWidth;
        hauteurPosee = hauteurEcran();
        var cible = rangeeSous(hauteurPosee + 120);
        var bas = cible;

        titres.forEach(function (titre, i) {
            titre.style.top = (cible - ecartLigneDeBase(titre)) + 'px';
            bas = cible;

            var ligne = lignes[i];
            if (ligne) {
                dessinerLigne(ligne);
                // La boîte fait 16 px de haut et son tracé y est centré : on la pose donc 8 px au-dessus de la rangée.
                ligne.style.top = (cible - 8) + 'px';

                // La rangée s'interrompt sur toute la largeur du titre : les points sont centrés sur la ligne de base.
                var r = titre.getBoundingClientRect();
                var debut = Math.round(r.left) - MARGE;
                var fin = Math.round(r.right) + MARGE;
                // L'assombrissement ne déborde pas de la colonne de texte : au-delà des marges.
                var marge = Math.round(r.left);
                var margeD = Math.round(ligne.offsetWidth - marge);
                // Le trou est bride par les marges : sans cela ses bornes passent devant celles de la colonne.
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

            // Le contenu se pose sous la rangée du titre, et c'est lui qui décide alors où tombe le titre suivant.
            var section = sections[i];
            if (section) {
                section.style.top = (cible + AIR_SECTION) + 'px';
                bas = cible + AIR_SECTION + section.offsetHeight;
            }

            // Titre suivant : jamais moins de ECART_RANGEES rangées plus bas.
            cible = Math.max(
                cible + ECART_RANGEES * PAS_Y,
                rangeeSous(bas + AIR_APRES)
            );
        });

        // Le bloc de contact ferme la colonne : il est la section du dernier titre, donc déjà posé.
        var voulue = bas + (pied ? MARGE_BAS : window.innerHeight);

        // Le champ divise la hauteur de la page par le nombre entier de rangées le plus proche.
        voulue = Math.ceil(voulue / PAS_Y) * PAS_Y;

        // La page se dimensionne sur son contenu.
        var actuelle = parseInt(contenu.style.minHeight || '0', 10);
        if (Math.abs(actuelle - voulue) > 1) {
            contenu.style.minHeight = voulue + 'px';
            window.dispatchEvent(new Event('resize'));
        }
    }

    // Arrive apres le filet de secours (voir cv.html) : la page etait dans le flux normal en l'attendant.
    document.documentElement.classList.remove('fond-secours-flux');

    // Les polices changent les métriques une fois chargées : on replace les titres à ce moment-là.
    placer();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placer);

    window.addEventListener('resize', function () {
        clearTimeout(minuteur);
        minuteur = setTimeout(function () {
            // Le repli de la barre d adresse declenche un resize sans rien changer : on l ignore.
            if (window.innerWidth === largeurPosee && hauteurEcran() === hauteurPosee) return;
            placer();
        }, 120);
    });

    // Une section qui grandit (un projet qu'on déplie, une image qui arrive) repousse tout ce qui la suit.
    if (window.ResizeObserver) {
        var observateur = new ResizeObserver(placer);
        sections.forEach(function (section) {
            if (section) observateur.observe(section);
        });
    }

    // Changer de langue change la largeur des titres, donc le trou perce dans chaque rangee de points.
    document.addEventListener('gumi:lang', function () { placer(); });

    // Le reste de la page peut avoir besoin de forcer un replacement.
    window.fondPlacer = placer;
})();
