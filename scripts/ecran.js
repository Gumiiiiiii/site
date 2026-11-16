// Une page, un écran : ce qui ne tient pas se range, il ne pousse pas.
//
// Sur ordinateur, les listes du site ont une hauteur fixée par la fenêtre
// (styles/ecran.css). Ce script mesure ce qu'elle contient réellement :
//
//   · [data-ecran="ajuste"]  : n'affiche que ce qui tient. C'est l'accueil,
//     où un lien « Tout découvrir » mène au reste.
//   · [data-ecran="pages"]   : découpe la liste en pages et pose une
//     pagination dessous, seulement quand il y a plus d'une page.
//
// Sous le seuil, il ne fait rien : la page défile et tout est affiché.
// Ajouter un outil ou un article ne demande donc aucun réglage : la liste
// s'allonge d'une case, puis d'une page.
(function () {
    // Le même seuil que styles/ecran.css et test/layout-test.js.
    var SEUIL = window.matchMedia('(min-width: 1100px) and (min-height: 600px)');
    var HORS = 'ecran-hors-page';

    var listes = Array.prototype.slice.call(document.querySelectorAll('[data-ecran]'))
        .map(function (liste) {
            return { liste: liste, mode: liste.getAttribute('data-ecran'), page: 0, pages: [], pager: null };
        });
    if (!listes.length) return;

    function elements(etat) {
        return Array.prototype.filter.call(etat.liste.children, function (el) {
            return el.getAttribute('data-filtre') !== 'hors';
        });
    }

    // Combien d'éléments, à partir du premier affiché, tiennent en entier
    // dans la liste. Au moins un : une liste ne reste jamais vide.
    function contenance(etat, visibles) {
        var fond = etat.liste.getBoundingClientRect().bottom + 1;
        var n = 0;
        for (var i = 0; i < visibles.length; i++) {
            if (visibles[i].getBoundingClientRect().bottom > fond) break;
            n += 1;
        }
        return Math.max(1, n);
    }

    function decouper(etat, tous) {
        var pages = [];
        var debut = 0;
        while (debut < tous.length) {
            tous.forEach(function (el, i) { el.classList.toggle(HORS, i < debut); });
            var n = contenance(etat, tous.slice(debut));
            pages.push([debut, debut + n]);
            debut += n;
        }
        return pages;
    }

    function icone(points) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="' + points + '"></polyline></svg>';
    }

    function libelle(cle, defaut) {
        var dict = window.GumiI18n && window.GumiI18n.dict;
        var lang = window.GumiI18n ? window.GumiI18n.get() : 'fr';
        return dict && dict[cle] ? dict[cle][lang] : defaut;
    }

    function creerPager(etat) {
        var pager = document.createElement('nav');
        pager.className = 'ecran-pager';
        pager.innerHTML = '<button type="button" data-pas="-1">' + icone('15 18 9 12 15 6') + '</button>'
            + '<span aria-live="polite"></span>'
            + '<button type="button" data-pas="1">' + icone('9 18 15 12 9 6') + '</button>';
        pager.addEventListener('click', function (e) {
            var bouton = e.target.closest('button');
            if (bouton) aller(etat, etat.page + Number(bouton.getAttribute('data-pas')));
        });
        etat.liste.insertAdjacentElement('afterend', pager);
        return pager;
    }

    function montrer(etat, tous) {
        var page = etat.pages[etat.page] || [0, tous.length];
        tous.forEach(function (el, i) { el.classList.toggle(HORS, i < page[0] || i >= page[1]); });
        if (!etat.pager) return;
        var plusieurs = etat.pages.length > 1;
        if (plusieurs) etat.pager.setAttribute('data-actif', '');
        else etat.pager.removeAttribute('data-actif');
        var boutons = etat.pager.querySelectorAll('button');
        boutons[0].disabled = etat.page === 0;
        boutons[1].disabled = etat.page >= etat.pages.length - 1;
        boutons[0].setAttribute('aria-label', libelle('pager_prev', 'Page précédente'));
        boutons[1].setAttribute('aria-label', libelle('pager_next', 'Page suivante'));
        etat.pager.querySelector('span').textContent = (etat.page + 1) + ' / ' + etat.pages.length;
    }

    function aller(etat, page) {
        if (page < 0 || page >= etat.pages.length || page === etat.page) return;
        etat.page = page;
        montrer(etat, elements(etat));
    }

    function ajuster(etat, garderPage) {
        var tous = Array.prototype.slice.call(etat.liste.children);
        tous.forEach(function (el) { el.classList.remove(HORS); });

        if (!SEUIL.matches) {
            if (etat.pager) etat.pager.removeAttribute('data-actif');
            return;
        }

        tous = elements(etat);

        if (etat.mode !== 'pages') {
            var n = contenance(etat, tous);
            tous.forEach(function (el, i) { el.classList.toggle(HORS, i >= n); });
            return;
        }

        if (!etat.pager) etat.pager = creerPager(etat);
        // Première mesure sans la pagination. S'il faut plusieurs pages,
        // elle prend sa place sous la liste, qui perd de la hauteur : on
        // remesure alors avec elle.
        etat.pager.removeAttribute('data-actif');
        etat.pages = decouper(etat, tous);
        if (etat.pages.length > 1) {
            etat.pager.setAttribute('data-actif', '');
            etat.pages = decouper(etat, tous);
        }
        etat.page = garderPage ? Math.min(etat.page, etat.pages.length - 1) : 0;
        montrer(etat, tous);
    }

    function toutAjuster(garderPage) {
        listes.forEach(function (etat) { ajuster(etat, garderPage); });
    }

    var minuterie;
    function replanifier() {
        clearTimeout(minuterie);
        minuterie = setTimeout(function () { toutAjuster(true); }, 80);
    }

    toutAjuster(false);
    window.addEventListener('resize', replanifier);
    window.addEventListener('load', function () { toutAjuster(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { toutAjuster(true); });
    // Un filtre ou une recherche change la liste : on repart de la première
    // page. Un changement de langue change la longueur des titres.
    document.addEventListener('gumi:filtre', function () { toutAjuster(false); });
    document.addEventListener('gumi:lang', function () { toutAjuster(true); });

    // Les flèches et la molette tournent les pages : sur une page qui ne
    // défile pas, c'est le geste qu'on fait d'instinct.
    function paginee() {
        if (!SEUIL.matches) return null;
        return listes.filter(function (etat) { return etat.mode === 'pages' && etat.pages.length > 1; })[0] || null;
    }

    document.addEventListener('keydown', function (e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        var etat = paginee();
        if (!etat) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown') aller(etat, etat.page + 1);
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') aller(etat, etat.page - 1);
    });

    var dernierCran = 0;
    window.addEventListener('wheel', function (e) {
        var etat = paginee();
        if (!etat || Math.abs(e.deltaY) < 20) return;
        var maintenant = Date.now();
        if (maintenant - dernierCran < 450) return;
        dernierCran = maintenant;
        aller(etat, etat.page + (e.deltaY > 0 ? 1 : -1));
    }, { passive: true });
})();
