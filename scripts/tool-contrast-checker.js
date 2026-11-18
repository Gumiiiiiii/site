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
        if (/^[0-9a-f]{6}$/i.test(raw) || /^[0-9a-f]{8}$/i.test(raw)) {
            return [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((c) => parseInt(c, 16));
        }
        return null;
    }

    // L'opacité portée par un hex à huit chiffres, 1 s'il n'y en a pas.
    function parseAlpha(value) {
        const raw = String(value || '').trim().replace(/^#/, '');
        if (/^[0-9a-f]{8}$/i.test(raw)) return parseInt(raw.slice(6, 8), 16) / 255;
        return 1;
    }

    function toHex(rgb) {
        return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    // La couleur écrite dans le champ : huit chiffres seulement si l'encre est transparente.
    function toHexA(rgb, alpha) {
        if (alpha >= 1) return toHex(rgb);
        return toHex(rgb) + Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
    }

    // Une encre transparente n'a pas de contraste propre : ce que l'œil lit.
    function composite(rgb, sur, alpha) {
        if (alpha >= 1) return rgb;
        return rgb.map((c, i) => Math.round(c * alpha + sur[i] * (1 - alpha)));
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
    let textAlpha = 1;
    let bgImageUrl = null;
    // Les trois couleurs lues sur l'image de fond, tant qu'il y en a une.
    let bgZones = null;

    // Restore shared colors from the URL (?text=RRGGBB&bg=RRGGBB) so a specific check can be linked.
    if (window.GumiUrlState) {
        const rawText = window.GumiUrlState.get('text') || '';
        const urlText = parseHex(rawText);
        const urlBg = parseHex(window.GumiUrlState.get('bg') || '');
        if (urlText) {
            currentText = urlText;
            textAlpha = parseAlpha(rawText);
        }
        if (urlBg) currentBg = urlBg;
    }

    // Trois zones plutôt qu'une moyenne.
    const ZONES = ['left', 'mid', 'right'];

    function sampleZones(img) {
        const width = 48, height = 32;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const data = ctx.getImageData(0, 0, width, height).data;

        const band = width / 3;
        return [0, 1, 2].map((zone) => {
            const from = Math.round(zone * band);
            const to = Math.round((zone + 1) * band);
            let r = 0, g = 0, b = 0, count = 0;
            for (let y = 0; y < height; y++) {
                for (let x = from; x < to; x++) {
                    const i = (y * width + x) * 4;
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
            }
            return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
        });
    }

    // Le ratio réellement lu : l'encre composée sur son fond, puis mesurée contre ce même fond.
    function ratioFor(text, alpha, bg) {
        return contrastRatio(composite(text, bg, alpha), bg);
    }

    // La zone la moins lisible pour l'encre courante.
    function worstZone(zones, text, alpha) {
        return zones.reduce((pire, zone) => (
            ratioFor(text, alpha, zone) < ratioFor(text, alpha, pire) ? zone : pire
        ));
    }

    function clearBgImage() {
        if (!bgImageUrl) return;
        URL.revokeObjectURL(bgImageUrl);
        bgImageUrl = null;
        bgZones = null;
        previewPanel.style.backgroundImage = '';
        bgImageClear.classList.add('hidden');
        bgImageBtn.classList.remove('hidden');
        bgImageNote.classList.add('hidden');
        bgImageNote.innerHTML = '';
    }

    // Le relevé des trois zones, sous les commandes : chaque bande avec sa couleur et son ratio.
    function renderZones(worst) {
        const lignes = bgZones.map((zone, index) => {
            const ratio = ratioFor(currentText, textAlpha, zone);
            const pire = zone === worst;
            return '<span class="zone' + (pire ? ' zone-pire' : '') + '">' +
                '<span class="zone-pastille" style="background:' + toHex(zone) + '"></span>' +
                '<span class="zone-nom">' + t('contrast_zone_' + ZONES[index]) + '</span>' +
                '<span class="zone-ratio">' + formatRatio(ratio) + '</span>' +
                '</span>';
        }).join('');

        bgImageNote.innerHTML = '<span class="zones">' + lignes + '</span>' +
            '<span class="zones-legende">' + t('contrast_img_note') + '</span>';
        bgImageNote.classList.remove('hidden');
    }

    function formatRatio(ratio) {
        return (Math.round(ratio * 100) / 100).toLocaleString(
            (window.GumiI18n && window.GumiI18n.get() === 'fr') ? 'fr-FR' : 'en-US'
        );
    }

    function update() {
        // Quand une image porte le fond, c'est sa zone la moins lisible qui devient la couleur de référence.
        let worst = null;
        if (bgZones) {
            worst = worstZone(bgZones, currentText, textAlpha);
            currentBg = worst;
            bgHex.value = toHex(currentBg);
            setSwatch(bgSwatch, currentBg);
        }

        const ratio = ratioFor(currentText, textAlpha, currentBg);
        const rating = ratingOf(ratio);

        ratioValue.textContent = formatRatio(ratio);
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
        // L'aperçu porte l'opacité telle quelle, et laisse le navigateur composer.
        const encre = 'rgba(' + currentText.join(', ') + ', ' + textAlpha + ')';
        previewLarge.style.color = encre;
        previewSmall.style.color = encre;

        if (bgZones) renderZones(worst);

        // Keep the URL shareable (skip while an image defines the background.
        if (window.GumiUrlState && !bgImageUrl) {
            window.GumiUrlState.set({
                text: toHexA(currentText, textAlpha).replace('#', ''),
                bg: toHex(currentBg).replace('#', '')
            });
        }
    }

    // Swatches are plain buttons: their background is the colour, a click opens the picker.
    function setSwatch(swatch, rgb, alpha) {
        swatch.style.backgroundColor = alpha === undefined || alpha >= 1
            ? toHex(rgb)
            : 'rgba(' + rgb.join(', ') + ', ' + alpha + ')';
    }

    function syncFrom(hexInput, swatchInput, assign) {
        const rgb = parseHex(hexInput.value);
        if (!rgb) return;
        assign(rgb);
        hexInput.value = toHex(rgb);
        setSwatch(swatchInput, rgb);
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
            // Les trois bandes sont lues une fois.
            bgZones = sampleZones(img);

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

    // Le champ de l'encre accepte les huit chiffres : #1A1A1A99 est une écriture CSS courante.
    function readTextField() {
        const rgb = parseHex(textHex.value);
        if (!rgb) return false;
        currentText = rgb;
        textAlpha = parseAlpha(textHex.value);
        setSwatch(textSwatch, rgb, textAlpha);
        update();
        return true;
    }

    textHex.addEventListener('change', () => {
        if (readTextField()) textHex.value = toHexA(currentText, textAlpha);
    });
    bgHex.addEventListener('change', () => syncFrom(bgHex, bgSwatch, (rgb) => { currentBg = rgb; }));
    textHex.addEventListener('input', readTextField);
    bgHex.addEventListener('input', () => {
        const rgb = parseHex(bgHex.value);
        if (rgb) { clearBgImage(); currentBg = rgb; setSwatch(bgSwatch, rgb); update(); }
    });

    // L'encre est le seul des deux à recevoir la piste d'opacité.
    window.GumiColorPicker.attach(textSwatch, {
        alpha: true,
        get: () => toHexA(currentText, textAlpha),
        onChange: (hex, alpha) => {
            currentText = parseHex(hex);
            textAlpha = alpha;
            textHex.value = toHexA(currentText, textAlpha);
            setSwatch(textSwatch, currentText, textAlpha);
            update();
        }
    });
    window.GumiColorPicker.attach(bgSwatch, {
        get: () => toHex(currentBg),
        onChange: (hex) => {
            clearBgImage();
            currentBg = parseHex(hex);
            bgHex.value = toHex(currentBg);
            setSwatch(bgSwatch, currentBg);
            update();
        }
    });

    // Nudge the text color toward black or white until small-text AA (4.5:1) passes.
    fixBtn.addEventListener('click', () => {
        const towardWhite = luminance(currentBg) < 0.5;
        const target = towardWhite ? [255, 255, 255] : [0, 0, 0];
        let fixed = currentText.slice();
        let alpha = textAlpha;

        // Sur une image, la correction vise la zone la moins lisible du moment.
        const mesurer = (encre, a) => ratioFor(
            encre, a, bgZones ? worstZone(bgZones, encre, a) : currentBg
        );

        for (let step = 0; step < 40; step++) {
            if (mesurer(fixed, alpha) >= 4.5) break;
            fixed = fixed.map((c, i) => c + (target[i] - c) * 0.12);
        }

        // Une encre transparente a un plafond : même portée au noir ou au blanc.
        if (alpha < 1 && mesurer(fixed, alpha) < 4.5) {
            for (let step = 0; step < 40 && alpha < 1; step++) {
                alpha = Math.min(1, alpha + 0.025);
                if (mesurer(fixed, alpha) >= 4.5) break;
            }
        }

        currentText = fixed.map((c) => Math.round(c));
        textAlpha = alpha;
        textHex.value = toHexA(currentText, textAlpha);
        setSwatch(textSwatch, currentText, textAlpha);
        update();
    });

    // Show the active colours (maybe from the URL) in the inputs and swatches.
    textHex.value = toHexA(currentText, textAlpha);
    bgHex.value = toHex(currentBg);
    setSwatch(textSwatch, currentText, textAlpha);
    setSwatch(bgSwatch, currentBg);

    // Les deux textes de l'aperçu se réécrivent sur place.
    [previewLarge, previewSmall].forEach((champ) => {
        champ.addEventListener('paste', (event) => {
            event.preventDefault();
            const brut = (event.clipboardData || window.clipboardData).getData('text/plain');
            // Une seule ligne pour le titre : un retour y casserait la mesure qu'on vient faire.
            const texte = champ === previewLarge ? brut.replace(/\s+/g, ' ').trim() : brut;
            document.execCommand('insertText', false, texte);
        });
    });

    document.addEventListener('gumi:lang', update);
    update();
})();
