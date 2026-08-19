// Carrousel d'avis, défilement sans fin.
//
// Le procédé : on duplique le jeu de cartes une fois avant et une fois après
// l'original, et on démarre sur le jeu du milieu. Quand le défilement sort de
// ce jeu, on y revient d'un bond sans transition — l'image est identique, le
// saut est donc invisible, et il n'y a jamais de retour en arrière visible
// comme avec un carrousel qui rembobine.
(function () {
    var cadre = document.querySelector('.fond-avis-cadre');
    var piste = document.querySelector('.fond-avis-piste');
    if (!cadre || !piste) return;

    var cartes = Array.prototype.slice.call(piste.children);
    var n = cartes.length;
    if (n < 2) return;

    // Les copies ne doivent exister que pour l'œil : elles sortent de l'arbre
    // d'accessibilité et de l'ordre de tabulation, sinon les liens LinkedIn
    // seraient annoncés trois fois chacun.
    function copier(carte) {
        var copie = carte.cloneNode(true);
        copie.setAttribute('aria-hidden', 'true');
        copie.setAttribute('inert', '');
        return copie;
    }

    cartes.map(copier).forEach(function (copie) { piste.appendChild(copie); });
    cartes.map(copier).reverse().forEach(function (copie) { piste.insertBefore(copie, piste.firstChild); });

    // Le semis des cartes est un dessin en pixels, refait par page-effects.js
    // à chaque changement de largeur — mais seulement sur les cartes qui
    // existaient au chargement. Les copies, nées après lui, gardent sinon le
    // dessin de la largeur d avant. On leur recopie celui de leur modèle.
    var minuteurSemis;
    window.addEventListener('resize', function () {
        clearTimeout(minuteurSemis);
        // Après page-effects.js, qui attend 100 ms : on recopie du redessiné.
        minuteurSemis = setTimeout(function () {
            Array.prototype.slice.call(piste.children).forEach(function (carte, i) {
                var modele = cartes[i % n].querySelector('.fond-bloc-semis');
                var semis = carte.querySelector('.fond-bloc-semis');
                if (modele && semis && semis !== modele) semis.innerHTML = modele.innerHTML;
            });
        }, 180);
    });

    var index = n;  // première carte du jeu original
    var anime = true;

    function pas() {
        var style = getComputedStyle(piste);
        var ecart = parseFloat(style.columnGap || style.gap) || 0;
        return piste.children[0].getBoundingClientRect().width + ecart;
    }

    function poser(avecTransition) {
        piste.style.transition = avecTransition && anime ? '' : 'none';
        piste.style.transform = 'translateX(' + (-index * pas()) + 'px)';
        if (!(avecTransition && anime)) {
            // Forcer le recalcul avant de rendre la transition : sinon le
            // navigateur regroupe les deux changements et anime le bond.
            void piste.offsetWidth;
            piste.style.transition = '';
        }
    }

    function aller(sens) {
        index += sens;
        poser(true);
        if (!anime) recadrer();
    }

    // Revenir dans le jeu du milieu une fois l'animation terminée.
    function recadrer() {
        if (index >= 2 * n) { index -= n; poser(false); }
        else if (index < n) { index += n; poser(false); }
    }

    piste.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'transform') recadrer();
    });

    var prec = document.querySelector('[data-avis-prec]');
    var suiv = document.querySelector('[data-avis-suiv]');
    if (prec) prec.addEventListener('click', function () { aller(-1); });
    if (suiv) suiv.addEventListener('click', function () { aller(1); });

    // Les flèches du clavier, quand le cadre a le focus.
    cadre.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); aller(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); aller(1); }
    });

    // Balayage tactile. On ne décide qu'au relâchement, et seulement si le
    // geste est franchement horizontal : sinon un scroll vertical un peu de
    // travers ferait défiler les cartes au passage. Aucun preventDefault, le
    // défilement de la page reste donc toujours possible.
    var departX = 0, departY = 0, suit = false;

    cadre.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) { suit = false; return; }
        departX = e.touches[0].clientX;
        departY = e.touches[0].clientY;
        suit = true;
    }, { passive: true });

    cadre.addEventListener('touchend', function (e) {
        if (!suit) return;
        suit = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - departX;
        var dy = t.clientY - departY;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        aller(dx < 0 ? 1 : -1);
    }, { passive: true });

    cadre.addEventListener('touchcancel', function () { suit = false; }, { passive: true });

    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
    function suivreReglage() {
        anime = !reduit.matches;
        piste.classList.toggle('sans-animation', !anime);
    }
    suivreReglage();
    if (reduit.addEventListener) reduit.addEventListener('change', suivreReglage);

    // La largeur d'une carte suit celle du cadre : au redimensionnement, le
    // décalage en pixels n'est plus le bon.
    var minuteur;
    window.addEventListener('resize', function () {
        clearTimeout(minuteur);
        minuteur = setTimeout(function () { poser(false); }, 120);
    });

    poser(false);
})();
