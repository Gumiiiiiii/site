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

    // One color group = preset swatches + a custom "any color" wheel that opens
    // the shared color picker. Whatever is active (preset or custom) is applied
    // live and persisted so it survives a reload.
    function setupColorGroup(groupId, customId, fallback, apply) {
        const group = document.getElementById(groupId);
        if (!group) return;
        const customBtn = document.getElementById(customId);
        const presets = Array.from(group.querySelectorAll('.color-swatch:not(.color-swatch-custom)'));

        function clearActive() {
            group.querySelectorAll('.color-swatch').forEach(function (s) { s.classList.remove('active'); });
        }
        function resetCustomWheel() {
            if (customBtn) { customBtn.style.background = ''; customBtn.removeAttribute('data-value'); }
        }
        function selectPreset(swatch, persist) {
            clearActive();
            swatch.classList.add('active');
            resetCustomWheel();
            apply(swatch.dataset.color);
            if (persist && window.GumiPrefs) window.GumiPrefs.set('swatch:' + groupId, swatch.dataset.color);
        }
        function selectCustom(hex, persist) {
            clearActive();
            if (customBtn) {
                customBtn.classList.add('active');
                customBtn.style.background = hex;
                customBtn.setAttribute('data-value', hex);
            }
            apply(hex);
            if (persist && window.GumiPrefs) window.GumiPrefs.set('swatch:' + groupId, hex);
        }

        presets.forEach(function (swatch) {
            swatch.addEventListener('click', function () { selectPreset(swatch, true); });
        });
        if (customBtn && window.GumiColorPicker) {
            window.GumiColorPicker.attach(customBtn, {
                get: function () { return customBtn.getAttribute('data-value') || fallback; },
                onChange: function (hex) { selectCustom(hex, true); }
            });
        }

        // Restore last choice: a saved preset re-activates it; anything else is
        // treated as a custom color.
        const saved = window.GumiPrefs && window.GumiPrefs.get('swatch:' + groupId);
        const match = saved && presets.find(function (s) {
            return s.dataset.color.toUpperCase() === String(saved).toUpperCase();
        });
        if (match) selectPreset(match, false);
        else if (saved) selectCustom(saved, false);
        else {
            const active = presets.find(function (s) { return s.classList.contains('active'); }) || presets[0];
            if (active) apply(active.dataset.color);
        }
    }

    setupColorGroup('code-colors', 'code-custom', '#9C77F5', function (color) {
        selectedCodeColor = color; scheduleRender();
    });
    setupColorGroup('bg-colors', 'bg-custom', '#F9F4EF', function (color) {
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
