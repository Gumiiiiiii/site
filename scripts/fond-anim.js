// Les apparitions.
//
// Rien n'est caché tant que ce fichier ne s'exécute pas : c'est le script en
// tête de document qui pose .fond-anime sur <html>, et il ne la pose ni sans
// JavaScript, ni quand on demande moins de mouvement. Ici, on ne fait que
// retirer aux éléments ce retard, au moment où leur tour vient.
//
// Deux temps : ce que le premier écran contient entre de lui-même au
// chargement ; tout le reste attend d'être atteint.
(function () {
    var racine = document.documentElement;
    if (!racine.classList.contains('fond-anime')) return;

    var PAS = 70;              // ms entre deux voisins qui entrent ensemble
    var RANG_MAX = 6;          // au-delà, le dernier attendrait trop
    var DEBUT_LETTRES = 240;   // la phrase part après la photo
    var BALAYAGE = 900;        // le temps que met la phrase à s'écrire

    function reveler(element, retard) {
        element.style.setProperty('--anim-retard', (retard || 0) + 'ms');
        element.setAttribute('data-anim', 'vu');
    }

    // ---------- La phrase du hero, lettre à lettre ----------

    var phrase = document.querySelector('.fond-hero-phrase');

    // Chaque caractère prend un span, sauf les espaces : un espace enfermé
    // dans un span ne casse plus la ligne, et la phrase déborderait de sa
    // colonne. Les spans restent en display: inline — voir fond.css.
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
        var lettres = decouper(phrase);

        // La phrase elle-même apparaît d'un coup et sans transition : si elle
        // se dévoilait aussi, son propre fondu se multiplierait à celui des
        // lettres et on ne verrait plus qu'un bloc qui s'éclaircit.
        phrase.style.transition = 'none';
        reveler(phrase, 0);

        // Le balayage dure le même temps quelle que soit la longueur du
        // texte : une traduction plus longue ne doit pas ralentir l'entrée.
        var pas = lettres.length ? balayage / lettres.length : 0;
        lettres.forEach(function (lettre, i) {
            reveler(lettre, Math.round(debut + i * pas));
        });
    }

    // Changer de langue réécrit la phrase entière (data-i18n-html) : les
    // lettres disparaissent avec elle, on les retaille aussitôt. Le balayage
    // est plus court — ce n'est plus une entrée, c'est une correction.
    document.addEventListener('gumi:lang', function () {
        if (phrase) ecrire(0, 350);
    });

    // ---------- Le premier écran ----------

    var photo = document.querySelector('.fond-hero-photo');
    var chiffres = Array.prototype.slice.call(
        document.querySelectorAll('.fond-hero-chiffres .fond-kpi')
    );

    function entrer() {
        if (photo) reveler(photo, 60);
        ecrire(DEBUT_LETTRES, BALAYAGE);
        // Les chiffres ferment la marche, une fois la phrase lancée.
        chiffres.forEach(function (kpi, i) { reveler(kpi, 620 + i * 90); });
    }

    // ---------- Le reste, au fil du défilement ----------

    var GROUPES = [
        '.fond-titre',
        '.fond-projets > .fond-projet',
        '.fond-parcours > .fond-parcours-groupe',
        '.fond-competences-intro',
        '.fond-champs > .fond-champ',
        '.fond-boite-intro',
        '.fond-boite > .fond-boite-rang',
        '.fond-avis-fleches',
        '.fond-avis-cadre',
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

    // La rangée de points assombrie appartient à son titre : elle entre avec
    // lui, sinon elle se dessinerait sur du vide. Même ordre des deux côtés,
    // c'est fond-titre.js qui les apparie ainsi.
    var titres = Array.prototype.slice.call(document.querySelectorAll('.fond-titre'));
    var lignes = Array.prototype.slice.call(document.querySelectorAll('.fond-ligne'));

    function reveletout() {
        suivis.concat(lignes).forEach(function (element) { reveler(element, 0); });
    }

    function observer() {
        if (!window.IntersectionObserver) { reveletout(); return; }

        var observateur = new IntersectionObserver(function (entrees) {
            var arrivees = entrees.filter(function (entree) { return entree.isIntersecting; });
            // Ceux qui entrent dans le même souffle se suivent de haut en
            // bas ; celui qui entre seul n'attend personne.
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

    // Deux trames d'attente : la première laisse le navigateur poser l'état
    // de départ, sans quoi il passerait directement à l'arrivée et il n'y
    // aurait aucune transition à voir.
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            entrer();
            observer();
        });
    });
})();
