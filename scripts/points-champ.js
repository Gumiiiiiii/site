// Le champ de points du site : un seul objet pour tout le fond de la page.
(function () {
    var champ = document.querySelector('.points-champ');
    if (!champ) return;

    var PAS_X = 20, PAS_Y = 18;   // la trame du site
    var RAYON = 3;                // le point de la grille du milieu
    var RAYON_SOMMET = 7;         // le point du haut de page, au centre
    var CROISSANCE = 2.5;         // ce que le rayon gagne encore vers les bords de page
    var ENCRE = 0.04;             // l encre du fond de gumi.ch, a l identique

    // La descente reprend exactement les deux bandes du site : 250 px en haut, 180 en bas.
    var FONDU_HAUT = 250, FONDU_BAS = 250;
    // Les deux rangées extrêmes sont centrées sur le bord de la page : elles y sont donc coupées à moitié.
    var FENETRES = [[0, 1], [0.25, 0.9], [0, 0.55]];

    // Matrice de Bayer 8x8, construite par récurrence à partir de la 4x4.
    var BAYER4 = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ];
    var QUADRANT = [[0, 2], [3, 1]];
    var BAYER = [];
    for (var i = 0; i < 8; i++) {
        BAYER[i] = [];
        for (var q = 0; q < 8; q++) {
            BAYER[i][q] = 4 * BAYER4[i % 4][q % 4] +
                QUADRANT[Math.floor(i / 4)][Math.floor(q / 4)];
        }
    }

    var minuterie;
    // Les mesures du dernier tracé.
    var dernL = -1, dernH = -1;

    function dessiner() {
        // La largeur du conteneur, pas celle de la fenêtre : la barre de défilement.
        var largeur = champ.offsetWidth;
        var centre = largeur / 2;
        var hauteur = champ.offsetHeight;
        dernL = largeur;
        dernH = hauteur;
        // Un champ masqué (l'accueil sur ordinateur, où la trame dessine tout le fond) n'a pas de hauteur.
        if (!largeur || !hauteur) { champ.innerHTML = ''; return; }
        var svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="currentColor" opacity="' + ENCRE + '">';

        var rangees = Math.round(hauteur / PAS_Y);
        var pas = hauteur / rangees;

        for (var j = 0; j <= rangees; j++) {
            var y = j * pas;
            // L'avancement dans la bande : 0 sur les deux bords de la page.
            var t = Math.max(0, Math.min(y / FONDU_HAUT, (hauteur - y) / FONDU_BAS, 1));
            var impaire = (j % 2 !== 0);

            // Les points sont posés par paires de part et d'autre de l'axe.
            for (var i = 0; i * PAS_X <= centre + PAS_X; i++) {
                // Le niveau du point : la trame la plus grossière à laquelle il appartient.
                var niveau;
                if (impaire) niveau = 2;                           // le quinconce
                else if (j % 4 === 0 && i % 4 === 0) niveau = 0;    // 80x72, la grille
                else if (j % 2 === 0 && i % 2 === 0) niveau = 1;    // 40x36
                else niveau = 2;                                   // 20x18, la trame pleine

                // Chaque niveau a sa fenêtre de rétrécissement.
                var debut = FENETRES[niveau][0], finw = FENETRES[niveau][1];
                var p = (t - debut) / (finw - debut);
                p = p < 0 ? 0 : (p > 1 ? 1 : p);
                if (niveau !== 0 && p >= 1) continue;

                var ecart = impaire ? (i + 0.5) * PAS_X : i * PAS_X;
                var nx = Math.min(1, ecart / centre);
                // Le sommet du halftone : des points gras.
                var sommet = RAYON_SOMMET + nx * nx * CROISSANCE;
                var cible = niveau === 0 ? RAYON : 0;
                // La loi du halftone : c'est l'aire qui suit le ton, pas le rayon.
                var aire = sommet * sommet + (cible * cible - sommet * sommet) * p;
                var rayon = Math.sqrt(aire);
                if (rayon < 0.3) continue;

                if (ecart === 0) {
                    svg += '<circle cx="' + centre + '" cy="' + y + '" r="' + rayon.toFixed(2) + '"/>';
                } else {
                    svg += '<circle cx="' + (centre - ecart).toFixed(1) + '" cy="' + y + '" r="' + rayon.toFixed(2) + '"/>' +
                           '<circle cx="' + (centre + ecart).toFixed(1) + '" cy="' + y + '" r="' + rayon.toFixed(2) + '"/>';
                }
            }
        }

        champ.innerHTML = svg + '</g></svg>';
    }

    function replanifier() {
        clearTimeout(minuterie);
        minuterie = setTimeout(dessiner, 100);
    }

    dessiner();
    window.addEventListener('resize', replanifier);

    // La fenêtre n'est pas la seule à changer la taille du champ : le contenu la change aussi.
    if (window.ResizeObserver) {
        new ResizeObserver(function () {
            // Redessiner à taille égale ne changerait rien au tracé.
            if (champ.offsetWidth === dernL && champ.offsetHeight === dernH) return;
            replanifier();
        }).observe(champ);
    }
})();
