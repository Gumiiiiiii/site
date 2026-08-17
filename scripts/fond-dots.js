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
        pasBordX: 20,      // espacement horizontal au bord (celui de .dots-bg)
        pasBordY: 18,      // espacement vertical au bord (celui de .dots-bg)
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
            //
            // Le quinconce du bord (une rangée sur deux décalée d'un demi-pas,
            // comme .dots-bg) s'efface en même temps que les points s'espacent :
            // au milieu le décalage vaut zéro, la grille redevient carrée.
            // Sans ça, la bande et le semis se rejoindraient sur une couture.
            var rangee = 0;
            for (var y = 0; y <= hauteur; rangee++) {
                var t = avancement(y, hauteur, bande);
                var pasX = melange(REGLAGES.pasBordX, REGLAGES.pasCentre, t);
                var pasY = melange(REGLAGES.pasBordY, REGLAGES.pasCentre, t);
                var rayon = melange(REGLAGES.rayonBord, REGLAGES.rayonCentre, t);
                var decalage = (rangee % 2) ? (pasX / 2) * (1 - t) : 0;

                for (var x = decalage + pasX / 2; x <= largeur; x += pasX) {
                    parts.push('<circle cx="' + x.toFixed(1) +
                        '" cy="' + y.toFixed(1) +
                        '" r="' + rayon.toFixed(2) + '"/>');
                }
                y += pasY;
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
