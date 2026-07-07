(function () {
    if (!document.getElementById('drop-zone')) return;

    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    const jsPDF = window.jspdf ? window.jspdf.jsPDF : null;

    function detectAgPsd() {
        return window.agPsd && typeof window.agPsd.readPsd === 'function' ? window.agPsd : null;
    }

    function detectPSDLib() {
        if (window.PSD) return window.PSD;
        if (window.psd && window.psd.PSD) return window.psd.PSD;
        return null;
    }

    function loadScriptOnce(src) {
        return new Promise(function (resolve, reject) {
            const existing = document.querySelector('script[data-psd-src="' + src + '"]');
            if (existing) {
                if (existing.dataset.loaded === 'true') return resolve();
                existing.addEventListener('load', function () { resolve(); }, { once: true });
                existing.addEventListener('error', function () { reject(new Error('script load error')); }, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.psdSrc = src;
            script.onload = function () {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = function () {
                reject(new Error('script load error'));
            };
            document.head.appendChild(script);
        });
    }

    async function ensurePSDLib() {
        const existing = detectPSDLib();
        if (existing) return existing;

        const candidates = [
            'https://cdnjs.cloudflare.com/ajax/libs/psd.js/2.0.0/psd.min.js',
            'https://unpkg.com/psd.js@2.0.0/dist/psd.min.js',
            'https://cdn.jsdelivr.net/gh/meltingice/psd.js@master/dist/psd.min.js'
        ];

        for (const src of candidates) {
            try {
                await loadScriptOnce(src);
                const lib = detectPSDLib();
                if (lib) return lib;
            } catch (error) {
                // Try next CDN fallback.
            }
        }

        return null;
    }

    async function ensureAgPsd() {
        const existing = detectAgPsd();
        if (existing) return existing;

        const candidates = [
            'https://cdn.jsdelivr.net/npm/ag-psd@26.0.0/dist/bundle.js',
            'https://unpkg.com/ag-psd@26.0.0/dist/bundle.js'
        ];

        for (const src of candidates) {
            try {
                await loadScriptOnce(src);
                const lib = detectAgPsd();
                if (lib) return lib;
            } catch (error) {
                // Try next CDN fallback.
            }
        }

        return null;
    }

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const convertBtn = document.getElementById('convert-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const fileCountTxt = document.getElementById('file-count');
    const clearBtn = document.getElementById('clear-btn');
    const resultsList = document.getElementById('results-list');
    const dlCount = document.getElementById('dl-count');

    let pendingFiles = [];
    const uploadedFileNames = new Set();

    function truncateName(name, maxLength) {
        const limit = maxLength || 25;
        return name.length > limit ? name.substring(0, limit - 3) + '...' : name;
    }

    function extensionOf(fileName) {
        const parts = fileName.toLowerCase().split('.');
        return parts.length > 1 ? parts.pop() : '';
    }

    function resetState() {
        pendingFiles = [];
        uploadedFileNames.clear();
        resultsList.innerHTML = '';
        fileCountTxt.textContent = '.psd, .pdf, .ai, images';
        fileCountTxt.style.color = 'rgba(26,26,26,0.4)';
        convertBtn.disabled = true;
        downloadAllBtn.disabled = true;
        downloadAllBtn.classList.remove('visible');
        downloadAllBtn.classList.add('hidden');
        dlCount.textContent = '';
        clearBtn.style.display = 'none';
    }

    function rowTemplate(file, ext) {
        const row = document.createElement('div');
        row.className = 'result-item';
        row.innerHTML =
            '<div class="item-preview">' + ext + '</div>' +
            '<div class="item-info">' +
                '<div class="item-title" title="' + file.name + '">' + truncateName(file.name) + '</div>' +
                '<div class="item-meta">' +
                    '<span style="text-transform: uppercase; font-weight: 700;">' + ext + '</span>' +
                    '<span class="meta-sep" style="margin: 0 4px;">-></span>' +
                    '<span class="status-info" style="opacity: 0.5;">En attente...</span>' +
                '</div>' +
            '</div>' +
            '<button class="icon-button btn-dl-single" disabled title="Telecharger">' +
                '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
            '</button>';
        return row;
    }

    function refreshCounter() {
        if (pendingFiles.length > 0) {
            fileCountTxt.textContent = pendingFiles.length + ' fichier(s) pret(s)';
            fileCountTxt.style.color = 'var(--accent)';
            convertBtn.disabled = false;
            clearBtn.style.display = 'inline-flex';
            dlCount.textContent = '';
            downloadAllBtn.disabled = true;
            downloadAllBtn.classList.remove('visible');
            downloadAllBtn.classList.add('hidden');
        }
    }

    function handleFiles(fileList) {
        Array.from(fileList).forEach(function (file) {
            if (uploadedFileNames.has(file.name)) return;

            const ext = extensionOf(file.name);
            uploadedFileNames.add(file.name);
            const row = rowTemplate(file, ext);
            resultsList.appendChild(row);
            pendingFiles.push({ file: file, row: row, ext: ext, converted: null, outputName: null });
        });

        refreshCounter();
    }

    async function getCanvasFromPDF(file) {
        if (!pdfjsLib) throw new Error('Librairie PDF indisponible');

        const url = URL.createObjectURL(file);
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
        URL.revokeObjectURL(url);
        return canvas;
    }

    async function getCanvasFromPSD(file) {
        const agPsd = await ensureAgPsd();
        if (agPsd) {
            try {
                const buffer = await file.arrayBuffer();
                const parsed = agPsd.readPsd(buffer, { skipLayerImageData: true });
                const composite = parsed && parsed.canvas;
                if (composite && typeof composite.getContext === 'function') {
                    return composite;
                }
            } catch (error) {
                // Fallback to legacy PSD parser below.
            }
        }

        let PSDLib = await ensurePSDLib();
        if (!PSDLib) throw new Error('Librairie PSD manquante');

        let psd;
        const url = URL.createObjectURL(file);
        try {
            psd = await PSDLib.fromURL(url);
        } catch (error) {
            if (typeof PSDLib.fromArrayBuffer === 'function') {
                const buffer = await file.arrayBuffer();
                psd = PSDLib.fromArrayBuffer(buffer);
                if (psd && typeof psd.parse === 'function') {
                    psd.parse();
                }
            } else {
                throw error;
            }
        } finally {
            URL.revokeObjectURL(url);
        }

        if (!psd || !psd.image || typeof psd.image.toPng !== 'function') {
            throw new Error('PSD non supporte ou invalide');
        }

        const img = psd.image.toPng();
        return new Promise(function (resolve, reject) {
            const canvas = document.createElement('canvas');

            function draw() {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                resolve(canvas);
            }

            if (img.complete) draw();
            else img.onload = draw;
            img.onerror = function () {
                reject(new Error('Impossible de rasteriser ce PSD'));
            };
        });
    }

    async function getCanvasFromImage(file) {
        const url = URL.createObjectURL(file);
        const img = new Image();

        return new Promise(function (resolve, reject) {
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                resolve(canvas);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    async function convertOne(item, targetFormat) {
        const statusInfo = item.row.querySelector('.status-info');
        statusInfo.textContent = 'Traitement...';

        const ext = item.ext;
        let finalBlob = null;

        if (targetFormat === 'pdf' && (ext === 'ai' || ext === 'pdf')) {
            finalBlob = item.file;
        } else {
            let canvas;
            if (ext === 'pdf' || ext === 'ai') canvas = await getCanvasFromPDF(item.file);
            else if (ext === 'psd') canvas = await getCanvasFromPSD(item.file);
            else canvas = await getCanvasFromImage(item.file);

            if (targetFormat === 'pdf' && jsPDF) {
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'l' : 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, canvas.width, canvas.height);
                finalBlob = pdf.output('blob');
            } else {
                const mime = targetFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
                if (targetFormat === 'jpeg') {
                    const ctx = canvas.getContext('2d');
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                finalBlob = await new Promise(function (resolve) {
                    canvas.toBlob(resolve, mime, 0.9);
                });
            }
        }

        const outputName = item.file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;
        const blobUrl = URL.createObjectURL(finalBlob);

        item.converted = blobUrl;
        item.outputName = outputName;

        statusInfo.innerHTML = '<span style="color: var(--positive); font-weight: 800; text-transform: uppercase;">' + targetFormat + '</span>';
        statusInfo.style.opacity = 1;

        const titleEl = item.row.querySelector('.item-title');
        titleEl.textContent = truncateName(outputName);
        titleEl.title = outputName;

        const dlBtn = item.row.querySelector('.btn-dl-single');
        dlBtn.disabled = false;
        dlBtn.onclick = function () {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = outputName;
            a.click();
        };

        return true;
    }

    dropZone.addEventListener('click', function () {
        fileInput.click();
    });

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
    });

    dropZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        dropZone.style.borderColor = '';
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.style.borderColor = '';
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', function (e) {
        handleFiles(e.target.files);
    });

    clearBtn.addEventListener('click', resetState);

    convertBtn.addEventListener('click', async function () {
        convertBtn.disabled = true;
        convertBtn.textContent = 'Traitement en cours...';

        const selected = document.querySelector('input[name="out-format"]:checked');
        const targetFormat = selected ? selected.value : 'png';

        let successCount = 0;
        for (const item of pendingFiles) {
            try {
                const ok = await convertOne(item, targetFormat);
                if (ok) successCount += 1;
            } catch (error) {
                const statusInfo = item.row.querySelector('.status-info');
                statusInfo.innerHTML = '<span style="color: var(--negative); font-weight: 700;">Erreur: ' + (error && error.message ? error.message : 'conversion impossible') + '</span>';
                statusInfo.style.opacity = 1;
            }
        }

        convertBtn.textContent = 'Convertir les fichiers';
        convertBtn.disabled = false;

        if (successCount > 0) {
            downloadAllBtn.disabled = false;
            downloadAllBtn.classList.remove('hidden');
            downloadAllBtn.classList.add('visible');
            dlCount.textContent = '(' + successCount + ')';
        } else {
            downloadAllBtn.disabled = true;
            downloadAllBtn.classList.remove('visible');
            downloadAllBtn.classList.add('hidden');
        }
    });

    downloadAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.btn-dl-single').forEach(function (btn, index) {
            if (!btn.disabled) {
                setTimeout(function () {
                    btn.click();
                }, index * 300);
            }
        });
    });

    resetState();

})();
