(function () {
    const translations = {
        fr: {
            home: 'Accueil',
            experiments: 'Expériences',
            brand: 'Brand Guidelines',
            tools: 'Outils'
        },
        en: {
            home: 'Home',
            experiments: 'Experiments',
            brand: 'Brand Guidelines',
            tools: 'Tools'
        }
    };

    const inToolsFolder = window.location.pathname.includes('/tools/');
    const basePrefix = inToolsFolder ? '../' : '';

    const navbarMarkup = `
        <div class="nav-logo">
            <a href="${basePrefix}index.html" class="no-select">
                <img src="${basePrefix}Gumi-Logotype.png" alt="Gumi Logo" onerror="this.src='https://placehold.co/100x35/transparent/9C77F5?text=GUMI.'">
            </a>
        </div>
        <div class="nav-actions">
            <div class="nav-links">
                <a href="${basePrefix}experiments.html" data-i18n-key="experiments">Expériences</a>
                <a href="${basePrefix}brand-guidelines.html" data-i18n-key="brand">Brand Guidelines</a>
                <a href="${basePrefix}outils.html" data-i18n-key="tools">Outils</a>
            </div>
            <div class="lang-switch" role="group" aria-label="Language switcher">
                <button type="button" class="lang-btn active" data-lang="fr">FR</button>
                <button type="button" class="lang-btn" data-lang="en">EN</button>
            </div>
        </div>
    `;

    const currentPage = window.location.pathname.split('/').pop() || 'brand-guidelines.html';
    const savedLang = localStorage.getItem('site-lang') || 'fr';

    function applyLanguage(root, language) {
        const langMap = translations[language] || translations.fr;
        root.querySelectorAll('[data-i18n-key]').forEach((element) => {
            const key = element.getAttribute('data-i18n-key');
            if (langMap[key]) {
                element.textContent = langMap[key];
            }
        });

        root.querySelectorAll('.lang-btn').forEach((button) => {
            const isActive = button.getAttribute('data-lang') === language;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        document.documentElement.lang = language;
    }

    document.querySelectorAll('[data-navbar-root]').forEach((root) => {
        root.innerHTML = navbarMarkup;

        root.querySelectorAll('.nav-links a').forEach((link) => {
            const linkPage = (link.getAttribute('href') || '').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        applyLanguage(root, savedLang);

        root.querySelectorAll('.lang-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const nextLang = button.getAttribute('data-lang');
                localStorage.setItem('site-lang', nextLang);
                applyLanguage(root, nextLang);
            });
        });
    });
})();
