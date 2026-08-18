// Les trois outils du bas de page : thème, langue, contact (le contact est un
// simple lien mailto, il n'a besoin de rien ici).
//
// La page n'a pas de navbar, donc pas de scripts/navbar.js : le bouton de
// thème reprend ici la même mécanique — même attribut data-theme, même clé
// site-theme, même balayage circulaire — pour que le réglage reste partagé
// avec le reste du site.
(function () {
    var racine = document.documentElement;

    var theme = document.querySelector('[data-fond-theme]');
    if (theme) {
        theme.addEventListener('click', function () {
            function appliquer() {
                var sombre = racine.getAttribute('data-theme') === 'dark';
                if (sombre) racine.removeAttribute('data-theme');
                else racine.setAttribute('data-theme', 'dark');
                try { localStorage.setItem('site-theme', sombre ? 'light' : 'dark'); } catch (e) {}
            }

            var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!document.startViewTransition || reduit) { appliquer(); return; }

            // Le cercle s'ouvre depuis le bouton jusqu'au coin le plus
            // éloigné, sinon il ne couvre pas toute la page. Valeurs en pixels
            // calculées ici : Safari ne résout pas les variables CSS de :root
            // à l'intérieur des pseudo-éléments ::view-transition.
            var r = theme.getBoundingClientRect();
            var x = r.left + r.width / 2;
            var y = r.top + r.height / 2;
            var rayon = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            document.startViewTransition(appliquer).ready.then(function () {
                racine.animate(
                    { clipPath: [
                        'circle(0px at ' + x + 'px ' + y + 'px)',
                        'circle(' + rayon + 'px at ' + x + 'px ' + y + 'px)'
                    ] },
                    {
                        duration: 500,
                        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            }).catch(function () {});
        });
    }

    // Langue. Le glissement FR/EN est entièrement dans shared.css : ce code ne
    // fait que poser les deux classes dont il dépend. is-en dit quelle langue
    // est en cours ; hover-locked fige le rail après un clic, sinon il
    // repartirait aussitôt vers l'autre langue puisque le curseur est encore
    // sur le bouton.
    //
    // Attention : cette page d'essai n'a pas encore de version anglaise. Le
    // bouton tient l'état partagé du site et rien de plus.
    var langue = document.querySelector('[data-fond-lang]');
    if (langue) {
        var courante = function () {
            if (window.GumiI18n) return window.GumiI18n.get();
            try { return localStorage.getItem('site-lang') === 'en' ? 'en' : 'fr'; } catch (e) { return 'fr'; }
        };

        var afficher = function () {
            var lang = courante();
            langue.classList.toggle('is-en', lang === 'en');
            langue.setAttribute('aria-label', lang === 'fr' ? 'Passer en anglais' : 'Passer en français');
        };

        afficher();

        langue.addEventListener('click', function () {
            langue.classList.add('hover-locked');
            if (window.GumiI18n) {
                window.GumiI18n.toggle();
            } else {
                var suivante = courante() === 'fr' ? 'en' : 'fr';
                try { localStorage.setItem('site-lang', suivante); } catch (e) {}
                racine.lang = suivante;
            }
            afficher();
        });

        // Le changement peut venir d ailleurs que du bouton (l URL /en/, un
        // autre onglet) : on suit l evenement du site plutot que le seul clic.
        document.addEventListener('gumi:lang', afficher);

        langue.addEventListener('mouseleave', function () {
            langue.classList.remove('hover-locked');
        });
    }
})();
