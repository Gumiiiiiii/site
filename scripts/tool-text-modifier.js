(function () {
    if (!document.getElementById('source-text')) return;

    const sourceText = document.getElementById('source-text');
    const resultText = document.getElementById('result-text');
    const targetWordsInput = document.getElementById('target-words');
    const searchInput = document.getElementById('search-input');
    const replaceInput = document.getElementById('replace-input');
    const modifierBtns = document.querySelectorAll('.modifier-btn');
    const copyBtn = document.getElementById('copy-all-btn');

    const wordCountEl = document.getElementById('word-count');
    const charCountEl = document.getElementById('char-count');
    const lineCountEl = document.getElementById('line-count');

    const activeActions = new Set();
    const baseActions = ['uppercase', 'lowercase', 'capitalize', 'sentence', 'slugify'];

    const transforms = {
        uppercase: function (txt) { return txt.toUpperCase(); },
        lowercase: function (txt) { return txt.toLowerCase(); },
        capitalize: function (txt) { return txt.replace(/\b\w/g, function (l) { return l.toUpperCase(); }); },
        sentence: function (txt) { return txt.replace(/(^\s*\w|[.?!]\s*\w)/g, function (c) { return c.toUpperCase(); }); },
        slugify: function (txt) {
            return txt
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },
        clean: function (txt) { return txt.replace(/\s+/g, ' ').trim(); },
        removeAccents: function (txt) { return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); },
        targetUpper: function (txt, targets) {
            if (!targets.length) return txt;
            const regex = new RegExp('(?<![\\p{L}\\p{N}_])(' + targets.join('|') + ')(?![\\p{L}\\p{N}_])', 'giu');
            return txt.replace(regex, function (match) { return match.toUpperCase(); });
        },
        targetBold: function (txt, targets) {
            if (!targets.length) return txt;
            const regex = new RegExp('(?<![\\p{L}\\p{N}_])(' + targets.join('|') + ')(?![\\p{L}\\p{N}_])', 'giu');
            return txt.replace(regex, function (match) { return '**' + match + '**'; });
        }
    };

    function updateStats(text) {
        charCountEl.textContent = String(text.length);
        wordCountEl.textContent = text.trim() === '' ? '0' : String(text.trim().split(/\s+/).length);
        lineCountEl.textContent = text === '' ? '0' : String(text.split(/\r\n|\r|\n/).length);
    }

    function escapeRegExp(input) {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function applyTransform() {
        let text = sourceText.value;

        if (searchInput.value) {
            text = text.split(searchInput.value).join(replaceInput.value);
        }

        const targets = targetWordsInput.value
            .split(',')
            .map(function (word) { return escapeRegExp(word.trim()); })
            .filter(function (word) { return word.length > 0; });

        if (activeActions.has('removeAccents')) text = transforms.removeAccents(text);
        if (activeActions.has('clean')) text = transforms.clean(text);

        if (activeActions.has('slugify')) text = transforms.slugify(text);
        else if (activeActions.has('uppercase')) text = transforms.uppercase(text);
        else if (activeActions.has('lowercase')) text = transforms.lowercase(text);
        else if (activeActions.has('capitalize')) text = transforms.capitalize(text);
        else if (activeActions.has('sentence')) text = transforms.sentence(text);

        if (activeActions.has('targetUpper')) text = transforms.targetUpper(text, targets);
        if (activeActions.has('targetBold')) text = transforms.targetBold(text, targets);

        resultText.value = text;
        updateStats(text);

        if (copyBtn) {
            if (text.trim().length > 0) {
                copyBtn.classList.remove('hidden');
                copyBtn.classList.add('visible');
            } else {
                copyBtn.classList.remove('visible');
                copyBtn.classList.add('hidden');
            }
        }

        if (window.autoGrowTextarea) {
            window.autoGrowTextarea(sourceText, 180);
            window.autoGrowTextarea(resultText, 180);
        }

        const advHeader = document.querySelector('.advanced-header');
        const content = document.getElementById('adv-content');
        if (advHeader && content && advHeader.classList.contains('open')) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    }

    [sourceText, targetWordsInput, searchInput, replaceInput].forEach(function (el) {
        el.addEventListener('input', applyTransform);
    });

    modifierBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const action = btn.dataset.action;

            if (activeActions.has(action)) {
                activeActions.delete(action);
                btn.classList.remove('active');
            } else {
                if (baseActions.includes(action)) {
                    baseActions.forEach(function (baseAction) {
                        activeActions.delete(baseAction);
                        const relatedBtn = document.querySelector('[data-action="' + baseAction + '"]');
                        if (relatedBtn) relatedBtn.classList.remove('active');
                    });
                }
                activeActions.add(action);
                btn.classList.add('active');
            }

            applyTransform();
        });
    });

    copyBtn.addEventListener('click', async function () {
        if (!resultText.value) return;

        try {
            await navigator.clipboard.writeText(resultText.value);
        } catch (error) {
            resultText.select();
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
        }

        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>Copie !';
        copyBtn.classList.add('success');

        setTimeout(function () {
            copyBtn.innerHTML = originalHtml;
            copyBtn.classList.remove('success');
        }, 2000);
    });

    updateStats('');
    applyTransform();
})();
