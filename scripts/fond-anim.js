// Les apparitions.
(function () {
    var racine = document.documentElement;
    if (!racine.classList.contains('fond-anime')) return;

    var PAS = 70;              // ms entre deux voisins qui entrent ensemble
    var RANG_MAX = 6;          // au-delà, le dernier attendrait trop
    var DEBUT_LETTRES = 240;   // la phrase part après la photo
    var BALAYAGE = 1100;       // le temps que met la vague à traverser la phrase

    function reveler(element, retard) {
        element.style.setProperty('--anim-retard', (retard || 0) + 'ms');
        element.setAttribute('data-anim', 'vu');
    }

    // ---------- La phrase du hero, lettre à lettre ----------

    var phrase = document.querySelector('.fond-hero-phrase');

    // Chaque caractère prend un span, sauf les espaces.
    function decouper(bloc) {
        var promeneur = document.createTreeWalker(bloc, NodeFilter.SHOW_TEXT, null);
        var textes = [];
        while (promeneur.nextNode()) textes.push(promeneur.currentNode);

        var lettres = [];
        textes.forEach(function (noeud) {
            var morceau = document.createDocumentFragment();
            noeud.nodeValue.split('').forEach(function (caractere) {
                if (caractere === ' ' || caractere === '\n' || caractere === '\t') {
                    morceau.appendChild(document.createTextNode(caractere));
                    return;
                }
                var span = document.createElement('span');
                span.className = 'fond-lettre';
                span.textContent = caractere;
                morceau.appendChild(span);
                lettres.push(span);
            });
            noeud.parentNode.replaceChild(morceau, noeud);
        });
        return lettres;
    }

    function ecrire(debut, balayage) {
        if (!phrase) return;
        // Découper une phrase déjà découpée emboîterait chaque lettre dans la précédente.
        var faites = phrase.querySelectorAll('.fond-lettre');
        var lettres = faites.length ? Array.prototype.slice.call(faites) : decouper(phrase);

        // La phrase elle-même apparaît d'un coup, sans transition.
        phrase.style.transition = 'none';
        reveler(phrase, 0);

        // Sans cette lecture, aucune lettre ne se dégraderait.
        void phrase.offsetWidth;

        // Le balayage dure le même temps quelle que soit la longueur du texte.
        var pas = lettres.length ? balayage / lettres.length : 0;
        lettres.forEach(function (lettre, i) {
            reveler(lettre, Math.round(debut + i * pas));
        });
    }

    // Changer de langue réécrit la phrase entière (data-i18n-html) : les lettres disparaissent avec elle.
    document.addEventListener('gumi:lang', function () {
        // Le dictionnaire annonce aussi la langue au chargement, avant que la page ne soit visible.
        if (parti) ecrire(0, 350);
    });

    // ---------- Le premier écran ----------

    var photo = document.querySelector('.fond-hero-photo');
    var chiffres = Array.prototype.slice.call(
        document.querySelectorAll('.fond-hero-chiffres .fond-kpi')
    );
    // Les trois outils et le rail ferment la marche : ils encadrent la page.
    var champ = document.querySelector('.points-champ');
    var cadre = ['.fond-rail', '.fond-outils']
        .map(function (selecteur) { return document.querySelector(selecteur); })
        .filter(Boolean);

    function entrer() {
        if (champ) reveler(champ, 0);
        if (photo) reveler(photo, 60);
        ecrire(DEBUT_LETTRES, BALAYAGE);
        // Les chiffres ferment la marche, une fois la phrase lancée.
        chiffres.forEach(function (kpi, i) { reveler(kpi, 620 + i * 90); });
        cadre.forEach(function (element, i) { reveler(element, 1000 + i * 90); });
    }

    // ---------- Le reste, au fil du défilement ----------

    var GROUPES = [
        '.fond-titre',
        '.fond-projets > .fond-projet',
        '.fond-chrono',
        '.fond-competences-intro',
        '.fond-champs > .fond-champ',
        '.fond-boite-intro',
        '.fond-boite > .fond-boite-rang',
        '.fond-avis > .fond-avis-carte',
        '.fond-passions > .fond-passion',
        '.fond-contact-intro',
        '.fond-contact > .fond-bloc'
    ];

    var suivis = [];
    GROUPES.forEach(function (selecteur) {
        Array.prototype.slice.call(document.querySelectorAll(selecteur)).forEach(function (element) {
            suivis.push(element);
        });
    });

    // La rangée de points assombrie appartient à son titre : elle entre avec lui.
    var titres = Array.prototype.slice.call(document.querySelectorAll('.fond-titre'));
    var lignes = Array.prototype.slice.call(document.querySelectorAll('.fond-ligne'));

    function reveletout() {
        suivis.concat(lignes).forEach(function (element) { reveler(element, 0); });
    }

    function observer() {
        if (!window.IntersectionObserver) { reveletout(); return; }

        var observateur = new IntersectionObserver(function (entrees) {
            var arrivees = entrees.filter(function (entree) { return entree.isIntersecting; });
            // Ceux qui entrent dans le même souffle se suivent de haut en bas.
            arrivees.sort(function (a, b) {
                return a.boundingClientRect.top - b.boundingClientRect.top;
            });

            arrivees.forEach(function (entree, i) {
                var retard = Math.min(i, RANG_MAX) * PAS;
                reveler(entree.target, retard);
                observateur.unobserve(entree.target);

                var rang = titres.indexOf(entree.target);
                if (rang !== -1 && lignes[rang]) reveler(lignes[rang], retard);
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -6% 0px' });

        suivis.forEach(function (element) { observateur.observe(element); });
    }

    // De quoi vérifier, d'un test, qu'aucune entrée ne reste en chemin.
    window.fondAnim = {
        suivis: suivis,
        lignes: lignes,
        cadre: champ ? cadre.concat([champ]) : cadre
    };

    // Le départ.
    var ATTENTE_MAX = 1200;
    var parti = false;

    function demarrer() {
        if (parti) return;
        parti = true;
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                entrer();
                observer();
            });
        });
    }

    if (document.readyState === 'complete') demarrer();
    else window.addEventListener('load', demarrer);
    setTimeout(demarrer, ATTENTE_MAX);
})();
