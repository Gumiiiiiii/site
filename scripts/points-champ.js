// Le champ de points du site : un seul objet pour tout le fond de la page.
//
// C'est un halftone. La bande du haut est une trame pleine de points gras qui
// rétrécissent en descendant ; ceux qui restent en fin de course forment la
// grille du milieu, tous du même calibre. Le dégradé et la grille ne sont donc
// pas deux matières raccordées, mais un seul dessin pris à deux moments.
//
// Trois règles le tiennent :
//
// 1. Tous les points ont la même encre, sans exception. Le dégradé ne passe
//    jamais par l'opacité — la faire varier, c'est faire varier la couleur.
//    Il passe par la taille des points, comme un halftone d'imprimeur.
//
// 2. Le milieu est une surface uniforme : là, tous les points ont le même
//    rayon, sur la trame 80x72, celle du semis du site.
//
// 3. Le haut de page garde le vignettage du site : le rayon grossit encore
//    vers la gauche et la droite, comme sur gumi.ch.
//
// Chaque point a sa propre fin, décidée par son rang dans la matrice de Bayer.
// Les rangs 0 à 3 sont ceux de la grille : ils ne meurent jamais et
// rétrécissent seulement jusqu'à RAYON. Les autres rétrécissent jusqu'à zéro,
// d'autant plus tôt que leur rang est haut. Aucun point ne disparaît d'un
// coup, et au même endroit deux points de rangs différents n'ont pas la même
// taille : c'est ce qui fait la texture du halftone plutôt qu'une grille qui
// se viderait par blocs.
(function () {
    var champ = document.querySelector('.points-champ');
    if (!champ) return;

    var PAS_X = 20, PAS_Y = 18;   // la trame du site
    var RAYON = 3;                // le point de la grille du milieu
    var RAYON_SOMMET = 7;         // le point du haut de page, au centre
    var CROISSANCE = 2.5;         // ce que le rayon gagne encore vers les bords de page
    var ENCRE = 0.04;             // l encre du fond de gumi.ch, a l identique

    // La descente reprend exactement les deux bandes du site : 250 px en haut,
    // 180 en bas, les hauteurs déclarées dans le fond de gumi.ch. C'est ce qui
    // garde le haut de page serré, et la descente finie là où le dégradé du
    // site finissait. Une descente de 1000 px, essayée avant, lissait tout mais
    // le dégradé n'y ressemblait plus à celui de gumi.ch : il n'était plus
    // une bande dense en haut de page, il occupait l'écran entier.
    var FONDU_HAUT = 250, FONDU_BAS = 250;
    // Les deux rangées extrêmes sont centrées sur le bord de la page : elles y
    // sont donc coupées à moitié, ce qui fait commencer la trame par une ligne
    // de demi-points plutôt que par une rangée entière posée en retrait.
    //
    // Pour que la dernière tombe exactement sur le bas comme la première sur le
    // haut, le pas vertical est la hauteur divisée par le nombre entier de
    // rangées le plus proche. Il vaut 18 px pile quand la hauteur en est un
    // multiple — le cas d'une fenêtre de 900 px — et s'en écarte d'un demi
    // pour cent au pire sinon.
    // Le seuil du milieu, entre le rang 3 et le rang 4 de la matrice : il fixe
    // à quelle hauteur chaque rang atteint zéro, et laisse les rangs 0 à 3 —
    // soit exactement la trame 80x72, celle du semis du site.
    // Les fenêtres de rétrécissement, en avancement dans la bande : niveau 0,
    // niveau 1, niveau 2. Elles se chevauchent largement.
    var FENETRES = [[0, 1], [0.25, 0.9], [0, 0.55]];

    // Matrice de Bayer 8x8, construite par récurrence à partir de la 4x4 :
    // chaque case reçoit un rang de 0 à 63, qui décide de la hauteur à
    // laquelle son point atteint zéro.
    //
    // Cette construction a exactement la propriété qu'il faut ici — les rangs
    // les plus bas se placent sur les cases les plus espacées, et chaque
    // quart de densité retombe sur une trame du site :
    //
    //   densité 1     -> les 64 rangs -> trame 20x18, celle des dégradés
    //   densité 1/4   -> rangs 0 a 15 -> trame 40x36
    //   densité 1/16  -> rangs 0 a 3  -> trame 80x72, le semis du milieu
    //   densité 1/64  -> rang 0 seul  -> trame 160x144 (hors course ici)
    //
    // Les paliers tombent donc pile sur les trames existantes, et entre deux
    // paliers les points retirés sont dispersés plutôt qu'enlevés par blocs :
    // c'est ce qui rend la descente lisse. La 8x8 y ajoute la finesse : la
    // descente compte 60 marches entre la trame pleine et le semis, plutot que
    // 12 en 4x4, soit une marche tous les 16 px sur 1000 — moins que le pas
    // des rangees, donc aucune ne se voit passer.
    //
    // Autre effet : les rangs des rangées décalées valent tous 16 ou plus. Le
    // quinconce n'existe donc que dans la partie dense, et tout le bas de la
    // descente reste sur les rangées non décalées, celles du semis.
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

    function dessiner() {
        // La largeur du conteneur, pas celle de la fenêtre : la barre de
        // défilement, toujours présente sur une page de trois écrans, décalait
        // l axe de la moitié de sa largeur et cassait la symétrie.
        var largeur = champ.offsetWidth;
        var centre = largeur / 2;
        var hauteur = champ.offsetHeight;
        var svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="currentColor" opacity="' + ENCRE + '">';

        var rangees = Math.round(hauteur / PAS_Y);
        var pas = hauteur / rangees;

        for (var j = 0; j <= rangees; j++) {
            var y = j * pas;
            // L'avancement dans la bande : 0 sur les deux bords de la page,
            // 1 dès qu'on entre dans la grille du milieu.
            var t = Math.max(0, Math.min(y / FONDU_HAUT, (hauteur - y) / FONDU_BAS, 1));
            var impaire = (j % 2 !== 0);

            // Les points sont posés par paires de part et d'autre de l'axe, et
            // non plus alignés depuis le bord gauche : la symétrie gauche-droite
            // est ainsi vraie par construction, quelle que soit la largeur de la
            // fenêtre. Les rangées impaires, en quinconce, n'ont pas de point
            // sur l'axe lui-même : leur première paire l'encadre à un demi-pas.
            for (var i = 0; i * PAS_X <= centre + PAS_X; i++) {
                // Le niveau du point : la trame la plus grossière à laquelle il
                // appartient. Les trames sont emboîtées, donc trois niveaux
                // décrivent tout le champ. Le rang i se compte depuis l'axe, ce
                // qui donne le même niveau aux deux points d'une paire.
                var niveau;
                if (impaire) niveau = 2;                           // le quinconce
                else if (j % 4 === 0 && i % 4 === 0) niveau = 0;    // 80x72, la grille
                else if (j % 2 === 0 && i % 2 === 0) niveau = 1;    // 40x36
                else niveau = 2;                                   // 20x18, la trame pleine

                // Chaque niveau a sa fenêtre de rétrécissement. Les points du
                // niveau 2 s'effacent les premiers, ceux du niveau 1 ensuite,
                // et ceux du niveau 0 ne s'effacent jamais : ils s'arrêtent à
                // RAYON et forment la grille du milieu. Les fenêtres se
                // chevauchent, sinon le champ passerait d'une trame à l'autre
                // par paliers au lieu de fondre.
                var debut = FENETRES[niveau][0], finw = FENETRES[niveau][1];
                var p = (t - debut) / (finw - debut);
                p = p < 0 ? 0 : (p > 1 ? 1 : p);
                if (niveau !== 0 && p >= 1) continue;

                var ecart = impaire ? (i + 0.5) * PAS_X : i * PAS_X;
                var nx = Math.min(1, ecart / centre);
                // Le sommet du halftone : des points gras, qui grossissent
                // encore vers les bords gauche et droit comme sur le site.
                var sommet = RAYON_SOMMET + nx * nx * CROISSANCE;
                var cible = niveau === 0 ? RAYON : 0;
                // La loi du halftone : c'est l'aire qui suit le ton, pas le
                // rayon. Interpoler le rayon ferait chuter l'encre au carré et
                // la bande s'éteindrait deux fois trop vite.
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

    dessiner();
    window.addEventListener('resize', function () {
        clearTimeout(minuterie);
        minuterie = setTimeout(dessiner, 100);
    });
})();
