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

    // Sections of the CV page, in reading order. The ids are shared by both
    // languages: the same file serves /cv and /en/cv.
    const CV_SECTIONS = [
        ['realisations', 'cv_nav_work', 'Réalisations'],
        ['parcours', 'cv_nav_career', 'Parcours'],
        ['competences', 'cv_nav_skills', 'Compétences'],
        ['temoignages', 'cv_nav_quotes', 'Témoignages']
    ];

    const cvLinks = (cls) => CV_SECTIONS
        .map(([id, key, label]) => `<a class="${cls}" href="#${id}" data-i18n="${key}">${label}</a>`)
        .join('');

    const cvNavbarMarkup = `
        <div class="nav-group nav-group--logo">
            <a href="${homeHref()}" class="nav-logo no-select">
                <img src="${basePrefix}media/Gumi-small.png" alt="Gumi" onerror="this.src='https://placehold.co/56x56/transparent/9C77F5?text=G.'">
            </a>
        </div>
        <span class="nav-sep" aria-hidden="true"></span>
        <div class="nav-group nav-group--cv-links">${cvLinks('cv-nav-link')}</div>
        <button type="button" class="cv-nav-sections" aria-expanded="false" aria-controls="cv-sections-menu" data-i18n="cv_nav_sections">Sections</button>
        <span class="nav-sep" aria-hidden="true"></span>
        <div class="nav-group nav-group--controls">
            <a href="#contact" class="cv-nav-cta" data-i18n="cv_cta_write">Me contacter</a>
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
        <div class="cv-sections-menu" id="cv-sections-menu" hidden>${cvLinks('cv-menu-link')}<a class="cv-menu-link" href="#contact" data-i18n="cv_cta_write">Me contacter</a></div>
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


    // --- CV variant behaviour --------------------------------------------
    // Anchor scrolling that clears the fixed bar, a light scrollspy, and the
    // mobile Sections popover.
    function setupCvNav(root) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const menu = root.querySelector('#cv-sections-menu');
        const toggle = root.querySelector('.cv-nav-sections');

        function barHeight() {
            return root.getBoundingClientRect().height + 12;
        }

        function goTo(id) {
            const target = document.getElementById(id);
            if (!target) return;
            const y = target.getBoundingClientRect().top + window.scrollY - barHeight();
            if (window.gumiLenis && !reduced.matches) {
                window.gumiLenis.scrollTo(y);
            } else {
                window.scrollTo({ top: y, behavior: reduced.matches ? 'auto' : 'smooth' });
            }
            history.replaceState(null, '', '#' + id);
        }

        root.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu(false);
                goTo(link.getAttribute('href').slice(1));
            });
        });

        // --- Sections popover
        function openMenu() {
            if (!menu) return;
            menu.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            const first = menu.querySelector('a');
            if (first) first.focus();
        }
        function closeMenu(refocus) {
            if (!menu || menu.hidden) return;
            menu.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            if (refocus) toggle.focus();
        }
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                if (menu.hidden) openMenu(); else closeMenu(true);
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMenu(true);
            });
            document.addEventListener('click', (e) => {
                if (!menu.hidden && !menu.contains(e.target) && e.target !== toggle) closeMenu(false);
            });
        }

        // --- scrollspy: colour plus a second cue, never colour alone
        const links = [...root.querySelectorAll('.cv-nav-link')];
        const watched = links
            .map((l) => document.getElementById(l.getAttribute('href').slice(1)))
            .filter(Boolean);
        if (!watched.length || !('IntersectionObserver' in window)) return;

        const seen = new Map();
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => seen.set(entry.target.id, entry.intersectionRatio));
            let best = null, bestRatio = 0;
            seen.forEach((ratio, id) => { if (ratio > bestRatio) { bestRatio = ratio; best = id; } });
            links.forEach((l) => {
                const on = best && l.getAttribute('href') === '#' + best;
                l.classList.toggle('active', !!on);
                if (on) l.setAttribute('aria-current', 'true');
                else l.removeAttribute('aria-current');
            });
        }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] });
        watched.forEach((el) => spy.observe(el));
    }

    document.querySelectorAll('[data-navbar-root]').forEach((root) => {
        const isCv = root.getAttribute('data-navbar-variant') === 'cv';
        root.innerHTML = isCv ? cvNavbarMarkup : navbarMarkup;
        if (isCv) root.classList.add('navbar--cv', 'visible');

        if (!isCv) {
            root.querySelectorAll('a:not(.nav-logo)').forEach((link) => {
                if (normalizeRoute(link.getAttribute('href') || '') === currentPage) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        } else {
            setupCvNav(root);
        }

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
                // Driven from JS with explicit pixel values: Safari does not
                // resolve :root inline custom properties inside the
                // ::view-transition pseudos, which made the circle open from
                // the top-left corner on iOS when this went through CSS vars.
                const rect = themeBtn.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                const endRadius = Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y)
                );
                const docEl = document.documentElement;
                // Freeze component transitions for the duration of the wipe so
                // the neumorphic highlights snap straight to their dark values
                // instead of animating light->dark inside the revealed area.
                docEl.classList.add('theme-switching');
                const transition = document.startViewTransition(applyTheme);
                transition.ready.then(() => {
                    docEl.animate(
                        { clipPath: [
                            'circle(0px at ' + x + 'px ' + y + 'px)',
                            'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'
                        ] },
                        {
                            duration: 500,
                            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                            pseudoElement: '::view-transition-new(root)'
                        }
                    );
                }).catch(() => {});
                transition.finished.finally(() => docEl.classList.remove('theme-switching'));
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
        navbars.forEach((nav) => {
            // The CV bar is anchored to the top and always on: it is that
            // page's only sticky surface and its anchors must stay reachable.
            if (nav.getAttribute('data-navbar-variant') === 'cv') return;
            nav.classList.toggle('visible', visible);
        });
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
