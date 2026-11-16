// Le fond d'une page d'expérimentation : sa couverture, imprimée en points.
//
// La couverture de l'article (#article-cover) est relue sur la grille en
// quinconce du site (10 px entre deux points, une rangée tous les 9 px) et
// redessinée en trame : l'aire de chaque point suit le ton de l'image à cet
// endroit, dans l'encre grise de la page. L'impression s'efface vers le bas
// et vers la gauche, où se tient le titre, pour ne jamais gêner la lecture.
// Elle se dessine une fois, puis à chaque changement de taille ou de thème.
(function () {
    var toile = document.getElementById('etude-trame');
    var image = document.getElementById('article-cover');
    if (!toile || !image || !toile.getContext) return;

    var PAS_X = 10, PAS_Y = 9, RAYON_MAX = 5.2;
    var ctx = null, lu = null;    // lu : les tons de l'image, relus une fois

    function lisse(a, b, x) {
        var t = (x - a) / (b - a);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    }

    // Relit l'image en tons de gris, à petite taille : on n'a besoin que
    // d'un ton par point de la trame.
    function relire(source) {
        var w = 192, h = Math.round(w * source.naturalHeight / source.naturalWidth) || 108;
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var x = c.getContext('2d');
        try {
            x.drawImage(source, 0, 0, w, h);
            var d = x.getImageData(0, 0, w, h).data;
        } catch (e) { return null; }
        var tons = new Float32Array(w * h), bas = 1, haut = 0;
        for (var i = 0; i < w * h; i++) {
            var l = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
            tons[i] = l;
            if (l < bas) bas = l;
            if (l > haut) haut = l;
        }
        // Le contraste est étiré sur toute l'échelle, puis recentré : une
        // couverture sombre ne noircit pas tout le haut de la page, une claire
        // ne disparaît pas. Le ton moyen se pose à mi-chemin.
        var ecart = Math.max(0.05, haut - bas), somme = 0;
        for (var j = 0; j < tons.length; j++) { tons[j] = (tons[j] - bas) / ecart; somme += tons[j]; }
        var moyen = somme / tons.length, gamma = Math.log(0.5) / Math.log(Math.min(0.95, Math.max(0.05, moyen)));
        for (var k = 0; k < tons.length; k++) tons[k] = Math.pow(tons[k], gamma);
        return { w: w, h: h, tons: tons };
    }

    // L'image affichée sert si elle vient du site ; sinon (une couverture
    // hébergée ailleurs) on la recharge en CORS, la seule façon d'en lire
    // les pixels.
    var source = null;
    function charger(fini) {
        if (source) return fini();
        var meme = new URL(image.currentSrc || image.src, location.href).origin === location.origin;
        if (meme && image.complete && image.naturalWidth) { source = image; return fini(); }
        var copie = new Image();
        copie.crossOrigin = 'anonymous';
        copie.onload = function () { source = copie; fini(); };
        copie.src = image.currentSrc || image.src;
    }

    function dessiner() {
        if (!source) return charger(dessiner);
        if (!lu) lu = relire(source);
        if (!lu) return;
        if (!ctx) ctx = toile.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var largeur = toile.clientWidth, hauteur = toile.clientHeight;
        if (!largeur || !hauteur) return;
        toile.width = Math.round(largeur * dpr);
        toile.height = Math.round(hauteur * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);

        var racine = document.documentElement;
        var sombre = racine.getAttribute('data-theme') === 'dark';
        var rgb = (getComputedStyle(racine).getPropertyValue('--text-rgb') || '26, 26, 26').trim();
        ctx.fillStyle = 'rgba(' + rgb + ', ' + (sombre ? 0.14 : 0.11) + ')';

        // L'image couvre la toile en largeur, calée en haut.
        var echelle = largeur / lu.w;
        var centre = largeur / 2;
        // La colonne du texte, d'après le titre et le résumé.
        var col = document.querySelector('.article-hero');
        var r = col ? col.getBoundingClientRect() : { left: 0, right: largeur * 0.3 };
        var colG = r.left, colD = r.right;
        ctx.beginPath();
        for (var j = 0, y = PAS_Y / 2; y < hauteur; j++, y += PAS_Y) {
            var dec = (j % 2) ? PAS_X / 2 : 0;
            var iy = Math.floor(y / echelle);
            if (iy >= lu.h) break;
            // L'effacement vers le bas.
            var fondu = 1 - lisse(hauteur * 0.25, hauteur * 0.95, y);
            for (var x = ((centre + dec) % PAS_X); x < largeur; x += PAS_X) {
                // Et vers la gauche, où se tient le titre.
                // Et dans la colonne du texte : la trame vit sur ses côtés.
                var dehors = Math.max(colG - x, x - colD, 0);
                var poids = 0.62 * fondu * (0.04 + 0.96 * lisse(0, 240, dehors));
                if (poids < 0.02) continue;
                var ix = Math.floor(x / echelle);
                var t = lu.tons[iy * lu.w + Math.min(lu.w - 1, ix)];
                // En clair, l'encre dessine les ombres de l'image ; en sombre,
                // ses lumières.
                var ton = (sombre ? t : 1 - t) * poids;
                if (ton < 0.01) continue;
                var r = RAYON_MAX * Math.sqrt(ton);
                ctx.moveTo(x + r, y);
                ctx.arc(x, y, r, 0, 6.2832);
            }
        }
        ctx.fill();
        toile.classList.add('prete');
    }

    var attente;
    function bientot() { clearTimeout(attente); attente = setTimeout(dessiner, 120); }
    window.addEventListener('resize', bientot);
    new MutationObserver(dessiner).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (image.complete && image.naturalWidth) dessiner();
    else image.addEventListener('load', dessiner);
})();
