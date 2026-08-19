// Le champ de points de /points : un seul objet pour toute la page.
//
// Les deux dégradés et le semis du milieu ne sont plus deux matières à
// raccorder. C'est le même dessin d'un bout à l'autre, dont deux propriétés
// varient ensemble : la densité de la trame, et le rayon des points.
//
// Trois règles le tiennent :
//
// 1. Tous les points ont la même encre, sans exception. Le dégradé ne peut
//    donc pas passer par l'opacité — faire varier l'opacité, c'est faire
//    varier la couleur. Il passe par le nombre de points.
//
// 2. Le milieu est une surface uniforme : là, tous les points ont aussi le
//    même rayon.
//
// 3. Les bords de la page gardent le vignettage du site : le rayon y grossit
//    vers la gauche et la droite, comme sur gumi.ch.
//
// Densité et rayon descendent du même avancement, de 0 sur les bords de la
// page à 1 au milieu. La trame se vide pendant que le vignettage s'aplatit,
// et les deux ont fini leur course au même endroit : il n'y a donc aucun
// point de la page où l'on passe d'un objet à un autre.
(function () {
    var champ = document.querySelector('.points-champ');
    if (!champ) return;

    var PAS_X = 20, PAS_Y = 18;   // la trame du site
    var RAYON = 3;                // le plus petit point des dégradés
    var CROISSANCE = 4;           // ce que le rayon gagne aux bords, comme sur le site
    var ENCRE = 0.24;             // 0,04 sur le site ; la page sert de loupe

    // La descente reprend exactement les deux bandes du site : 250 px en haut,
    // 180 en bas, les hauteurs déclarées dans le fond de gumi.ch. C'est ce qui
    // garde le haut de page serré, et la descente finie là où le dégradé du
    // site finissait. Une descente de 1000 px, essayée avant, lissait tout mais
    // le dégradé n'y ressemblait plus à celui de gumi.ch : il n'était plus
    // une bande dense en haut de page, il occupait l'écran entier.
    var FONDU_HAUT = 250, FONDU_BAS = 180;
    // Le plateau du milieu. Il se place entre le rang 3 et le rang 4 de la
    // matrice : les rangs 0 a 3 restent, ce qui donne exactement la trame
    // 80x72 du semis de /fond.
    var CREUX = 3.5 / 64;
    // Et le rang 4 est coupé net dès que la densité arrive à moins d'un rang
    // du plateau. Ses points forment eux-mêmes une trame très clairsemée :
    // laissés à la courbe, ils survivaient jusqu'au dernier pixel de la
    // descente et laissaient une rangée de traînards isolée juste avant le
    // plateau. Les couper coûte 1/64 des points, invisible.
    var MARGE_PLATEAU = 1 / 64;

    // Matrice de Bayer 8x8, construite par récurrence à partir de la 4x4 :
    // chaque case reçoit un rang de 0 à 63, et on ne garde que les rangs
    // inférieurs à la densité voulue.
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
        var largeur = window.innerWidth;
        var hauteur = champ.offsetHeight;
        var svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="currentColor" opacity="' + ENCRE + '">';

        for (var j = 0; j * PAS_Y <= hauteur; j++) {
            var y = j * PAS_Y;
            // 0 sur les deux bords de la page, 1 au milieu. C'est le seul
            // réglage : densité et rayon en descendent tous les deux, ce qui
            // les empêche de se désynchroniser.
            var t = Math.max(0, Math.min(y / FONDU_HAUT, (hauteur - y) / FONDU_BAS, 1));
            // Ce qui reste du dégradé à cette hauteur : une seule quantité pour
            // la densité et pour le rayon, donc rien ne peut se désynchroniser.
            // La pente est droite, comme le masque du dégradé du site : c'est sa
            // loi, transposée de l'opacité vers la densité. Les deux courbes
            // d'encre se superposent donc sur toute la bande.
            var reste = 1 - t;
            // Le vignettage, lui, tient plus longtemps qu il ne s efface : sur le
            // site le rayon ne depend pas de la hauteur, seule l opacite fond.
            // Le cube le garde a pleine force sur la premiere moitie de la
            // bande et ne l aplatit qu a la toute fin, ce qui fait coller les
            // deux courbes d encre au lieu de faire tomber la notre deux fois
            // plus vite.
            var resteRayon = 1 - t * t * t;
            var densite = CREUX + (1 - CREUX) * reste;
            if (densite < CREUX + MARGE_PLATEAU) densite = CREUX;
            var decale = (j % 2 !== 0) ? PAS_X / 2 : 0;

            for (var k = 0; k * PAS_X + decale <= largeur + PAS_X; k++) {
                if (BAYER[j % 8][k % 8] / 64 >= densite) continue;

                var x = k * PAS_X + decale;
                // La loi du site : le rayon grossit vers les bords gauche et
                // droit. Elle s'efface au même rythme que la densité, si bien
                // qu'au milieu il ne reste qu'un rayon unique.
                var nx = Math.abs(x - largeur / 2) / (largeur / 2);
                var rayon = RAYON + resteRayon * Math.pow(nx, 2) * CROISSANCE;

                svg += '<circle cx="' + x + '" cy="' + y +
                    '" r="' + rayon.toFixed(2) + '"/>';
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
