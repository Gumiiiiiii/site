// Fond pointillé : dégradé en haut, dégradé en bas, semis entre les deux.
//
// L'espacement ET le rayon varient le long de la page, ce qu'un background
// CSS répété ne peut pas faire (une répétition a une période constante).
// Les points sont donc posés un par un, en SVG.
//
// Tous les réglages sont ici. Grille carrée, pas de quinconce.
(function () {
    var REGLAGES = {
        bande: 1.0,        // hauteur de chaque dégradé, en écrans (100vh)
        pasBord: 24,       // espacement des points au bord, en px
        pasCentre: 72,     // espacement des points au milieu, en px
        rayonBord: 5.0,    // rayon d'un point au bord
        rayonCentre: 1.6,  // rayon d'un point au milieu
        opacite: 0.14
    };

    var conteneurs = document.querySelectorAll('.fond-dots');
    var minuteur;

    // 0 au bord de la page, 1 une fois le dégradé terminé. Entre les deux,
    // une courbe douce : une interpolation linéaire donnerait une cassure
    // nette à la fin de la bande.
    function avancement(y, hauteur, bande) {
        var depuisBord = Math.min(y, hauteur - y);
        var t = Math.min(depuisBord / bande, 1);
        return t * t * (3 - 2 * t);
    }

    function melange(a, b, t) { return a + (b - a) * t; }

    function dessiner() {
        if (!conteneurs.length) return;
        var largeur = window.innerWidth;

        conteneurs.forEach(function (conteneur) {
            var hauteur = conteneur.offsetHeight;
            var bande = window.innerHeight * REGLAGES.bande;
            var parts = [];

            // Le pas vertical suit la même courbe que le pas horizontal :
            // on avance donc rangée par rangée, sans grille fixe.
            for (var y = 0; y <= hauteur; ) {
                var t = avancement(y, hauteur, bande);
                var pas = melange(REGLAGES.pasBord, REGLAGES.pasCentre, t);
                var rayon = melange(REGLAGES.rayonBord, REGLAGES.rayonCentre, t);

                for (var x = pas / 2; x <= largeur; x += pas) {
                    parts.push('<circle cx="' + x.toFixed(1) +
                        '" cy="' + y.toFixed(1) +
                        '" r="' + rayon.toFixed(2) + '"/>');
                }
                y += pas;
            }

            conteneur.innerHTML =
                '<svg width="100%" height="100%" viewBox="0 0 ' + largeur + ' ' + hauteur +
                '" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
                '<g fill="currentColor" opacity="' + REGLAGES.opacite + '">' +
                parts.join('') +
                '</g></svg>';
        });
    }

    dessiner();
    window.addEventListener('resize', function () {
        clearTimeout(minuteur);
        minuteur = setTimeout(dessiner, 120);
    });
})();
