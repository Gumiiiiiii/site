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
        <div class="nav-group nav-group--logo">
            <a href="${homeHref()}" class="nav-logo no-select">
                <img src="${basePrefix}media/Gumi-small.png" alt="Gumi" onerror="this.src='https://placehold.co/56x56/transparent/9C77F5?text=G.'">
            </a>
        </div>
        <span class="nav-sep" aria-hidden="true"></span>
        <div class="nav-group nav-group--links">
            <a href="${basePrefix}experiments" data-i18n="nav_experiments">Expérimentations</a>
            <a href="${basePrefix}outils" data-i18n="nav_tools">Outils</a>
        </div>
        <span class="nav-sep" aria-hidden="true"></span>
        <div class="nav-group nav-group--controls">
        <button type="button" class="lang-btn no-select" data-lang-toggle data-i18n-title="nav_lang_title" title="Changer la langue">
            <span class="lang-window">
                <span class="lang-slider">
                    <span>FR</span>
                    <span>EN</span>
                </span>
            </span>
        </button>
        <button type="button" class="theme-btn no-select" data-theme-toggle data-i18n-title="nav_theme_title" title="Changer le thème" aria-label="Changer le thème">
            <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
                <mask id="theme-toggle-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>
                    <circle class="theme-toggle-cutout" cx="24" cy="10" r="6" fill="black"></circle>
                </mask>
                <circle class="theme-toggle-core" cx="12" cy="12" r="6" fill="currentColor" mask="url(#theme-toggle-mask)"></circle>
                <g class="theme-toggle-rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <line x1="12" y1="3" x2="12" y2="1"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="12" y1="3" x2="12" y2="1" transform="rotate(45 12 12)"></line>
                    <line x1="21" y1="12" x2="23" y2="12" transform="rotate(45 12 12)"></line>
                    <line x1="12" y1="21" x2="12" y2="23" transform="rotate(45 12 12)"></line>
                    <line x1="1" y1="12" x2="3" y2="12" transform="rotate(45 12 12)"></line>
                </g>
            </svg>
        </button>
        </div>
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

        const themeBtn = root.querySelector('[data-theme-toggle]');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const applyTheme = () => {
                    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                    if (isDark) {
                        document.documentElement.removeAttribute('data-theme');
                    } else {
                        document.documentElement.setAttribute('data-theme', 'dark');
                    }
                    try { localStorage.setItem('site-theme', isDark ? 'light' : 'dark'); } catch (e) {}
                };

                const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (!document.startViewTransition || prefersReduced) {
                    applyTheme();
                    return;
                }

                // Circular wipe growing out from the toggle (low-centre of the
                // viewport) to the farthest corner, so it always fills the page.
                const rect = themeBtn.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                const endRadius = Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y)
                );
                const docEl = document.documentElement;
                docEl.style.setProperty('--wipe-x', x + 'px');
                docEl.style.setProperty('--wipe-y', y + 'px');
                docEl.style.setProperty('--wipe-r', endRadius + 'px');
                document.startViewTransition(applyTheme);
            });
        }
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
        // Mirrored on <body> so CSS-only companions (mobile progressive
        // blur behind the navbar) can follow the same visibility.
        document.body.classList.toggle('nav-visible', visible);
    }

    window.addEventListener('scroll', updateNavbarVisibility, { passive: true });
    window.addEventListener('resize', updateNavbarVisibility);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNavbarVisibility);
    } else {
        updateNavbarVisibility();
    }
})();
