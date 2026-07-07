(function () {
    if (!document.getElementById('urlInput')) return;

    const urlInput = document.getElementById('urlInput');
    const generateBtn = document.getElementById('generate-btn');
    const resultArea = document.getElementById('resultArea');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const formatBtns = document.querySelectorAll('.format-btn');
    const thumbToggle = document.getElementById('thumb-toggle');
    const dlCount = document.getElementById('dl-count');
    const API_BASE = window.location.protocol === 'file:'
        ? 'http://localhost:10000/api/get-video'
        : '/api/get-video';

    let fetchCache = new Map();
    let requestedUrls = new Set();

    function extractUrls(text) {
        const regex = /(https?:\/\/[^\s<>"']+)/g;
        return text.match(regex) || [];
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    }

    function selectedFormat() {
        const active = document.querySelector('.format-btn.active');
        return active ? active.dataset.value : 'video_audio';
    }

    function thumbEnabled() {
        return Boolean(thumbToggle && thumbToggle.checked);
    }

    function setGenerateIdle() {
        generateBtn.textContent = 'Extraire les medias';
        generateBtn.disabled = extractUrls(urlInput.value).length === 0;
    }

    function renderUI() {
        if (requestedUrls.size === 0) {
            resultArea.innerHTML = '<div class="status-container"><svg viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: currentColor; fill: none; stroke-width: 1.5; opacity: 0.4; margin-bottom: 0.5rem;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>En attente de liens...</div>';
            downloadAllBtn.classList.remove('visible');
            downloadAllBtn.classList.add('hidden');
            setGenerateIdle();
            return;
        }

        let html = '<div style="display:flex; flex-direction:column; gap:1rem; width:100%;">';
        let readyCount = 0;
        let loadingCount = 0;

        requestedUrls.forEach(function (url) {
            const item = fetchCache.get(url);
            if (!item) return;

            if (item.status === 'loading' || item.status === 'warming') loadingCount += 1;
            if (item.status === 'done') readyCount += 1;

            let thumbHtml = '';
            if (item.status === 'loading' || item.status === 'warming') {
                thumbHtml = '<div class="preview-thumb"><span class="loader-small"></span></div>';
            } else if (item.status === 'error') {
                thumbHtml = '<div class="preview-thumb"><svg viewBox="0 0 24 24" style="width:24px; stroke:var(--negative); fill:none; stroke-width:2;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>';
            } else if (item.data && item.data.thumbnailLink) {
                thumbHtml = '<div class="preview-thumb"><img src="' + escapeHtml(item.data.thumbnailLink) + '" referrerpolicy="no-referrer" alt="preview"/></div>';
            } else {
                thumbHtml = '<div class="preview-thumb"><svg viewBox="0 0 24 24" style="width:24px; stroke:rgba(26,26,26,0.4); fill:none; stroke-width:2;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>';
            }

            const extLabel = item.status === 'done' ? (item.requestedFormat === 'audio_only' ? 'MP3' : 'MP4') : '';
            const statusText = item.status === 'loading'
                ? 'Extraction en cours...'
                : item.status === 'warming'
                    ? (item.errorMessage || 'Reveil du serveur Render...')
                : item.status === 'error'
                    ? (item.errorMessage || 'Erreur de lecture')
                    : 'Media pret <span style="opacity:0.6; font-size: 0.8em;">(' + extLabel + ')</span>';
            const statusColor = item.status === 'done'
                ? 'var(--positive)'
                : item.status === 'warming'
                    ? 'var(--accent)'
                : item.status === 'error'
                    ? 'var(--negative)'
                    : 'inherit';

            const actionBtn = item.status === 'done' && item.data && item.data.directLink
                ? '<button class="icon-button btn-dl-one" data-url="' + escapeHtml(item.data.directLink) + '" data-ext="' + extLabel.toLowerCase() + '" title="Telecharger"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>'
                : '';

            html += '<div class="preview-card">' + thumbHtml + '<div class="preview-info"><div class="preview-title" title="' + escapeHtml(url) + '">' + escapeHtml(url) + '</div><div style="font-size:0.85rem; font-weight:700; opacity:0.8; color:' + statusColor + '">' + statusText + '</div></div>' + actionBtn + '</div>';
        });

        html += '</div>';
        resultArea.innerHTML = html;

        if (loadingCount > 0) {
            generateBtn.innerHTML = '<span class="loader-btn" style="border-color:rgba(255,255,255,0.2); border-bottom-color:#fff;"></span> Extraction en cours...';
            generateBtn.disabled = true;
        } else if (readyCount > 0) {
            generateBtn.innerHTML = 'OK ' + readyCount + ' media(s) extrait(s)';
            generateBtn.disabled = false;
        } else {
            generateBtn.textContent = 'Reessayer l\'extraction';
            generateBtn.disabled = false;
        }

        if (readyCount > 0) {
            downloadAllBtn.classList.remove('hidden');
            downloadAllBtn.classList.add('visible');
            dlCount.textContent = String(readyCount);
        } else {
            downloadAllBtn.classList.remove('visible');
            downloadAllBtn.classList.add('hidden');
        }
    }

    async function fetchMedia(url, retryCount) {
        const attempt = typeof retryCount === 'number' ? retryCount : 0;
        const format = selectedFormat();
        const thumb = thumbEnabled();

        fetchCache.set(url, { status: 'loading', data: null, requestedFormat: format });
        if (requestedUrls.has(url)) renderUI();

        const backendUrl = API_BASE + '?url=' + encodeURIComponent(url) + '&format=' + encodeURIComponent(format) + '&thumb=' + encodeURIComponent(String(thumb));
        try {
            const response = await fetch(backendUrl);
            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.error || 'Erreur API');
            fetchCache.set(url, { status: 'done', data: data, requestedFormat: format });
        } catch (error) {
            const onLocalFile = window.location.protocol === 'file:';
            if (!onLocalFile && attempt < 4) {
                const nextAttempt = attempt + 1;
                const waitMs = 1500 * Math.pow(2, attempt);

                fetchCache.set(url, {
                    status: 'warming',
                    data: null,
                    requestedFormat: format,
                    errorMessage: 'Reveil du serveur Render... tentative ' + nextAttempt + '/5'
                });
                if (requestedUrls.has(url)) renderUI();

                setTimeout(function () {
                    fetchMedia(url, nextAttempt);
                }, waitMs);
                return;
            }

            const msg = onLocalFile
                ? 'Serveur API indisponible (lancez: node server.js)'
                : 'Erreur API / lien non pris en charge';
            fetchCache.set(url, { status: 'error', data: null, requestedFormat: format, errorMessage: msg });
        }

        if (requestedUrls.has(url)) renderUI();
    }

    function forceRefetch() {
        fetchCache.clear();
        const currentUrls = extractUrls(urlInput.value);
        currentUrls.forEach(function (url) {
            fetchMedia(url);
        });
        if (requestedUrls.size > 0) renderUI();
    }

    async function safeDownload(url, isFallback, ext) {
        try {
            const res = await fetch(url, { mode: 'cors' });
            if (!res.ok) throw new Error('CORS bloque');
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = 'gumi_media_' + Date.now() + '.' + (ext || 'mp4');
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
            if (!isFallback && window.showToolToast) window.showToolToast('Telechargement lance avec succes !', false);
        } catch (error) {
            window.open(url, '_blank', 'noopener');
            if (!isFallback && window.showToolToast) window.showToolToast('Fichier ouvert en securite. (Clic droit > Enregistrer sous...)', false);
        }
    }

    formatBtns.forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            formatBtns.forEach(function (b) { b.classList.remove('active'); });
            event.currentTarget.classList.add('active');
            forceRefetch();
        });
    });

    if (thumbToggle) {
        thumbToggle.addEventListener('change', forceRefetch);
    }

    urlInput.addEventListener('input', function () {
        const currentUrls = extractUrls(urlInput.value);
        currentUrls.forEach(function (url) {
            if (!fetchCache.has(url)) fetchMedia(url);
        });

        generateBtn.disabled = currentUrls.length === 0;
        if (currentUrls.length === 0) {
            requestedUrls.clear();
            renderUI();
        } else {
            const requestedArr = Array.from(requestedUrls);
            const sameUrls = currentUrls.length === requestedArr.length && currentUrls.every(function (u) { return requestedArr.includes(u); });
            if (!sameUrls) setGenerateIdle();
        }

        if (window.autoGrowTextarea) window.autoGrowTextarea(urlInput, 140);
    });

    generateBtn.addEventListener('click', function () {
        const currentUrls = extractUrls(urlInput.value);
        if (!currentUrls.length) return;

        requestedUrls = new Set(currentUrls);
        currentUrls.forEach(function (url) {
            const item = fetchCache.get(url);
            if (!item || item.status === 'error') fetchMedia(url);
        });
        renderUI();
    });

    resultArea.addEventListener('click', function (event) {
        const button = event.target.closest('.btn-dl-one');
        if (!button) return;

        const url = button.getAttribute('data-url');
        const ext = button.getAttribute('data-ext') || 'mp4';
        if (url) safeDownload(url, false, ext);
    });

    downloadAllBtn.addEventListener('click', async function () {
        if (downloadAllBtn.disabled) return;

        let openedCount = 0;
        for (const url of requestedUrls) {
            const item = fetchCache.get(url);
            if (item && item.status === 'done' && item.data && item.data.directLink) {
                const ext = item.requestedFormat === 'audio_only' ? 'mp3' : 'mp4';
                await safeDownload(item.data.directLink, true, ext);
                openedCount += 1;

                if (thumbEnabled() && item.data.thumbnailLink) {
                    setTimeout(function () {
                        safeDownload(item.data.thumbnailLink, true, 'jpg');
                    }, 500);
                }

                await new Promise(function (resolve) {
                    setTimeout(resolve, 800);
                });
            }
        }

        if (openedCount > 0 && window.showToolToast) {
            window.showToolToast('Telechargements en cours.', false);
        } else if (openedCount === 0 && window.showToolToast) {
            window.showToolToast('Aucun media pret. Verifiez le lien ou l\'API.', true);
        }
    });

    if (window.autoGrowTextarea) window.autoGrowTextarea(urlInput, 140);
    setGenerateIdle();
})();
