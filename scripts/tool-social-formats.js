(function () {
    const dropZone = document.getElementById('drop-zone');
    if (!dropZone) return;

    const fileInput = document.getElementById('file-input');
    const focalBox = document.getElementById('sr-focal');
    const focalImg = document.getElementById('sr-focal-img');
    const focalDot = document.getElementById('sr-focal-dot');
    const focalHint = document.getElementById('sr-focal-hint');
    const formatList = document.getElementById('sr-format-list');
    const exportBtn = document.getElementById('sr-export-btn');
    const placeholder = document.getElementById('sr-placeholder');
    const results = document.getElementById('sr-results');
    const downloadAllBtn = document.getElementById('sr-download-all');

    function t(key, fallback) {
        return (window.GumiI18n && window.GumiI18n.t(key)) || fallback || key;
    }

    // Platform export presets. `label` keys resolve through i18n.
    const FORMATS = [
        { id: 'ig-post', platform: 'Instagram', label: 'sr_f_post', w: 1080, h: 1080, checked: true },
        { id: 'ig-portrait', platform: 'Instagram', label: 'sr_f_portrait', w: 1080, h: 1350, checked: false },
        { id: 'ig-story', platform: 'Instagram', label: 'sr_f_story', w: 1080, h: 1920, checked: true },
        { id: 'fb-post', platform: 'Facebook', label: 'sr_f_post', w: 1200, h: 630, checked: true },
        { id: 'fb-cover', platform: 'Facebook', label: 'sr_f_cover', w: 820, h: 312, checked: false },
        { id: 'x-post', platform: 'X (Twitter)', label: 'sr_f_post', w: 1600, h: 900, checked: true },
        { id: 'x-header', platform: 'X (Twitter)', label: 'sr_f_header', w: 1500, h: 500, checked: false },
        { id: 'li-post', platform: 'LinkedIn', label: 'sr_f_post', w: 1200, h: 627, checked: true },
        { id: 'li-banner', platform: 'LinkedIn', label: 'sr_f_banner', w: 1584, h: 396, checked: false },
        { id: 'yt-thumb', platform: 'YouTube', label: 'sr_f_thumb', w: 1280, h: 720, checked: false },
        { id: 'pi-pin', platform: 'Pinterest', label: 'sr_f_pin', w: 1000, h: 1500, checked: false }
    ];

    let sourceImg = null;
    let sourceName = 'visuel';
    let focal = { x: 0.5, y: 0.5 };
    let exported = [];

    function formatName(format) {
        return format.platform + ' — ' + t(format.label);
    }

    function buildFormatList() {
        // Preserve any user selection across language-switch rebuilds.
        formatList.querySelectorAll('input').forEach((el) => {
            const format = FORMATS.find((f) => f.id === el.value);
            if (format) format.checked = el.checked;
        });
        formatList.innerHTML = '';
        FORMATS.forEach((format) => {
            const row = document.createElement('label');
            row.className = 'sr-format-row no-select';
            // The id makes each checkbox auto-persist via GumiPrefs.
            row.innerHTML =
                '<input type="checkbox" id="sr-fmt-' + format.id + '" value="' + format.id + '"' + (format.checked ? ' checked' : '') + '>' +
                '<span class="sr-format-name">' + formatName(format) + '</span>' +
                '<span class="sr-format-dims">' + format.w + '×' + format.h + '</span>';
            formatList.appendChild(row);
        });
    }

    function formatBytes(bytes) {
        if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    }

    function loadImage(file) {
        if (!file || !file.type.startsWith('image/')) {
            window.showToolToast(t('sr_err_image', 'Veuillez déposer une image.'), true);
            return;
        }
        sourceName = (file.name.replace(/\.[^.]+$/, '') || 'visuel')
            .toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'visuel';

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            sourceImg = img;
            focal = { x: 0.5, y: 0.5 };
            focalImg.src = url;
            focalBox.style.display = 'block';
            focalHint.style.display = 'block';
            paintFocal();
            exportBtn.disabled = false;
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            window.showToolToast(t('sr_err_image', 'Veuillez déposer une image.'), true);
        };
        img.src = url;
    }

    // The focal preview uses object-fit: contain, so pointer coordinates
    // must be mapped onto the letterboxed image area, not the whole box.
    function imageAreaInBox() {
        const box = focalBox.getBoundingClientRect();
        const scale = Math.min(box.width / sourceImg.naturalWidth, box.height / sourceImg.naturalHeight);
        const w = sourceImg.naturalWidth * scale;
        const h = sourceImg.naturalHeight * scale;
        return { left: (box.width - w) / 2, top: (box.height - h) / 2, width: w, height: h, box };
    }

    function paintFocal() {
        if (!sourceImg) return;
        const area = imageAreaInBox();
        focalDot.style.left = (area.left + focal.x * area.width) + 'px';
        focalDot.style.top = (area.top + focal.y * area.height) + 'px';
    }

    function focalFromPointer(event) {
        const area = imageAreaInBox();
        const x = (event.clientX - area.box.left - area.left) / area.width;
        const y = (event.clientY - area.box.top - area.top) / area.height;
        focal.x = Math.max(0, Math.min(1, x));
        focal.y = Math.max(0, Math.min(1, y));
        paintFocal();
    }

    focalBox.addEventListener('pointerdown', (event) => {
        if (!sourceImg) return;
        event.preventDefault();
        focalBox.setPointerCapture(event.pointerId);
        focalFromPointer(event);
    });
    focalBox.addEventListener('pointermove', (event) => {
        if (sourceImg && event.buttons) focalFromPointer(event);
    });
    window.addEventListener('resize', paintFocal);

    // Cover-crop the source around the focal point, clamped to the edges.
    function cropFor(format) {
        const sw = sourceImg.naturalWidth;
        const sh = sourceImg.naturalHeight;
        const targetRatio = format.w / format.h;

        let cw = sw;
        let ch = sw / targetRatio;
        if (ch > sh) {
            ch = sh;
            cw = sh * targetRatio;
        }

        const cx = Math.max(cw / 2, Math.min(sw - cw / 2, focal.x * sw));
        const cy = Math.max(ch / 2, Math.min(sh - ch / 2, focal.y * sh));
        return { x: cx - cw / 2, y: cy - ch / 2, w: cw, h: ch };
    }

    function renderFormat(format, mime, quality) {
        return new Promise((resolve, reject) => {
            const crop = cropFor(format);
            const canvas = document.createElement('canvas');
            canvas.width = format.w;
            canvas.height = format.h;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            if (mime === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, format.w, format.h);
            }
            ctx.drawImage(sourceImg, crop.x, crop.y, crop.w, crop.h, 0, 0, format.w, format.h);
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('toBlob failed'));
            }, mime, quality);
        });
    }

    function clearExports() {
        exported.forEach((item) => URL.revokeObjectURL(item.url));
        exported = [];
        results.innerHTML = '';
    }

    async function runExport() {
        if (!sourceImg) return;
        const checked = Array.from(formatList.querySelectorAll('input:checked')).map((el) => el.value);
        if (!checked.length) {
            window.showToolToast(t('sr_err_none', 'Cochez au moins un format.'), true);
            return;
        }

        const type = document.querySelector('input[name="sr-format"]:checked').value;
        const mime = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[type];
        const ext = type === 'jpeg' ? 'jpg' : type;

        const idleLabel = exportBtn.textContent;
        exportBtn.disabled = true;
        exportBtn.textContent = t('sr_exporting', 'Génération...');
        clearExports();

        try {
            for (const format of FORMATS.filter((f) => checked.includes(f.id))) {
                const blob = await renderFormat(format, mime, 0.9);
                const url = URL.createObjectURL(blob);
                const fileName = sourceName + '-' + format.id + '-' + format.w + 'x' + format.h + '.' + ext;
                exported.push({ url, blob, fileName });

                const card = document.createElement('div');
                card.className = 'sr-card';
                card.innerHTML =
                    '<img class="sr-card-thumb" src="' + url + '" alt="">' +
                    '<div class="sr-card-body">' +
                    '<span class="sr-card-title">' + formatName(format) + '</span>' +
                    '<span class="sr-card-meta">' + format.w + '×' + format.h + ' — ' + formatBytes(blob.size) + '</span>' +
                    '<button type="button" class="sr-card-dl">' +
                    '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
                    t('sr_download', 'Télécharger') + '</button></div>';
                card.querySelector('.sr-card-dl').addEventListener('click', () => {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                });
                results.appendChild(card);
            }

            placeholder.style.display = 'none';
            results.hidden = false;
            downloadAllBtn.classList.remove('hidden');
            downloadAllBtn.classList.add('visible');
        } catch (err) {
            window.showToolToast(t('sr_err_export', "L'export a échoué, réessayez."), true);
        } finally {
            exportBtn.disabled = false;
            exportBtn.textContent = idleLabel;
        }
    }

    // JSZip is vendored; load it only when "download all" is used.
    function ensureJSZip() {
        if (window.JSZip) return Promise.resolve(window.JSZip);
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '../scripts/vendor/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = () => reject(new Error('jszip load failed'));
            document.head.appendChild(script);
        });
    }

    downloadAllBtn.addEventListener('click', async () => {
        if (!exported.length) return;
        try {
            const JSZip = await ensureJSZip();
            const zip = new JSZip();
            exported.forEach((item) => zip.file(item.fileName, item.blob));
            const blob = await zip.generateAsync({ type: 'blob' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = sourceName + '-formats.zip';
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 10000);
        } catch (err) {
            exported.forEach((item, index) => {
                setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = item.url;
                    a.download = item.fileName;
                    a.click();
                }, index * 300);
            });
        }
    });

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput.click();
        }
    });
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
    });
    dropZone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        dropZone.style.borderColor = '';
    });
    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.style.borderColor = '';
        loadImage(event.dataTransfer.files && event.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (event) => {
        loadImage(event.target.files && event.target.files[0]);
        fileInput.value = '';
    });

    exportBtn.addEventListener('click', runExport);

    document.addEventListener('gumi:lang', buildFormatList);
    buildFormatList();
})();
