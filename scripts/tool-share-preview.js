(function () {
    const urlInput = document.getElementById('sp-url');
    if (!urlInput) return;

    const fetchBtn = document.getElementById('sp-fetch-btn');
    const placeholder = document.getElementById('sp-placeholder');
    const tabsBar = document.getElementById('sp-tabs');
    const stage = document.getElementById('sp-stage');
    const auditPanel = document.getElementById('sp-audit');
    const auditList = document.getElementById('sp-audit-list');

    const API_URL = '/api/get-meta';

    let lastData = null;
    let isFetching = false;
    let activeIndex = window.GumiPrefs
        ? Math.min(8, Math.max(0, Number(window.GumiPrefs.get('sp-platform', 0)) || 0))
        : 0;

    function t(key) {
        return window.GumiI18n ? window.GumiI18n.t(key) : key;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function truncate(text, max) {
        const value = String(text || '');
        return value.length > max ? value.slice(0, max - 1).trimEnd() + '…' : value;
    }

    const NO_IMG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5-5 5"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>';

    function imgOr(image, cls) {
        const wrap = cls || 'sp-img';
        if (image) {
            return '<div class="' + wrap + '"><img src="' + escapeHtml(image) + '" alt="" loading="lazy"></div>';
        }
        return '<div class="' + wrap + '"><div class="sp-noimg">' + NO_IMG_ICON + '</div></div>';
    }

    // Each renderer mimics one platform's link card, with that platform's
    // real-world truncation limits applied to the title and description.
    const PLATFORMS = [
        { name: 'X (Twitter)', cls: 'sp-x', render(d) {
            const overlay = '<span class="sp-x-overlay sp-ellipsis">' + escapeHtml(truncate(d.title, 70)) + '</span>';
            const img = d.image
                ? '<div class="sp-img"><img src="' + escapeHtml(d.image) + '" alt="" loading="lazy">' + overlay + '</div>'
                : '<div class="sp-img"><div class="sp-noimg">' + NO_IMG_ICON + '</div>' + overlay + '</div>';
            return img + '<div class="sp-x-from">' + escapeHtml(t('sp_from') + ' ' + d.domain) + '</div>';
        } },
        { name: 'LinkedIn', cls: 'sp-li', render(d) {
            return imgOr(d.image)
                + '<div class="sp-li-body"><div class="sp-li-title sp-clamp2">' + escapeHtml(truncate(d.title, 119)) + '</div>'
                + '<div class="sp-li-domain sp-ellipsis">' + escapeHtml(d.domain) + '</div></div>';
        } },
        { name: 'Facebook', cls: 'sp-fb', render(d) {
            return imgOr(d.image)
                + '<div class="sp-fb-body"><div class="sp-fb-domain sp-ellipsis">' + escapeHtml(d.domain) + '</div>'
                + '<div class="sp-fb-title sp-ellipsis">' + escapeHtml(truncate(d.title, 88)) + '</div>'
                + '<div class="sp-fb-desc sp-ellipsis">' + escapeHtml(d.desc) + '</div></div>';
        } },
        { name: 'WhatsApp', cls: 'sp-wa', render(d) {
            return '<div class="sp-wa-preview">' + imgOr(d.image)
                + '<div class="sp-wa-text"><div class="sp-wa-title sp-clamp2">' + escapeHtml(d.title) + '</div>'
                + '<div class="sp-wa-desc sp-clamp2">' + escapeHtml(d.desc) + '</div>'
                + '<div class="sp-wa-domain sp-ellipsis">' + escapeHtml(d.domain) + '</div></div></div>'
                + '<div class="sp-wa-link">' + escapeHtml(d.url) + '</div>';
        } },
        { name: 'iMessage', cls: 'sp-im', render(d) {
            return imgOr(d.image)
                + '<div class="sp-im-footer"><div class="sp-im-title sp-clamp2">' + escapeHtml(d.title) + '</div>'
                + '<div class="sp-im-domain sp-ellipsis">' + escapeHtml(d.domain) + '</div></div>';
        } },
        { name: 'Instagram (DM)', cls: 'sp-ig', render(d) {
            return imgOr(d.image)
                + '<div class="sp-ig-footer"><div class="sp-ig-title sp-clamp2">' + escapeHtml(d.title) + '</div>'
                + '<div class="sp-ig-domain sp-ellipsis">' + escapeHtml(d.domain) + '</div></div>';
        } },
        { name: 'Reddit', cls: 'sp-rd', render(d) {
            return '<div class="sp-rd-main"><div class="sp-rd-title sp-clamp2">' + escapeHtml(truncate(d.title, 300)) + '</div>'
                + '<div class="sp-rd-domain sp-ellipsis">' + escapeHtml(d.domain) + '</div></div>'
                + (d.image
                    ? '<div class="sp-rd-thumb"><img src="' + escapeHtml(d.image) + '" alt="" loading="lazy"></div>'
                    : '<div class="sp-rd-thumb"><div class="sp-noimg">' + NO_IMG_ICON + '</div></div>');
        } },
        { name: 'Discord', cls: 'sp-dc', render(d) {
            return '<div class="sp-dc-site sp-ellipsis">' + escapeHtml(d.siteName) + '</div>'
                + '<div class="sp-dc-title">' + escapeHtml(truncate(d.title, 256)) + '</div>'
                + (d.desc ? '<div class="sp-dc-desc">' + escapeHtml(truncate(d.desc, 350)) + '</div>' : '')
                + imgOr(d.image);
        } },
        { name: 'Microsoft Teams', cls: 'sp-ms', render(d) {
            return (d.image
                ? '<div class="sp-ms-thumb"><img src="' + escapeHtml(d.image) + '" alt="" loading="lazy"></div>'
                : '<div class="sp-ms-thumb"><div class="sp-noimg">' + NO_IMG_ICON + '</div></div>')
                + '<div class="sp-ms-body"><div class="sp-ms-title sp-clamp2">' + escapeHtml(d.title) + '</div>'
                + '<div class="sp-ms-domain sp-ellipsis">' + escapeHtml(d.domain) + '</div></div>';
        } }
    ];

    // Crawler-like precedence: Open Graph first, then Twitter, then the
    // plain HTML fallbacks.
    function displayData(data) {
        return {
            title: data.og.title || data.twitter.title || data.title || data.domain,
            desc: data.og.description || data.twitter.description || data.description || '',
            image: data.og.image || data.twitter.image || null,
            siteName: data.og.siteName || data.domain,
            domain: data.domain,
            url: data.finalUrl
        };
    }

    // One platform at a time: pills switch the stage between the mockups.
    function buildTabs() {
        if (tabsBar.childElementCount) return;
        PLATFORMS.forEach((p, index) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'sp-tab';
            tab.textContent = p.name;
            tab.addEventListener('click', () => {
                activeIndex = index;
                if (window.GumiPrefs) window.GumiPrefs.set('sp-platform', index);
                syncTabs();
                if (lastData) renderPreview(lastData);
            });
            tabsBar.appendChild(tab);
        });
        syncTabs();
    }

    function syncTabs() {
        Array.from(tabsBar.children).forEach((tab, index) => {
            tab.classList.toggle('active', index === activeIndex);
            tab.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
        });
    }

    function renderPreview(data) {
        const d = displayData(data);
        const p = PLATFORMS[activeIndex];
        stage.innerHTML = '<div class="sp-card ' + p.cls + '">' + p.render(d) + '</div>';
    }

    function auditLines(data) {
        const lines = [];
        const d = displayData(data);

        lines.push(data.og.title ? { level: 'ok', key: 'sp_a_ogtitle_ok' } : { level: 'bad', key: 'sp_a_ogtitle_bad' });
        lines.push(data.og.description ? { level: 'ok', key: 'sp_a_ogdesc_ok' } : { level: 'bad', key: 'sp_a_ogdesc_bad' });
        lines.push(data.og.image ? { level: 'ok', key: 'sp_a_ogimage_ok' } : { level: 'bad', key: 'sp_a_ogimage_bad' });
        lines.push(data.twitter.card ? { level: 'ok', key: 'sp_a_twcard_ok' } : { level: 'warn', key: 'sp_a_twcard_warn' });

        if (d.title.length > 60) lines.push({ level: 'warn', key: 'sp_a_title_long' });
        if (d.desc.length > 200) lines.push({ level: 'warn', key: 'sp_a_desc_long' });

        const dims = data._imageDims;
        if (dims) {
            if (dims.w < 600) {
                lines.push({ level: 'warn', key: 'sp_a_img_small' });
            } else if (Math.abs(dims.w / dims.h - 1.91) > 0.3) {
                lines.push({ level: 'warn', key: 'sp_a_img_ratio' });
            } else {
                lines.push({ level: 'ok', key: 'sp_a_img_ok' });
            }
        }

        return lines;
    }

    function renderAudit(data) {
        auditList.innerHTML = auditLines(data).map((line) =>
            '<li class="sp-audit-' + line.level + '"><span class="sp-audit-dot" aria-hidden="true"></span><span>'
            + escapeHtml(t(line.key)) + '</span></li>'
        ).join('');
        auditPanel.hidden = false;
    }

    // The image's real dimensions only exist client-side; measure once,
    // then refresh the audit with the size/ratio verdict.
    function measureImage(data) {
        const src = data.og.image || data.twitter.image;
        if (!src || data._imageDims) return;
        const probe = new Image();
        probe.onload = function () {
            data._imageDims = { w: probe.naturalWidth, h: probe.naturalHeight };
            if (lastData === data) renderAudit(data);
        };
        probe.src = src;
    }

    function renderAll(data) {
        buildTabs();
        renderPreview(data);
        renderAudit(data);
        placeholder.style.display = 'none';
        tabsBar.hidden = false;
        stage.hidden = false;
    }

    function setLoading(loading) {
        isFetching = loading;
        fetchBtn.disabled = loading;
        fetchBtn.textContent = loading ? t('sp_fetching') : t('sp_fetch');
    }

    function normalizeInput(raw) {
        let value = String(raw || '').trim();
        if (!value) return null;
        if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
        try {
            const parsed = new URL(value);
            return parsed.hostname.includes('.') ? parsed.href : null;
        } catch (err) {
            return null;
        }
    }

    async function run() {
        if (isFetching) return;

        const target = normalizeInput(urlInput.value);
        if (!target) {
            window.showToolToast(t('sp_error_invalid'), true);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_URL + '?url=' + encodeURIComponent(target));
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            lastData = data;
            renderAll(data);
            measureImage(data);
        } catch (err) {
            window.showToolToast(t('sp_error_fetch'), true);
        } finally {
            setLoading(false);
        }
    }

    fetchBtn.addEventListener('click', run);
    urlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') run();
    });

    // Re-render dynamic text (audit lines, "From" label) on language switch.
    document.addEventListener('gumi:lang', () => {
        if (lastData && !isFetching) renderAll(lastData);
    });
})();
