(function () {
    // Pages living one level deep (/tools/*, /experiments/*) need relative
    // links prefixed; '../' also keeps a potential /en/ prefix intact.
    const inSubfolder = /\/(tools|experiments)\//.test(window.location.pathname);
    const basePrefix = inSubfolder ? '../' : '';

    function homeHref() {
        if (inSubfolder) return '../';
        const lang = window.GumiI18n ? window.GumiI18n.get() : 'fr';
        return lang === 'en' ? '/en/' : '/';
    }

    const navbarMarkup = `
        <a href="${homeHref()}" class="nav-logo no-select">
            <img src="${basePrefix}media/Gumi-small.png" alt="Gumi" onerror="this.src='https://placehold.co/56x56/transparent/9C77F5?text=G.'">
        </a>
        <a href="${basePrefix}experiments" data-i18n="nav_experiments">Expérimentations</a>
        <a href="${basePrefix}outils" data-i18n="nav_tools">Outils</a>
        <button type="button" class="lang-btn no-select" data-lang-toggle data-i18n-title="nav_lang_title" title="Changer la langue">
            <div class="lang-slider">
                <span>FR</span>
                <span>EN</span>
            </div>
        </button>
    `;

    function normalizeRoute(value) {
        const stripped = String(value || '')
            .split('#')[0]
            .split('?')[0]
            .replace(/\/+$/, '');
        const lastSegment = stripped.split('/').pop() || 'index';
        return lastSegment.replace(/\.html$/i, '') || 'index';
    }

    function currentLang() {
        if (window.GumiI18n) return window.GumiI18n.get();
        return localStorage.getItem('site-lang') === 'en' ? 'en' : 'fr';
    }

    const currentPage = normalizeRoute(window.location.pathname);

    document.querySelectorAll('[data-navbar-root]').forEach((root) => {
        root.innerHTML = navbarMarkup;

        root.querySelectorAll('a:not(.nav-logo)').forEach((link) => {
            if (normalizeRoute(link.getAttribute('href') || '') === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        const langBtn = root.querySelector('[data-lang-toggle]');
        langBtn.classList.toggle('is-en', currentLang() === 'en');

        langBtn.addEventListener('click', () => {
            langBtn.classList.add('hover-locked');
            if (window.GumiI18n) {
                window.GumiI18n.toggle();
            } else {
                const next = currentLang() === 'fr' ? 'en' : 'fr';
                localStorage.setItem('site-lang', next);
            }
            langBtn.classList.toggle('is-en', currentLang() === 'en');
        });

        langBtn.addEventListener('mouseleave', () => {
            langBtn.classList.remove('hover-locked');
        });
    });

    document.addEventListener('gumi:lang', (event) => {
        document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
            btn.classList.toggle('is-en', event.detail.lang === 'en');
        });
        document.querySelectorAll('.nav-logo').forEach((logo) => {
            logo.setAttribute('href', homeHref());
        });
    });

    // Slide the navbar in after a bit of scrolling; keep it visible on pages
    // too short to ever reach that threshold.
    const navbars = document.querySelectorAll('.navbar');

    function updateNavbarVisibility() {
        const shortPage = document.body.scrollHeight <= window.innerHeight + 150;
        const visible = shortPage || window.scrollY > 100;
        navbars.forEach((nav) => nav.classList.toggle('visible', visible));
    }

    window.addEventListener('scroll', updateNavbarVisibility, { passive: true });
    window.addEventListener('resize', updateNavbarVisibility);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNavbarVisibility);
    } else {
        updateNavbarVisibility();
    }
})();
