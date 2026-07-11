(function () {
    if (!document.getElementById('compress-btn')) return;

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const compressBtn = document.getElementById('compress-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const fileCountTxt = document.getElementById('file-count');
    const clearBtn = document.getElementById('clear-btn');
    const resultsList = document.getElementById('results-list');
    const dlCount = document.getElementById('dl-count');
    const engineNote = document.getElementById('engine-note');
    const muteToggle = document.getElementById('mute-toggle');

    const ACCEPTED_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
    const DEFAULT_HINT = '.mp4, .mov, .avi, .webm, .mkv';

    // CRF/audio bitrate pairs: higher CRF = smaller file, lower quality.
    const QUALITY = {
        high: { crf: '22', audio: '160k' },
        medium: { crf: '27', audio: '128k' },
        strong: { crf: '32', audio: '96k' }
    };

    // Scale filters keep dimensions even (required by H.264) and cap the
    // smaller side for the 1080p/720p presets, portrait videos included.
    const SCALE = {
        original: 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        1080: "scale='if(gt(iw,ih),-2,min(1080,trunc(iw/2)*2))':'if(gt(iw,ih),min(1080,trunc(ih/2)*2),-2)'",
        720: "scale='if(gt(iw,ih),-2,min(720,trunc(iw/2)*2))':'if(gt(iw,ih),min(720,trunc(ih/2)*2),-2)'"
    };

    // Worker chunk is vendored next to the loader; the 31 MB core stays on
    // the CDN so the repo doesn't carry the wasm binary.
    const FFMPEG_UMD_BASE = '../scripts/vendor';
    const FFMPEG_CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';

    function t(key, fallback) {
        return window.GumiI18n ? window.GumiI18n.t(key) || fallback : fallback;
    }

    let pendingFiles = [];
    const uploadedFileNames = new Set();
    let ffmpeg = null;
    let loadingPromise = null;
    let isRunning = false;

    function truncateName(name, maxLength) {
        const limit = maxLength || 25;
        return name.length > limit ? name.substring(0, limit - 3) + '...' : name;
    }

    function extensionOf(fileName) {
        const parts = fileName.toLowerCase().split('.');
        return parts.length > 1 ? parts.pop() : '';
    }

    function formatBytes(bytes) {
        if (!bytes) return '0 KB';
        const k = 1024;
        if (bytes < k * k) return (bytes / k).toFixed(1) + ' KB';
        if (bytes < k * k * k) return (bytes / (k * k)).toFixed(2) + ' MB';
        return (bytes / (k * k * k)).toFixed(2) + ' GB';
    }

    function setEngineNote(msg) {
        engineNote.style.display = msg ? 'block' : 'none';
        engineNote.textContent = msg || '';
    }

    function resetState() {
        if (isRunning) return;
        pendingFiles = [];
        uploadedFileNames.clear();
        resultsList.innerHTML = '';
        fileCountTxt.textContent = DEFAULT_HINT;
        fileCountTxt.style.color = 'rgba(26,26,26,0.4)';
        compressBtn.disabled = true;
        hideDownloadAll();
        clearBtn.style.display = 'none';
    }

    function hideDownloadAll() {
        downloadAllBtn.disabled = true;
        downloadAllBtn.classList.remove('visible');
        downloadAllBtn.classList.add('hidden');
        dlCount.textContent = '';
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
                    '<span class="meta-sep">&bull;</span>' +
                    '<span>' + formatBytes(file.size) + '</span>' +
                    '<span class="meta-sep" style="margin: 0 4px;">-></span>' +
                    '<span class="status-info" style="opacity: 0.5;">En attente...</span>' +
                '</div>' +
            '</div>' +
            '<button class="icon-button btn-dl-single" disabled title="Télécharger">' +
                '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
            '</button>';
        return row;
    }

    function refreshCounter() {
        if (pendingFiles.length > 0) {
            fileCountTxt.textContent = pendingFiles.length + ' vidéo(s) prête(s)';
            fileCountTxt.style.color = 'var(--accent)';
            compressBtn.disabled = false;
            clearBtn.style.display = 'inline-flex';
            hideDownloadAll();
        }
    }

    function handleFiles(fileList) {
        Array.from(fileList).forEach(function (file) {
            const ext = extensionOf(file.name);
            if (ACCEPTED_EXTENSIONS.indexOf(ext) === -1) {
                if (window.showToolToast) window.showToolToast('Format non supporté : ' + file.name, true);
                return;
            }
            if (uploadedFileNames.has(file.name)) return;

            uploadedFileNames.add(file.name);
            const row = rowTemplate(file, ext);
            resultsList.appendChild(row);
            pendingFiles.push({ file: file, row: row, ext: ext, converted: null, outputName: null });
        });

        refreshCounter();
    }

    async function ensureFFmpeg() {
        if (ffmpeg) return ffmpeg;
        if (loadingPromise) return loadingPromise;

        if (!window.FFmpegWASM || !window.FFmpegUtil) {
            throw new Error('Moteur vidéo indisponible (CDN inaccessible)');
        }

        loadingPromise = (async function () {
            setEngineNote(t('vc_engine_loading', 'Chargement du moteur vidéo (~31 Mo), une seule fois...'));
            const toBlobURL = window.FFmpegUtil.toBlobURL;
            const instance = new window.FFmpegWASM.FFmpeg();

            await instance.load({
                coreURL: await toBlobURL(FFMPEG_CORE_BASE + '/ffmpeg-core.js', 'text/javascript'),
                wasmURL: await toBlobURL(FFMPEG_CORE_BASE + '/ffmpeg-core.wasm', 'application/wasm'),
                classWorkerURL: await toBlobURL(FFMPEG_UMD_BASE + '/814.ffmpeg.js', 'text/javascript')
            });

            setEngineNote('');
            ffmpeg = instance;
            return instance;
        })();

        try {
            return await loadingPromise;
        } catch (error) {
            loadingPromise = null;
            setEngineNote('');
            throw error;
        }
    }

    function readOptions() {
        const quality = document.querySelector('input[name="vc-quality"]:checked');
        const res = document.querySelector('input[name="vc-res"]:checked');
        return {
            quality: QUALITY[quality ? quality.value : 'medium'] || QUALITY.medium,
            scale: SCALE[res ? res.value : 'original'] || SCALE.original,
            mute: Boolean(muteToggle && muteToggle.checked)
        };
    }

    async function compressOne(item, opts, index) {
        const statusInfo = item.row.querySelector('.status-info');
        const engine = await ensureFFmpeg();

        const inputName = 'input-' + index + '.' + item.ext;
        const outputName = 'output-' + index + '.mp4';

        statusInfo.textContent = 'Préparation...';
        statusInfo.style.opacity = 1;
        await engine.writeFile(inputName, await window.FFmpegUtil.fetchFile(item.file));

        const onProgress = function (event) {
            const percent = Math.max(0, Math.min(100, Math.round((event.progress || 0) * 100)));
            statusInfo.textContent = 'Compression... ' + percent + '%';
        };
        engine.on('progress', onProgress);

        const args = ['-i', inputName, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', opts.quality.crf, '-vf', opts.scale, '-pix_fmt', 'yuv420p'];
        if (opts.mute) {
            args.push('-an');
        } else {
            args.push('-c:a', 'aac', '-b:a', opts.quality.audio);
        }
        args.push('-movflags', '+faststart', outputName);

        try {
            await engine.exec(args);
        } finally {
            engine.off('progress', onProgress);
        }

        const data = await engine.readFile(outputName);
        await engine.deleteFile(inputName).catch(function () {});
        await engine.deleteFile(outputName).catch(function () {});

        if (!data || !data.byteLength) {
            throw new Error('compression impossible pour ce fichier');
        }

        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const finalName = item.file.name.replace(/\.[^/.]+$/, '') + '-compressed.mp4';
        const blobUrl = URL.createObjectURL(blob);

        item.converted = blobUrl;
        item.outputName = finalName;

        const diffPercent = (((blob.size - item.file.size) / item.file.size) * 100).toFixed(1);
        const colorClass = blob.size < item.file.size ? 'gain' : 'loss';
        const diffSign = diffPercent > 0 ? '+' : '';

        statusInfo.innerHTML =
            '<span style="color: var(--positive); font-weight: 800;">MP4</span>' +
            ' <span class="meta-sep">&bull;</span> ' + formatBytes(blob.size) +
            ' <span class="meta-sep">&bull;</span> <span class="' + colorClass + '">' + diffSign + diffPercent + '%</span>';

        const titleEl = item.row.querySelector('.item-title');
        titleEl.textContent = truncateName(finalName);
        titleEl.title = finalName;

        const dlBtn = item.row.querySelector('.btn-dl-single');
        dlBtn.disabled = false;
        dlBtn.onclick = function () {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = finalName;
            a.click();
        };

        return true;
    }

    dropZone.addEventListener('click', function () {
        fileInput.click();
    });

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', function (e) {
        handleFiles(e.target.files);
        fileInput.value = '';
    });

    clearBtn.addEventListener('click', resetState);

    compressBtn.addEventListener('click', async function () {
        if (isRunning) return;
        isRunning = true;

        const idleLabel = compressBtn.textContent;
        compressBtn.disabled = true;
        compressBtn.textContent = t('vc_compressing', 'Compression en cours...');

        const opts = readOptions();
        let successCount = 0;

        for (let i = 0; i < pendingFiles.length; i += 1) {
            const item = pendingFiles[i];
            if (item.converted) {
                successCount += 1;
                continue;
            }

            try {
                await compressOne(item, opts, i);
                successCount += 1;
            } catch (error) {
                const statusInfo = item.row.querySelector('.status-info');
                statusInfo.innerHTML = '<span style="color: var(--negative); font-weight: 700;">Erreur: ' + (error && error.message ? error.message : 'compression impossible') + '</span>';
                statusInfo.style.opacity = 1;
            }
        }

        compressBtn.textContent = idleLabel;
        compressBtn.disabled = pendingFiles.length === 0;
        isRunning = false;

        if (successCount > 0) {
            downloadAllBtn.disabled = false;
            downloadAllBtn.classList.remove('hidden');
            downloadAllBtn.classList.add('visible');
            dlCount.textContent = '(' + successCount + ')';
        } else {
            hideDownloadAll();
        }
    });

    downloadAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.btn-dl-single').forEach(function (btn, index) {
            if (!btn.disabled) {
                setTimeout(function () {
                    btn.click();
                }, index * 400);
            }
        });
    });

    resetState();
})();
