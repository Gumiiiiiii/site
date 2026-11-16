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
// mask-image. Au survol, les coins se referment un peu.
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
    var DEBUT = 4, BANDE = 58;      // en px depuis le coin : premier point, image pleine
    var CALME = window.matchMedia('(prefers-reduced-motion: reduce)');

    function lisse(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

    // ouverture : 1 au repos, moins au survol (les coins se referment).
    function masquer(img, ouverture) {
        var r = img.getBoundingClientRect();
        var w = img.offsetWidth, h = img.offsetHeight;
        if (!w || !h) return;
        // Pendant l'entrée, l'image monte encore : le masque est refait à
        // la fin de l'animation, une fois l'image à sa place.
        var echelle = r.width / w;
        var gauche = r.left, haut = r.top;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var toile = img._toile || (img._toile = document.createElement('canvas'));
        toile.width = Math.round(w * dpr);
        toile.height = Math.round(h * dpr);
        var ctx = toile.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#000';

        var bande = BANDE * ouverture, debut = DEBUT * ouverture;
        // La partie pleine : l'image moins ses deux coins.
        ctx.beginPath();
        ctx.moveTo(bande, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h - bande);
        ctx.lineTo(w - bande, h); ctx.lineTo(0, h); ctx.lineTo(0, bande);
        ctx.closePath();
        ctx.fill();

        // Les points, sur la grille du fond, en coordonnées de l'écran.
        var hauteur = window.innerHeight, centre = window.innerWidth / 2;
        var pas = hauteur / Math.max(1, Math.round(hauteur / PAS_Y));
        ctx.beginPath();
        var j0 = Math.floor(haut / pas) - 1, j1 = Math.ceil((haut + h * echelle) / pas) + 1;
        for (var j = j0; j <= j1; j++) {
            var dec = (((j % 2) + 2) % 2) ? PAS_X / 2 : 0;
            var y = (j * pas - haut) / echelle;
            var i0 = Math.floor((gauche - centre - dec) / PAS_X) - 1;
            var i1 = Math.ceil((gauche + w * echelle - centre - dec) / PAS_X) + 1;
            for (var i = i0; i <= i1; i++) {
                var x = (centre + i * PAS_X + dec - gauche) / echelle;
                var d = Math.min(x + y, (w - x) + (h - y));   // au coin le plus proche
                if (d > bande + PAS_X) continue;               // la partie pleine le couvre
                var rayon = R_PLEIN * Math.sqrt(lisse((d - debut) / Math.max(1, bande - debut)));
                if (rayon < 0.4) continue;
                ctx.moveTo(x + rayon, y);
                ctx.arc(x, y, rayon, 0, 6.2832);
            }
        }
        ctx.fill();

        var url = 'url(' + toile.toDataURL('image/png') + ')';
        img.style.webkitMaskImage = url;
        img.style.maskImage = url;
        img.style.webkitMaskSize = img.style.maskSize = '100% 100%';
        img.style.webkitMaskRepeat = img.style.maskRepeat = 'no-repeat';
        img._ouverture = ouverture;
    }

    function tout() { images.forEach(function (img) { masquer(img, img._ouverture || 1); }); }

    // Au survol, les coins se referment ; ils se rouvrent en sortant.
    function vers(img, cible) {
        cancelAnimationFrame(img._anim);
        if (CALME.matches) { masquer(img, cible); return; }
        var depart = img._ouverture || 1, t0 = performance.now();
        (function pas(maintenant) {
            var k = lisse((maintenant - t0) / 320);
            masquer(img, depart + (cible - depart) * k);
            if (k < 1) img._anim = requestAnimationFrame(pas);
        })(t0);
    }
    images.forEach(function (img) {
        var lien = img.closest('a') || img;
        lien.addEventListener('mouseenter', function () { vers(img, 0.45); });
        lien.addEventListener('mouseleave', function () { vers(img, 1); });
        lien.addEventListener('focus', function () { vers(img, 0.45); });
        lien.addEventListener('blur', function () { vers(img, 1); });
        if (!img.complete) img.addEventListener('load', function () { masquer(img, img._ouverture || 1); });
    });

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
