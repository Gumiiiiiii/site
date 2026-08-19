// Les deux cartes de passions partagent une diagonale, et leurs quatre coins
// doivent être arrondis — y compris celui où la diagonale rejoint un bord.
//
// Aucune forme CSS ne sait faire ça : polygon() n'a que des sommets vifs, et
// border-radius ne s'applique qu'à la boîte. On calcule donc le tracé ici, en
// pixels, et on le pose en clip-path: path(). Chaque sommet est remplacé par
// un arc de même rayon que le reste de la page (1,25 rem), quel que soit
// l'angle : c'est ce qui rend le coin de la diagonale identique aux autres.
//
// Le CSS garde son polygon() : c'est ce que voit un visiteur sans JavaScript,
// et c'est aussi lui qui commande sous 760 px, où il vaut none — on ne pose
// alors aucun tracé.
(function () {
    var RAYON = 20;   // 1,25 rem, comme les autres blocs

    var section = document.querySelector('.fond-passions');
    if (!section) return;

    var cartes = Array.prototype.slice.call(section.querySelectorAll('.fond-passion'));
    if (!cartes.length) return;

    // --biais est une clamp() : la seule façon fiable de la lire en pixels est
    // de la donner à mesurer à un élément.
    function biais() {
        var sonde = document.createElement('div');
        sonde.style.cssText = 'position:absolute;width:var(--biais);height:0;visibility:hidden;pointer-events:none';
        section.appendChild(sonde);
        var w = sonde.getBoundingClientRect().width;
        sonde.remove();
        return w;
    }

    function arrondir(points, rayon) {
        var n = points.length;
        var d = '';

        for (var i = 0; i < n; i++) {
            var p = points[i];
            var a = points[(i - 1 + n) % n];
            var b = points[(i + 1) % n];

            var v1x = a.x - p.x, v1y = a.y - p.y;
            var v2x = b.x - p.x, v2y = b.y - p.y;
            var l1 = Math.hypot(v1x, v1y);
            var l2 = Math.hypot(v2x, v2y);
            if (!l1 || !l2) continue;
            v1x /= l1; v1y /= l1;
            v2x /= l2; v2y /= l2;

            // Angle intérieur au sommet. Plus il est ouvert, plus l'arc de
            // rayon donné mord loin sur les deux bords : c'est ce recul qu'on
            // calcule, puis qu'on borne à la moitié de chaque bord pour que
            // deux coins voisins ne se marchent pas dessus.
            var angle = Math.acos(Math.max(-1, Math.min(1, v1x * v2x + v1y * v2y)));
            var demi = Math.tan(angle / 2);
            var recul = Math.min(rayon / demi, l1 / 2, l2 / 2);
            var r = recul * demi;

            var p1 = { x: p.x + v1x * recul, y: p.y + v1y * recul };
            var p2 = { x: p.x + v2x * recul, y: p.y + v2y * recul };

            // Sens de rotation du contour à ce sommet : il décide du sens de
            // l'arc, sinon la moitié des coins se creuse au lieu de s'arrondir.
            var croix = (p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x);

            d += (i === 0 ? 'M' : 'L') + arrondi(p1.x) + ' ' + arrondi(p1.y) +
                 ' A' + arrondi(r) + ' ' + arrondi(r) + ' 0 0 ' + (croix > 0 ? 1 : 0) +
                 ' ' + arrondi(p2.x) + ' ' + arrondi(p2.y) + ' ';
        }

        return d + 'Z';
    }

    function arrondi(v) { return Math.round(v * 100) / 100; }

    function tracer() {
        var b = biais();

        cartes.forEach(function (carte) {
            // On efface d'abord le tracé posé au tour précédent : c'est le CSS
            // qui doit répondre, et sous 760 px il répond « none ».
            carte.style.clipPath = '';
            carte.style.webkitClipPath = '';
            if (getComputedStyle(carte).clipPath === 'none') return;

            var r = carte.getBoundingClientRect();
            var w = r.width, h = r.height;
            if (!w || !h) return;

            // Le même parallélogramme pour les deux cartes : penchées du même
            // côté, elles se répondent au lieu de s'emboîter.
            var points = [
                { x: b, y: 0 },
                { x: w, y: 0 },
                { x: w - b, y: h },
                { x: 0, y: h }
            ];

            var chemin = 'path("' + arrondir(points, RAYON) + '")';
            carte.style.clipPath = chemin;
            carte.style.webkitClipPath = chemin;
        });
    }

    tracer();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tracer);

    var minuteur;
    window.addEventListener('resize', function () {
        clearTimeout(minuteur);
        minuteur = setTimeout(tracer, 120);
    });

    // La hauteur des cartes suit celle de leur texte : elle change avec la
    // langue, et avec l'arrivée des images.
    if (window.ResizeObserver) {
        var observateur = new ResizeObserver(function () { tracer(); });
        cartes.forEach(function (carte) { observateur.observe(carte); });
    }

    document.addEventListener('gumi:lang', function () { tracer(); });
})();
