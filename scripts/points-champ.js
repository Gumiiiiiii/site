// Le champ de points de /points : une seule couche pour toute la page.
//
// La page a deux exigences qui se contredisent en apparence : tous les points
// doivent avoir la même taille et la même encre, et le haut doit être dense
// quand le milieu est clairsemé. Il ne reste donc qu'une variable pour faire
// le dégradé : la densité. Aucun point ne s'éteint, aucun ne grossit ; ils
// sont simplement de moins en moins nombreux à mesure qu'on descend.
//
// Le tri se fait par tramage ordonné, une matrice de Bayer 4x4 : chaque point
// de la trame 20x18 reçoit un rang de 0 à 15, et on ne garde que les rangs
// inférieurs à la densité voulue. La matrice de Bayer a exactement la
// propriété qu'il faut ici — ses quatre plus petits rangs occupent les cases
// paires, et son rang 0 la case (0,0) :
//
//   densité 1     -> les 16 rangs      -> trame 20x18, celle du site
//   densité 1/4   -> rangs 0 a 3       -> trame 40x36
//   densité 1/16  -> rang 0 seul       -> trame 80x72, le semis du milieu
//
// Les paliers tombent donc pile sur les trames du site, et entre deux paliers
// les points qui disparaissent sont dispersés plutôt que retirés par blocs :
// c'est ce qui rend la descente lisse au lieu de la faire par bandes.
//
// Autre effet de la matrice : les rangs des rangées décalées valent tous 4 ou
// plus. Le quinconce n'existe donc que dans la partie dense, et le milieu
// clairsemé reste sur les rangées non décalées — la trame du semis, inchangée.
(function () {
    var champ = document.querySelector('.points-champ');
    if (!champ) return;

    var PAS_X = 20, PAS_Y = 18;   // la trame du site
    var RAYON = 3;                // le plus petit point des dégradés
    var ENCRE = 0.24;            // 0,04 sur le site ; la page sert de loupe
    var FONDU_HAUT = 400;        // hauteur de la descente, en haut
    var FONDU_BAS = 300;         // et en bas, où le dégradé du site est plus court
    var CREUX = 1 / 16;          // la densité du milieu

    var BAYER = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ];

    var minuterie;

    // Densité voulue à la hauteur y : 1 sur les deux bords de la page, CREUX
    // au milieu, et une pente droite entre les deux. Droite, donc l'encre
    // décroît à vitesse constante — les points étant tous identiques, densité
    // et encre sont ici la même chose.
    function densite(y, hauteur) {
        var t = Math.min(y / FONDU_HAUT, (hauteur - y) / FONDU_BAS, 1);
        return 1 + (CREUX - 1) * Math.max(0, t);
    }

    function dessiner() {
        var largeur = window.innerWidth;
        var hauteur = champ.offsetHeight;
        var svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="currentColor" opacity="' + ENCRE + '">';

        for (var j = 0; j * PAS_Y <= hauteur; j++) {
            var y = j * PAS_Y;
            var seuil = densite(y, hauteur);
            var decale = (j % 2 !== 0) ? PAS_X / 2 : 0;

            for (var k = 0; k * PAS_X + decale <= largeur + PAS_X; k++) {
                if (BAYER[j % 4][k % 4] / 16 >= seuil) continue;
                svg += '<circle cx="' + (k * PAS_X + decale) + '" cy="' + y +
                    '" r="' + RAYON + '"/>';
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
