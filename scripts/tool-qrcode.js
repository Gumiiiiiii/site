(function () {
    const qrContainer = document.getElementById('qr-container');
    const qrMount = document.getElementById('qr-mount');
    const placeholder = document.getElementById('qr-placeholder');
    if (!qrContainer || !qrMount) return;

    const exportGroup = document.getElementById('export-group');
    const qrText = document.getElementById('qr-text');
    const shareBtn = document.getElementById('qr-share');

    let selectedCodeColor = '#1A1A1A';
    let selectedBgColor = '#FFFFFF';

    function t(key, fallback) {
        return window.GumiI18n ? window.GumiI18n.t(key) || fallback : fallback;
    }

    if (typeof QRCodeStyling === 'undefined') {
        if (window.showToolToast) window.showToolToast(t('qr_lib_error', 'Bibliothèque QR indisponible.'), true);
        return;
    }

    const qrCodeObj = new QRCodeStyling({ width: 300, height: 300, margin: 10, type: 'svg' });
    let hasRendered = false;
    let renderTimer = null;

    // Colour input = hex text field + swatch that opens the shared colour
    // picker (same pattern as the palette tool). The value is applied live and
    // persisted so it survives a reload.
    function normalizeHex(value) {
        const m = /^#?([0-9a-fA-F]{6})$/.exec(String(value || '').trim());
        return m ? '#' + m[1].toUpperCase() : null;
    }
    function setupColorField(hexId, swatchId, prefKey, fallback, apply) {
        const hexInput = document.getElementById(hexId);
        const swatchBtn = document.getElementById(swatchId);
        if (!hexInput || !swatchBtn) return;

        function setColor(hex, persist) {
            hexInput.value = hex;
            swatchBtn.style.backgroundColor = hex;
            apply(hex);
            if (persist && window.GumiPrefs) window.GumiPrefs.set(prefKey, hex);
        }

        // Live-apply while typing a valid hex, but don't clobber what the user
        // is mid-typing in the field itself.
        hexInput.addEventListener('input', function () {
            const hex = normalizeHex(hexInput.value);
            if (!hex) return;
            swatchBtn.style.backgroundColor = hex;
            apply(hex);
            if (window.GumiPrefs) window.GumiPrefs.set(prefKey, hex);
        });

        if (window.GumiColorPicker) {
            window.GumiColorPicker.attach(swatchBtn, {
                get: function () { return normalizeHex(hexInput.value) || fallback; },
                onChange: function (hex) { setColor(hex, true); }
            });
        }

        const saved = window.GumiPrefs && window.GumiPrefs.get(prefKey);
        setColor(normalizeHex(saved) || normalizeHex(hexInput.value) || fallback, false);
    }

    setupColorField('code-hex', 'code-swatch', 'qr-code-color', '#1A1A1A', function (color) {
        selectedCodeColor = color; scheduleRender();
    });
    setupColorField('bg-hex', 'bg-swatch', 'qr-bg-color', '#FFFFFF', function (color) {
        selectedBgColor = color; scheduleRender();
    });

    function render() {
        const text = qrText.value.trim();

        // Empty content: fall back to the placeholder, no error, nothing to export.
        if (!text) {
            qrMount.style.display = 'none';
            if (placeholder) placeholder.style.display = '';
            qrContainer.style.background = '#FFFFFF';
            exportGroup.style.display = 'none';
            if (window.GumiUrlState) window.GumiUrlState.set({ data: null });
            return;
        }

        const shape = document.querySelector('input[name="qr-shape"]:checked').value;
        qrContainer.style.background = selectedBgColor;

        qrCodeObj.update({
            data: text,
            dotsOptions: { color: selectedCodeColor, type: shape },
            backgroundOptions: { color: selectedBgColor },
            cornersSquareOptions: {
                type: shape === 'dots' ? 'dot' : (shape === 'rounded' ? 'extra-rounded' : 'square')
            },
            cornersDotOptions: { type: shape === 'dots' ? 'dot' : 'square' }
        });

        qrMount.innerHTML = '';
        qrCodeObj.append(qrMount);
        if (placeholder) placeholder.style.display = 'none';
        qrMount.style.display = '';
        exportGroup.style.display = 'flex';

        // Keep the content shareable via ?data=…
        if (window.GumiUrlState) window.GumiUrlState.set({ data: text });
        hasRendered = true;
    }

    // Debounced so typing and dragging the color picker stay smooth; the QR
    // only re-renders once input settles.
    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(render, 160);
    }

    qrText.addEventListener('input', scheduleRender);
    document.querySelectorAll('input[name="qr-shape"]').forEach(function (radio) {
        radio.addEventListener('change', render);
    });

    document.getElementById('download-btn').addEventListener('click', function () {
        if (!hasRendered) return;
        const format = document.querySelector('input[name="out-format"]:checked').value;
        qrCodeObj.download({ name: 'QR_Code_Gumi', extension: format });
    });

    if (shareBtn) {
        shareBtn.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(window.GumiUrlState.shareUrl());
            } catch (err) {
                const helper = document.createElement('textarea');
                helper.value = window.GumiUrlState.shareUrl();
                document.body.appendChild(helper);
                helper.select();
                document.execCommand('copy');
                helper.remove();
            }
            if (window.showToolToast) window.showToolToast(t('share_copied', 'Lien copié !'));
        });
    }

    // Deep link: ?data=… prefills the content; the tool renders it live.
    if (window.GumiUrlState) {
        const shared = window.GumiUrlState.get('data');
        if (shared) qrText.value = shared;
    }
    render();

    document.addEventListener('gumi:lang', function () { if (hasRendered) render(); });
})();
