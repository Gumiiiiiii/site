(function () {
    const textHex = document.getElementById('text-hex');
    const textSwatch = document.getElementById('text-swatch');
    const bgHex = document.getElementById('bg-hex');
    const bgSwatch = document.getElementById('bg-swatch');
    if (!textHex) return;

    const ratioValue = document.getElementById('ratio-value');
    const ratingLabel = document.getElementById('rating-label');
    const meter = document.getElementById('contrast-meter');
    const resultCard = document.getElementById('contrast-result');
    const chipSmallAA = document.getElementById('chip-small-aa');
    const chipSmallAAA = document.getElementById('chip-small-aaa');
    const chipLargeAA = document.getElementById('chip-large-aa');
    const chipLargeAAA = document.getElementById('chip-large-aaa');
    const contrastMsg = document.getElementById('contrast-msg');
    const fixBtn = document.getElementById('fix-btn');
    const previewPanel = document.getElementById('preview-panel');
    const previewLarge = document.getElementById('preview-large');
    const previewSmall = document.getElementById('preview-small');

    function t(key) {
        return window.GumiI18n ? window.GumiI18n.t(key) : key;
    }

    function parseHex(value) {
        const raw = String(value || '').trim().replace(/^#/, '');
        if (/^[0-9a-f]{3}$/i.test(raw)) {
            return raw.split('').map((c) => parseInt(c + c, 16));
        }
        if (/^[0-9a-f]{6}$/i.test(raw)) {
            return [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((c) => parseInt(c, 16));
        }
        return null;
    }

    function toHex(rgb) {
        return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    // WCAG relative luminance.
    function luminance(rgb) {
        const [r, g, b] = rgb.map((c) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function contrastRatio(rgbA, rgbB) {
        const l1 = luminance(rgbA);
        const l2 = luminance(rgbB);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    function ratingOf(ratio) {
        if (ratio < 2) return 1;
        if (ratio < 3) return 2;
        if (ratio < 4.5) return 3;
        if (ratio < 7) return 4;
        return 5;
    }

    function setChip(chip, label, pass) {
        chip.textContent = (pass ? '✓ ' : '✗ ') + label;
        chip.classList.toggle('pass', pass);
        chip.classList.toggle('fail', !pass);
    }

    const bgImageBtn = document.getElementById('bg-image-btn');
    const bgImageClear = document.getElementById('bg-image-clear');
    const bgImageInput = document.getElementById('bg-image-input');
    const bgImageNote = document.getElementById('bg-image-note');

    let currentText = [26, 26, 26];
    let currentBg = [249, 244, 239];
    let bgImageUrl = null;

    // Restore shared colors from the URL (?text=RRGGBB&bg=RRGGBB) so a specific
    // check can be linked. URL wins over the defaults above.
    if (window.GumiUrlState) {
        const urlText = parseHex(window.GumiUrlState.get('text') || '');
        const urlBg = parseHex(window.GumiUrlState.get('bg') || '');
        if (urlText) currentText = urlText;
        if (urlBg) currentBg = urlBg;
    }

    function averageColor(img) {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let r = 0, g = 0, b = 0;
        const count = size * size;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    }

    function clearBgImage() {
        if (!bgImageUrl) return;
        URL.revokeObjectURL(bgImageUrl);
        bgImageUrl = null;
        previewPanel.style.backgroundImage = '';
        bgImageClear.classList.add('hidden');
        bgImageBtn.classList.remove('hidden');
        bgImageNote.classList.add('hidden');
    }

    function update() {
        const ratio = contrastRatio(currentText, currentBg);
        const rating = ratingOf(ratio);

        ratioValue.textContent = (Math.round(ratio * 100) / 100).toLocaleString(
            (window.GumiI18n && window.GumiI18n.get() === 'fr') ? 'fr-FR' : 'en-US'
        );
        ratingLabel.textContent = t('contrast_r' + rating);

        const lvlClass = rating <= 2 ? 'lvl-low' : rating === 3 ? 'lvl-mid' : 'lvl-high';
        meter.querySelectorAll('span').forEach((seg, index) => {
            seg.className = index < rating ? 'on ' + lvlClass : '';
        });

        const smallAA = ratio >= 4.5;
        const smallAAA = ratio >= 7;
        const largeAA = ratio >= 3;
        const largeAAA = ratio >= 4.5;

        setChip(chipSmallAA, 'AA', smallAA);
        setChip(chipSmallAAA, 'AAA', smallAAA);
        setChip(chipLargeAA, 'AA', largeAA);
        setChip(chipLargeAAA, 'AAA', largeAAA);

        resultCard.classList.toggle('is-fail', !largeAA);
        resultCard.classList.toggle('is-pass', smallAA);

        if (smallAA) contrastMsg.textContent = t('contrast_msg_all');
        else if (largeAA) contrastMsg.textContent = t('contrast_msg_large');
        else contrastMsg.textContent = t('contrast_msg_none');

        fixBtn.classList.toggle('hidden', smallAA);

        previewPanel.style.backgroundColor = toHex(currentBg);
        previewLarge.style.color = toHex(currentText);
        previewSmall.style.color = toHex(currentText);

        if (bgImageUrl) {
            bgImageNote.textContent = t('contrast_img_note');
            bgImageNote.classList.remove('hidden');
        }

        // Keep the URL shareable (skip while an image defines the background,
        // since a pasted image can't be encoded in a link).
        if (window.GumiUrlState && !bgImageUrl) {
            window.GumiUrlState.set({
                text: toHex(currentText).replace('#', ''),
                bg: toHex(currentBg).replace('#', '')
            });
        }
    }

    // The swatches are plain buttons: their background carries the color
    // and a click opens the shared GumiColorPicker popover.
    function setSwatch(swatch, hex) {
        swatch.style.backgroundColor = hex;
    }

    function syncFrom(hexInput, swatchInput, assign) {
        const rgb = parseHex(hexInput.value);
        if (!rgb) return;
        assign(rgb);
        hexInput.value = toHex(rgb);
        setSwatch(swatchInput, toHex(rgb));
        update();
    }

    bgImageBtn.addEventListener('click', () => bgImageInput.click());
    bgImageClear.addEventListener('click', () => {
        clearBgImage();
        update();
    });

    function loadBgImage(file) {
        if (!file || !file.type.startsWith('image/')) return;

        clearBgImage();
        bgImageUrl = URL.createObjectURL(file);

        const img = new Image();
        img.onload = () => {
            // The ratio is computed against the image's average color.
            currentBg = averageColor(img);
            bgHex.value = toHex(currentBg);
            setSwatch(bgSwatch, toHex(currentBg));

            previewPanel.style.backgroundImage = 'url(' + bgImageUrl + ')';
            previewPanel.style.backgroundSize = 'cover';
            previewPanel.style.backgroundPosition = 'center';

            bgImageBtn.classList.add('hidden');
            bgImageClear.classList.remove('hidden');
            update();
        };
        img.src = bgImageUrl;
    }

    bgImageInput.addEventListener('change', (e) => {
        loadBgImage(e.target.files && e.target.files[0]);
        bgImageInput.value = '';
    });

    // Paste a screenshot to sample its average color as the background.
    if (window.GumiPaste) {
        window.GumiPaste.onImage((file) => {
            loadBgImage(file);
            if (window.showToolToast) window.showToolToast(t('paste_added', 'Image collée ajoutée.'));
        });
    }

    textHex.addEventListener('change', () => syncFrom(textHex, textSwatch, (rgb) => { currentText = rgb; }));
    bgHex.addEventListener('change', () => syncFrom(bgHex, bgSwatch, (rgb) => { currentBg = rgb; }));
    textHex.addEventListener('input', () => {
        const rgb = parseHex(textHex.value);
        if (rgb) { currentText = rgb; setSwatch(textSwatch, toHex(rgb)); update(); }
    });
    bgHex.addEventListener('input', () => {
        const rgb = parseHex(bgHex.value);
        if (rgb) { clearBgImage(); currentBg = rgb; setSwatch(bgSwatch, toHex(rgb)); update(); }
    });

    window.GumiColorPicker.attach(textSwatch, {
        get: () => toHex(currentText),
        onChange: (hex) => {
            currentText = parseHex(hex);
            textHex.value = toHex(currentText);
            setSwatch(textSwatch, toHex(currentText));
            update();
        }
    });
    window.GumiColorPicker.attach(bgSwatch, {
        get: () => toHex(currentBg),
        onChange: (hex) => {
            clearBgImage();
            currentBg = parseHex(hex);
            bgHex.value = toHex(currentBg);
            setSwatch(bgSwatch, toHex(currentBg));
            update();
        }
    });

    // Nudge the text color toward black or white until small-text AA (4.5:1) passes.
    fixBtn.addEventListener('click', () => {
        const towardWhite = luminance(currentBg) < 0.5;
        const target = towardWhite ? [255, 255, 255] : [0, 0, 0];
        let fixed = currentText.slice();

        for (let step = 0; step < 40; step++) {
            if (contrastRatio(fixed, currentBg) >= 4.5) break;
            fixed = fixed.map((c, i) => c + (target[i] - c) * 0.12);
        }

        currentText = fixed.map((c) => Math.round(c));
        textHex.value = toHex(currentText);
        setSwatch(textSwatch, toHex(currentText));
        update();
    });

    // Reflect the active colors (which may have come from the URL) in the
    // hex inputs and swatches before the first render.
    textHex.value = toHex(currentText);
    bgHex.value = toHex(currentBg);
    setSwatch(textSwatch, toHex(currentText));
    setSwatch(bgSwatch, toHex(currentBg));

    document.addEventListener('gumi:lang', update);
    update();
})();
