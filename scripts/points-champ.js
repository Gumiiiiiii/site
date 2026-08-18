// Le champ de points de /points : une seule couche pour toute la page.
//
// Trois choses devaient tenir ensemble, et c'est ce qui a dicté le dessin.
//
// 1. Tous les points ont la même encre. Un dégradé ne peut donc pas passer
//    par l'opacité : faire varier l'opacité, c'est faire varier la couleur.
//    Il reste le nombre de points. Le dégradé se fait en en retirant.
//
// 2. Le milieu de la page est une matière uniforme : là, tous les points ont
//    aussi la même taille.
//
// 3. Les deux bandes denses gardent le dégradé du site, points compris :
//    leur rayon grossit vers les bords gauche et droit, comme sur gumi.ch.
//
// Densité et rayon suivent donc le même avancement, de 0 sur les bords de la
// page à 1 au milieu : la trame se vide pendant que le vignettage s'aplatit,
// et les deux ont fini leur course au même endroit. Aucune couche à
// raccorder, donc aucun raccord : le champ est continu par construction.
//
// Le tri des points est un tramage ordonné, matrice de Bayer 4x4 : chaque
// point de la trame 20x18 reçoit un rang de 0 à 15, et on ne garde que les
// rangs inférieurs à la densité voulue. La matrice a exactement la propriété
// qu'il faut ici — ses quatre plus petits rangs occupent les cases paires, et
// son rang 0 la case (0,0) :
//
//   densité 1     -> les 16 rangs      -> trame 20x18, celle des dégradés
//   densité 1/4   -> rangs 0 a 3       -> trame 40x36
//   densité 1/16  -> rang 0 seul       -> trame 80x72, le semis du milieu
//
// Les paliers tombent donc pile sur les trames du site, et entre deux paliers
// les points retirés sont dispersés plutôt que retirés par blocs : c'est ce
// qui rend la descente lisse au lieu de la faire par bandes.
//
// Autre effet de la matrice : les rangs des rangées décalées valent tous 4 ou
// plus. Le quinconce n'existe donc que dans la partie dense, et le milieu
// clairsemé reste sur les rangées non décalées — la trame du semis, inchangée.
(function () {
    var champ = document.querySelector('.points-champ');
    if (!champ) return;

    var PAS_X = 20, PAS_Y = 18;   // la trame du site
    var RAYON = 3;                // le plus petit point des dégradés
    var CROISSANCE = 4;           // ce que le rayon gagne aux bords, comme sur le site
    var ENCRE = 0.24;             // 0,04 sur le site ; la page sert de loupe
    var FONDU_HAUT = 400;         // hauteur de la descente, en haut
    var FONDU_BAS = 300;          // et en bas, où le dégradé du site est plus court
    var CREUX = 1 / 16;           // la densité du milieu

    var BAYER = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ];

    var minuterie;

    // 0 sur les deux bords de la page, 1 au milieu, une pente droite entre les
    // deux. C'est le seul réglage : densité et rayon en descendent tous les
    // deux, ce qui les empêche de se désynchroniser.
    function avancement(y, hauteur) {
        return Math.max(0, Math.min(y / FONDU_HAUT, (hauteur - y) / FONDU_BAS, 1));
    }

    function dessiner() {
        var largeur = window.innerWidth;
        var hauteur = champ.offsetHeight;
        var svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="currentColor" opacity="' + ENCRE + '">';

        for (var j = 0; j * PAS_Y <= hauteur; j++) {
            var y = j * PAS_Y;
            var t = avancement(y, hauteur);
            // La densité va de 1 aux bords de la page à 1/16 au milieu.
            var densite = 1 + (CREUX - 1) * t;
            var decale = (j % 2 !== 0) ? PAS_X / 2 : 0;

            for (var k = 0; k * PAS_X + decale <= largeur + PAS_X; k++) {
                if (BAYER[j % 4][k % 4] / 16 >= densite) continue;

                var x = k * PAS_X + decale;
                // La loi du site : le rayon grossit vers les bords gauche et
                // droit. Elle s'efface au même rythme que la densité, si bien
                // qu'au milieu il ne reste qu'un rayon unique.
                var nx = Math.abs(x - largeur / 2) / (largeur / 2);
                var rayon = RAYON + (1 - t) * Math.pow(nx, 2) * CROISSANCE;

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
