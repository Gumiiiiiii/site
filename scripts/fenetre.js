// Variante C de l'accueil : la fenêtre.
//
// Une seule grande fenêtre cintrée, au centre, montre l'image de couverture
// d'une expérimentation. Survoler ou viser un titre l'y fait apparaître, et
// la fenêtre mène alors à cet article. Rien ne tourne tout seul : l'image
// reste celle qu'on a visée en dernier.
(function () {
    var arche = document.querySelector('.fen-arche');
    var titres = Array.prototype.slice.call(document.querySelectorAll('.fen-exps .exp'));
    if (!arche || !titres.length) return;
    var images = Array.prototype.slice.call(arche.querySelectorAll('img'));

    function montrer(i) {
        titres.forEach(function (t, k) { t.classList.toggle('est-montre', k === i); });
        images.forEach(function (img, k) { img.classList.toggle('est-montre', k === i); });
        arche.setAttribute('href', titres[i].getAttribute('href'));
        arche.setAttribute('aria-label', titres[i].textContent.trim());
    }

    titres.forEach(function (t, i) {
        t.addEventListener('mouseenter', function () { montrer(i); });
        t.addEventListener('focus', function () { montrer(i); });
    });
    montrer(0);
})();
