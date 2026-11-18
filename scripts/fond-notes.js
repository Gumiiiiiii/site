// Les notes manuscrites posées sur les recommandations.
(function () {
    // Les lettres de Cedarville s'attachent les unes aux autres.
    var INCLINAISON = 0.9;   // degrés, de part et d'autre
    var HAUTEUR = 0.35;      // pixels, de part et d'autre

    // Un bruit reproductible : même lettre, même place, même tirage.
    function tirage(graine) {
        var x = Math.sin(graine * 12.9898) * 43758.5453;
        return x - Math.floor(x);
    }

    function ecrire(note) {
        var texte = note.getAttribute('data-note-texte');
        if (texte === null) {
            texte = note.textContent;
            note.setAttribute('data-note-texte', texte);
        }

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < texte.length; i++) {
            var lettre = texte[i];
            if (lettre === ' ') {
                fragment.appendChild(document.createTextNode(' '));
                continue;
            }

            var graine = texte.charCodeAt(i) + i * 7.13;
            var angle = (tirage(graine) - 0.5) * 2 * INCLINAISON;
            var haut = (tirage(graine + 1.7) - 0.5) * 2 * HAUTEUR;

            var span = document.createElement('span');
            span.textContent = lettre;
            span.style.display = 'inline-block';
            span.style.transform = 'rotate(' + angle.toFixed(2) + 'deg) translateY(' + haut.toFixed(2) + 'px)';
            fragment.appendChild(span);
        }

        note.textContent = '';
        note.appendChild(fragment);
    }

    Array.prototype.forEach.call(document.querySelectorAll('.fond-note-texte'), ecrire);

    // La plume : une note s'écrit sous les yeux, au moment où on l'atteint.
    function preparer() {
        if (!document.documentElement.classList.contains('fond-anime')) return;
        if (!window.IntersectionObserver) return;

        // Un seul stylo : il n'écrit qu'une chose à la fois.
        var ENTREE_CARTE = 450;    // ms : on n'annote pas une carte qui n'est pas posée
        var PAR_LETTRE = 55;       // ms
        var MOTS_MIN = 450;        // ms
        var VITESSE_TRAIT = 0.4;   // px par ms
        var TRAIT_MIN = 110;       // ms
        var LEVER = 110;           // ms : le stylo se lève entre deux traits
        var ENTRE_NOTES = 300;     // ms
        var RANGEE = 60;           // px : deux notes plus proches sont sur la même rangée
        var file = [];
        var enCours = false;

        // Pose sur chaque geste de la note son retard et sa durée, et rend le moment où le stylo a fini.
        function planifier(note, depart) {
            var t = depart;

            function mots() {
                var texte = note.querySelector('.fond-note-texte');
                var duree = Math.max(MOTS_MIN, texte.textContent.length * PAR_LETTRE);
                texte.style.setProperty('--mots-retard', t + 'ms');
                texte.style.setProperty('--mots-duree', duree + 'ms');
                t += duree + LEVER;
            }

            function traits() {
                Array.prototype.forEach.call(note.querySelectorAll('.fond-note-trait path'), function (trait) {
                    // Un trait que la feuille de style cache n'a rien à dessiner.
                    var repere = trait.getScreenCTM();
                    if (!repere) return;
                    var longueur = trait.getTotalLength() * Math.hypot(repere.a, repere.b);
                    var duree = Math.max(TRAIT_MIN, Math.round(longueur / VITESSE_TRAIT));
                    trait.style.setProperty('--trait-retard', t + 'ms');
                    trait.style.setProperty('--trait-duree', duree + 'ms');
                    t += duree + LEVER;
                });
            }

            // On écrit dans le sens de la lecture : l'étoile vient avant son mot.
            if (note.hasAttribute('data-trait-avant')) {
                traits();
                mots();
            } else {
                mots();
                traits();
            }
            return t - LEVER;
        }

        function ordre(a, b) {
            var ra = a.getBoundingClientRect();
            var rb = b.getBoundingClientRect();
            // Une distance plutôt que des cases fixes : selon le défilement.
            return Math.abs(ra.top - rb.top) < RANGEE ? ra.left - rb.left : ra.top - rb.top;
        }

        function suivante(premiere) {
            if (!file.length) {
                enCours = false;
                return;
            }
            enCours = true;
            file.sort(ordre);
            var note = file.shift();
            var fin = planifier(note, premiere ? ENTREE_CARTE : 0);
            note.setAttribute('data-plume', 'ecrit');
            setTimeout(suivante, fin + ENTRE_NOTES, false);
        }

        var observateur = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (entree) {
                if (!entree.isIntersecting) return;
                file.push(entree.target);
                observateur.unobserve(entree.target);
            });
            if (!enCours) suivante(true);
        }, { threshold: 0.2 });

        Array.prototype.forEach.call(document.querySelectorAll('.fond-note'), function (note) {
            Array.prototype.forEach.call(note.querySelectorAll('.fond-note-trait path'), function (trait) {
                trait.setAttribute('pathLength', '1');
            });
            note.setAttribute('data-plume', 'attente');
            observateur.observe(note);
        });
    }

    preparer();

    // Le dictionnaire réécrit le texte de la note : il faut la recomposer.
    document.addEventListener('gumi:lang', function () {
        var notes = document.querySelectorAll('.fond-note-texte');
        Array.prototype.forEach.call(notes, function (note) {
            note.removeAttribute('data-note-texte');
            ecrire(note);
        });
    });
})();
