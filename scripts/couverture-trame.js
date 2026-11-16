// Les couvertures des expérimentations se défont en points.
//
// Le coin en haut à gauche et le coin en bas à droite de chaque couverture
// passent en trame : l'image ne se voit plus qu'à travers des points, qui
// rétrécissent vers le coin jusqu'à disparaître. Ces points sont ceux du
// fond (scripts/trame.js, scripts/lavande.js) : même grille en quinconce,
// même pas, même taille, posés exactement sur les points du fond, si bien
// que l'image a l'air de se dissoudre dans le paysage.
//
// Le masque est dessiné sur une toile à la taille de l'image, puis posé en
// mask-image. Au survol, les coins se referment un peu : une seconde copie
// de l'image, au masque plus fermé, paraît par-dessus en fondu. Les deux
// masques ne sont dessinés qu'une fois par mise en page, jamais pendant
// l'animation.
(function () {
    var images = Array.prototype.slice.call(document.querySelectorAll('.exp-image'));
    if (!images.length || !('maskImage' in document.body.style || 'webkitMaskImage' in document.body.style)) return;

    // La grille du fond : 10 px entre deux points d'une rangée, une rangée
    // tous les 9 px environ (ajustés pour tomber juste sur la hauteur de
    // l'écran), une rangée sur deux décalée d'un demi-pas, centrée.
    var PAS_X = 10, PAS_Y = 9;
    // Un point plein couvre sa case : le passage à l'image entière ne se
    // voit pas.
    var R_PLEIN = 6.4;
    // La trame occupe une part de l'image, pas une largeur fixe : sur une
    // grande couverture, le dégradé a plus de rangées pour se faire.
    var PART = 0.66, BANDE_MIN = 56, BANDE_MAX = 120;
    // La distance au coin : entre la diagonale et le quart de cercle, pour
    // un bord légèrement bombé, moins raide qu'une coupe droite.
    function eloignement(x, y) {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        return 0.5 * (x + y) * 0.7071 + 0.5 * Math.sqrt(x * x + y * y);
    }


    // Dessine le masque à la taille de img et le pose sur cible.
    // ouverture : 1 au repos, moins pour la copie du survol.
    function masquer(img, cible, ouverture) {
        var r = img.getBoundingClientRect();
        var w = img.offsetWidth, h = img.offsetHeight;
        if (!w || !h) return;
        // Pendant l'entrée, l'image monte encore : le masque est refait à
        // la fin de l'animation, une fois l'image à sa place.
        var echelle = r.width / w;
        var gauche = r.left, haut = r.top;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var toile = cible._toile || (cible._toile = document.createElement('canvas'));
        toile.width = Math.round(w * dpr);
        toile.height = Math.round(h * dpr);
        var ctx = toile.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#000';

        var bande = Math.max(BANDE_MIN, Math.min(BANDE_MAX, h * PART)) * ouverture;
        // La partie pleine : l'image moins ses deux coins, dont le bord suit
        // la ligne où les points sont pleins.
        var k, a, portee;
        ctx.beginPath();
        for (k = 0; k <= 12; k++) {              // le coin en bas à droite
            a = (k / 12) * 1.5708;
            portee = bande / eloignement(Math.sin(a), Math.cos(a));
            ctx.lineTo(w - portee * Math.sin(a), h - portee * Math.cos(a));
        }
        ctx.lineTo(0, h);
        for (k = 0; k <= 12; k++) {              // le coin en haut à gauche
            a = (k / 12) * 1.5708;
            portee = bande / eloignement(Math.sin(a), Math.cos(a));
            ctx.lineTo(portee * Math.sin(a), portee * Math.cos(a));
        }
        ctx.lineTo(w, 0);
        ctx.closePath();
        ctx.fill();

        // Les points, sur la grille du fond, en coordonnées de l'écran.
        var hauteur = window.innerHeight, centre = window.innerWidth / 2;
        var pas = hauteur / Math.max(1, Math.round(hauteur / PAS_Y));
        var j0 = Math.floor(haut / pas) - 1, j1 = Math.ceil((haut + h * echelle) / pas) + 1;
        for (var j = j0; j <= j1; j++) {
            var dec = (((j % 2) + 2) % 2) ? PAS_X / 2 : 0;
            var y = (j * pas - haut) / echelle;
            var i0 = Math.floor((gauche - centre - dec) / PAS_X) - 1;
            var i1 = Math.ceil((gauche + w * echelle - centre - dec) / PAS_X) + 1;
            for (var i = i0; i <= i1; i++) {
                var x = (centre + i * PAS_X + dec - gauche) / echelle;
                var d = Math.min(eloignement(x, y), eloignement(w - x, h - y));   // au coin le plus proche
                if (d > bande + PAS_X) continue;               // la partie pleine le couvre
                // La loi du fond : l'aire du point suit le ton. Vers le coin,
                // le point s'allège aussi, jusqu'à se confondre avec ceux
                // du paysage derrière lui.
                var ton = d / bande;
                if (ton > 1) ton = 1;
                ton = ton * ton * (3 - 2 * ton);
                var rayon = R_PLEIN * Math.sqrt(ton);
                if (rayon < 0.5) continue;
                ctx.globalAlpha = 0.3 + 0.7 * Math.min(1, ton * 1.6);
                ctx.beginPath();
                ctx.arc(x, y, rayon, 0, 6.2832);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        var url = 'url(' + toile.toDataURL('image/png') + ')';
        cible.style.webkitMaskImage = url;
        cible.style.maskImage = url;
        cible.style.webkitMaskSize = cible.style.maskSize = '100% 100%';
        cible.style.webkitMaskRepeat = cible.style.maskRepeat = 'no-repeat';
    }

    // Chaque image reçoit un cadre et sa copie du survol, que la feuille de
    // style fait paraître (styles/accueil.css, .exp-image-survol).
    images.forEach(function (img) {
        var cadre = document.createElement('span');
        cadre.className = 'exp-cadre';
        img.parentNode.insertBefore(cadre, img);
        cadre.appendChild(img);
        var copie = document.createElement('img');
        copie.className = 'exp-image-survol';
        copie.alt = '';
        copie.setAttribute('aria-hidden', 'true');
        copie.decoding = 'async';
        copie.src = img.currentSrc || img.src;
        cadre.appendChild(copie);
        img._copie = copie;
        if (!img.complete) img.addEventListener('load', function () { un(img); });
    });

    var OUVERT = 1, FERME = 0.45;
    function un(img) { masquer(img, img, OUVERT); masquer(img, img._copie, FERME); }
    function tout() { images.forEach(un); }

    // La grille est celle de l'écran : le masque se refait dès que l'image
    // bouge (fenêtre, langue qui change la phrase, fin de l'entrée).
    var attente;
    function bientot() { clearTimeout(attente); attente = setTimeout(tout, 60); }
    window.addEventListener('resize', bientot);
    document.addEventListener('animationend', bientot);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(bientot);
    if ('ResizeObserver' in window) new ResizeObserver(bientot).observe(document.body);
    new MutationObserver(bientot).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    tout();
})();
