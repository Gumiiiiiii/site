// Les trois outils : thème, langue, contact (un simple lien mailto).
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

            // Le cercle s'ouvre depuis le bouton jusqu'au coin le plus éloigné.
            var r = theme.getBoundingClientRect();
            var x = r.left + r.width / 2;
            var y = r.top + r.height / 2;
            var rayon = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );
            var etapes = [
                'circle(0px at ' + x + 'px ' + y + 'px)',
                'circle(' + rayon + 'px at ' + x + 'px ' + y + 'px)'
            ];

            // Sans cette classe, le fondu du navigateur se joue en plus du cercle.
            racine.classList.add('theme-switching');
            var transition = document.startViewTransition(appliquer);
            transition.ready.then(function () {
                racine.animate(
                    { clipPath: etapes },
                    {
                        duration: 700,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            }).catch(function () {});
            transition.finished.finally(function () {
                racine.classList.remove('theme-switching');
            });
        });
    }

    // La langue.
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

        // Le changement peut venir d ailleurs que du bouton (l URL /en/, un autre onglet).
        document.addEventListener('gumi:lang', afficher);

        langue.addEventListener('mouseleave', function () {
            langue.classList.remove('hover-locked');
        });
    }
})();
