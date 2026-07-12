(function () {
    const hexInput = document.getElementById('pal-hex');
    if (!hexInput) return;

    const swatchBtn = document.getElementById('pal-swatch');
    const swatchList = document.getElementById('pal-swatches');
    const copyHexBtn = document.getElementById('pal-copy-hex');
    const copyCssBtn = document.getElementById('pal-copy-css');
    const shareBtn = document.getElementById('pal-share');

    function t(key, fallback) {
        return (window.GumiI18n && window.GumiI18n.t(key)) || fallback || key;
    }

    // --- color math (hex <-> hsl) ---
    function parseHex(value) {
        const raw = String(value || '').trim().replace(/^#/, '');
        if (/^[0-9a-f]{3}$/i.test(raw)) return raw.split('').map((c) => parseInt(c + c, 16));
        if (/^[0-9a-f]{6}$/i.test(raw)) return [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((c) => parseInt(c, 16));
        return null;
    }
    function toHex(rgb) {
        return '#' + rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h = 0, s = 0;
        const d = max - min;
        if (d) {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
        }
        return [h, s, l];
    }
    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(1, s));
        l = Math.max(0, Math.min(1, l));
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    }

    // --- harmonies: each returns an array of hex strings, base first ---
    function buildPalette(baseRgb, harmony) {
        const [h, s, l] = rgbToHsl(baseRgb[0], baseRgb[1], baseRgb[2]);
        const at = (hue, sat, lig) => toHex(hslToRgb(hue, sat === undefined ? s : sat, lig === undefined ? l : lig));

        switch (harmony) {
            case 'analogous':
                return [at(h - 60), at(h - 30), at(h), at(h + 30), at(h + 60)];
            case 'triadic':
                return [at(h), at(h + 120), at(h + 240), at(h, s, Math.min(0.9, l + 0.15)), at(h, s, Math.max(0.1, l - 0.15))];
            case 'tetradic':
                return [at(h), at(h + 90), at(h + 180), at(h + 270), at(h, Math.max(0.1, s - 0.25), l)];
            case 'monochromatic':
                return [at(h, s, 0.20), at(h, s, 0.35), at(h, s, 0.50), at(h, s, 0.68), at(h, s, 0.85)];
            case 'complementary':
            default:
                return [at(h, s, Math.max(0.15, l - 0.18)), at(h), at(h, Math.max(0.1, s - 0.2), Math.min(0.92, l + 0.22)), at(h + 180), at(h + 180, s, Math.min(0.9, l + 0.15))];
        }
    }

    let palette = [];

    function currentHarmony() {
        const el = document.querySelector('input[name="pal-harmony"]:checked');
        return el ? el.value : 'complementary';
    }

    // Choose readable label color for text laid over a swatch.
    function textOn(rgb) {
        const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
        return lum > 0.55 ? '#1A1A1A' : '#FFFFFF';
    }

    async function copy(text, btn, okKey) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            const helper = document.createElement('textarea');
            helper.value = text;
            document.body.appendChild(helper);
            helper.select();
            document.execCommand('copy');
            helper.remove();
        }
        if (window.showToolToast) window.showToolToast(t(okKey, 'Copié !'));
    }

    function render() {
        const rgb = parseHex(hexInput.value);
        if (!rgb) return;
        palette = buildPalette(rgb, currentHarmony());

        swatchList.innerHTML = '';
        palette.forEach((hex) => {
            const swatchRgb = parseHex(hex);
            const fg = textOn(swatchRgb);
            const el = document.createElement('button');
            el.type = 'button';
            el.className = 'pal-swatch no-select';
            el.style.backgroundColor = hex;
            el.style.color = fg;
            el.setAttribute('aria-label', t('pal_copy_one', 'Copier') + ' ' + hex);
            el.innerHTML =
                '<span class="pal-swatch-hex">' + hex + '</span>' +
                '<span class="pal-swatch-copy"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"></rect>' +
                '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' +
                t('pal_copy_one', 'Copier') + '</span>';
            el.addEventListener('click', () => copy(hex, el, 'pal_copied'));
            swatchList.appendChild(el);
        });

        // Persist + keep shareable.
        if (window.GumiPrefs) {
            window.GumiPrefs.set('pal-base', toHex(rgb).replace('#', ''));
            window.GumiPrefs.set('pal-harmony', currentHarmony());
        }
        if (window.GumiUrlState) {
            window.GumiUrlState.set({ base: toHex(rgb).replace('#', ''), harmony: currentHarmony() });
        }
    }

    function setSeed(hex) {
        hexInput.value = hex;
        swatchBtn.style.backgroundColor = hex;
        render();
    }

    hexInput.addEventListener('input', () => {
        const rgb = parseHex(hexInput.value);
        if (rgb) { swatchBtn.style.backgroundColor = toHex(rgb); render(); }
    });
    document.querySelectorAll('input[name="pal-harmony"]').forEach((el) => {
        el.addEventListener('change', render);
    });

    window.GumiColorPicker.attach(swatchBtn, {
        get: () => {
            const rgb = parseHex(hexInput.value);
            return rgb ? toHex(rgb) : '#9C77F5';
        },
        onChange: (hex) => setSeed(hex)
    });

    copyHexBtn.addEventListener('click', () => copy(palette.join(', '), copyHexBtn, 'pal_copied'));
    copyCssBtn.addEventListener('click', () => {
        const css = ':root {\n' + palette.map((hex, i) => '  --color-' + (i + 1) + ': ' + hex + ';').join('\n') + '\n}';
        copy(css, copyCssBtn, 'pal_copied');
    });
    shareBtn.addEventListener('click', () => copy(window.GumiUrlState.shareUrl(), shareBtn, 'share_copied'));

    // Initial seed: URL param > saved pref > default.
    let initial = '#9C77F5';
    let initialHarmony = null;
    if (window.GumiPrefs) {
        const savedBase = window.GumiPrefs.get('pal-base');
        if (savedBase && parseHex(savedBase)) initial = toHex(parseHex(savedBase));
        initialHarmony = window.GumiPrefs.get('pal-harmony');
    }
    if (window.GumiUrlState) {
        const urlBase = window.GumiUrlState.get('base');
        if (urlBase && parseHex(urlBase)) initial = toHex(parseHex(urlBase));
        const urlHarmony = window.GumiUrlState.get('harmony');
        if (urlHarmony) initialHarmony = urlHarmony;
    }
    if (initialHarmony) {
        const el = document.getElementById('h-' + (initialHarmony === 'monochromatic' ? 'mono' : initialHarmony));
        if (el) el.checked = true;
    }
    setSeed(initial);

    document.addEventListener('gumi:lang', render);
})();
