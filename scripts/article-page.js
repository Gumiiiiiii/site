// Renders an article from GUMI_ARTICLES into the static article page shell,
// in the current language, and re-renders when the language changes.
// The page declares its slug via window.GUMI_ARTICLE_SLUG.
(function () {
    const articles = window.GUMI_ARTICLES || {};
    const article = articles[window.GUMI_ARTICLE_SLUG];
    if (!article) return;

    const titleEl = document.getElementById('article-title');
    const dateEl = document.getElementById('article-date');
    const coverEl = document.getElementById('article-cover');
    const abstractEl = document.getElementById('article-abstract');
    const postContent = document.getElementById('post-content');
    const tocList = document.getElementById('toc-list');
    const readNextLink = document.getElementById('read-next-link');
    const readNextImg = document.getElementById('read-next-image');
    const readNextTitle = document.getElementById('read-next-title-text');
    const readNextDesc = document.getElementById('read-next-desc');

    let observer = null;

    function currentLang() {
        return window.GumiI18n ? window.GumiI18n.get() : 'fr';
    }

    function scrollToHeading(heading, id) {
        if (window.gumiLenis) {
            window.gumiLenis.scrollTo('#' + id, { offset: -40 });
        } else {
            heading.scrollIntoView({ behavior: 'smooth' });
        }
        window.history.pushState(null, null, '#' + id);
        document.getElementById('tocDropdown').classList.remove('open');
        document.getElementById('tocToggle').classList.remove('open');
    }

    function buildToc() {
        tocList.innerHTML = '';
        if (observer) observer.disconnect();

        const headings = postContent.querySelectorAll('h2, h3');

        headings.forEach((heading, index) => {
            const id = 'heading-' + index;
            heading.setAttribute('id', id);

            const li = document.createElement('li');
            li.className = 'toc-item depth-' + heading.tagName.toLowerCase();

            const a = document.createElement('a');
            a.setAttribute('href', '#' + id);
            a.textContent = heading.textContent;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToHeading(heading, id);
            });

            li.appendChild(a);
            tocList.appendChild(li);
        });

        let currentActiveId = null;
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    if (id !== currentActiveId) {
                        currentActiveId = id;
                        document.querySelectorAll('.toc-item').forEach((item) => item.classList.remove('active'));
                        const activeLink = document.querySelector('.toc-item a[href="#' + id + '"]');
                        if (activeLink) activeLink.parentElement.classList.add('active');
                    }
                }
            });
        }, { root: null, rootMargin: '0px 0px -80% 0px', threshold: 0 });

        headings.forEach((heading) => observer.observe(heading));
    }

    function render() {
        const lang = currentLang();

        document.title = article.title[lang] + ' | Gumi.';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && article.excerpt && article.excerpt[lang]) {
            metaDesc.setAttribute('content', article.excerpt[lang]);
        }
        titleEl.textContent = article.title[lang];
        // Keep the brand accent dot at the end of the title.
        const titleDot = document.createElement('span');
        titleDot.className = 'dot';
        titleDot.textContent = '.';
        titleEl.appendChild(titleDot);

        if (dateEl && article.published) {
            const date = new Date(article.published + 'T00:00:00');
            const label = window.GumiI18n ? window.GumiI18n.t('published_on') : 'Publié le';
            dateEl.textContent = label + ' ' + date.toLocaleDateString(
                lang === 'fr' ? 'fr-FR' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
            );
        }

        // Optional: an abstract rendered above the cover rather than inside
        // the body. Articles without one leave the container empty.
        if (abstractEl) {
            const abstract = article.abstract && article.abstract[lang];
            abstractEl.innerHTML = abstract || '';
            abstractEl.hidden = !abstract;
        }

        if (coverEl.getAttribute('src') !== article.cover) coverEl.src = article.cover;
        coverEl.alt = article.coverAlt || article.title[lang];
        postContent.innerHTML = article.html[lang];

        // Wide tables scroll inside their own container on small screens.
        postContent.querySelectorAll('table').forEach((table) => {
            const wrap = document.createElement('div');
            wrap.className = 'table-scroll';
            table.parentNode.insertBefore(wrap, table);
            wrap.appendChild(table);
        });

        buildToc();

        const next = articles[article.readNext];
        const readNextSection = readNextLink ? readNextLink.closest('.read-next-section') : null;
        if (next && readNextLink) {
            // Sibling page in /experiments/, so the relative slug is enough
            // (and it keeps a potential /en/ prefix intact).
            readNextLink.href = article.readNext;
            readNextImg.src = next.cover;
            readNextImg.alt = next.coverAlt || next.title[lang];
            readNextTitle.textContent = next.title[lang];
            readNextDesc.textContent = next.excerpt[lang];
        } else if (readNextSection) {
            // No published follow-up article: hide the whole section.
            readNextSection.style.display = 'none';
        }
    }

    document.addEventListener('gumi:lang', render);
    render();

    // Hero title fades out gently before the featured image covers it.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', () => {
            const fadeEnd = window.innerHeight * 0.4;
            const opacity = Math.max(0, Math.min(1, 1 - (window.scrollY / fadeEnd)));
            titleEl.style.opacity = opacity;
            if (dateEl) dateEl.style.opacity = opacity;
        }, { passive: true });
    }

    // TOC accordion toggle.
    const tocToggle = document.getElementById('tocToggle');
    const tocDropdown = document.getElementById('tocDropdown');

    tocToggle.addEventListener('click', () => {
        tocDropdown.classList.toggle('open');
        tocToggle.classList.toggle('open');
    });

    // Copy link with "Copied!" feedback.
    const copyBtn = document.getElementById('copyLinkBtn');
    const copyFeedback = document.getElementById('copy-feedback');
    let copyTimeout = null;

    copyBtn.addEventListener('click', async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(window.location.href);
            } else {
                const inputc = document.body.appendChild(document.createElement('input'));
                inputc.value = window.location.href;
                inputc.focus();
                inputc.select();
                document.execCommand('copy');
                inputc.parentNode.removeChild(inputc);
            }

            copyBtn.style.color = 'var(--accent)';
            copyFeedback.textContent = window.GumiI18n ? window.GumiI18n.t('copy_done') : 'Copié !';
            copyFeedback.classList.add('show');

            clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                copyBtn.style.color = 'var(--text)';
                copyFeedback.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Erreur de copie : ', err);
        }
    });
})();
