(function () {
    const qrContainer = document.getElementById('qr-container');
    const generateBtn = document.getElementById('generate-btn');
    if (!qrContainer || !generateBtn) return;

    const exportGroup = document.getElementById('export-group');
    const qrText = document.getElementById('qr-text');

    let selectedCodeColor = '#1A1A1A';
    let selectedBgColor = '#FFFFFF';

    function t(key, fallback) {
        return window.GumiI18n ? window.GumiI18n.t(key) || fallback : fallback;
    }

    function setupSwatches(groupId, onPick) {
        const group = document.getElementById(groupId);
        if (!group) return;
        const swatches = group.querySelectorAll('.color-swatch');
        swatches.forEach(function (swatch) {
            swatch.addEventListener('click', function () {
                swatches.forEach(function (s) { s.classList.remove('active'); });
                swatch.classList.add('active');
                onPick(swatch.dataset.color);
            });
        });
    }

    setupSwatches('code-colors', function (color) { selectedCodeColor = color; });
    setupSwatches('bg-colors', function (color) { selectedBgColor = color; });

    if (typeof QRCodeStyling === 'undefined') {
        generateBtn.disabled = true;
        if (window.showToolToast) window.showToolToast(t('qr_lib_error', 'Bibliothèque QR indisponible.'), true);
        return;
    }

    const qrCodeObj = new QRCodeStyling({
        width: 300,
        height: 300,
        margin: 10,
        type: 'svg'
    });

    generateBtn.addEventListener('click', function () {
        const text = qrText.value.trim();
        if (!text) {
            if (window.showToolToast) window.showToolToast(t('qr_empty_error', 'Veuillez entrer un texte ou un lien.'), true);
            qrText.focus();
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
            cornersDotOptions: {
                type: shape === 'dots' ? 'dot' : 'square'
            }
        });

        qrContainer.innerHTML = '';
        qrCodeObj.append(qrContainer);
        exportGroup.style.display = 'flex';
    });

    document.getElementById('download-btn').addEventListener('click', function () {
        const format = document.querySelector('input[name="out-format"]:checked').value;
        qrCodeObj.download({ name: 'QR_Code_Gumi', extension: format });
    });
})();
