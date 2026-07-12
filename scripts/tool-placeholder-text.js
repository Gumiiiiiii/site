(function () {
    if (!document.getElementById('output-panel')) return;

    const countValue = document.getElementById('count-value');
    const countMinus = document.getElementById('count-minus');
    const countPlus = document.getElementById('count-plus');
    const generateBtn = document.getElementById('generate-btn');
    const outputPanel = document.getElementById('output-panel');
    const outputPlaceholder = document.getElementById('output-placeholder');
    const statsContainer = document.getElementById('stats-container');
    const paraCountEl = document.getElementById('para-count');
    const wordCountEl = document.getElementById('word-count');
    const charCountEl = document.getElementById('char-count');
    const copyBtn = document.getElementById('copy-all-btn');

    const MIN_PARAGRAPHS = 1;
    const MAX_PARAGRAPHS = 20;
    let paragraphCount = Math.max(MIN_PARAGRAPHS, Math.min(MAX_PARAGRAPHS,
        Number(window.GumiPrefs && window.GumiPrefs.get('ph-count', 3)) || 3));
    let currentText = '';

    const WORDS = {
        lorem: [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
            'eiusmod', 'tempor', 'incididunt', 'labore', 'dolore', 'magna', 'aliqua', 'enim', 'minim',
            'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'commodo',
            'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum',
            'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'proident', 'sunt',
            'culpa', 'officia', 'deserunt', 'mollit', 'anim', 'laborum', 'perspiciatis', 'unde', 'omnis',
            'natus', 'error', 'voluptatem', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
            'aperiam', 'eaque', 'ipsa', 'quae', 'illo', 'inventore', 'veritatis', 'quasi', 'architecto',
            'beatae', 'vitae', 'dicta', 'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur'
        ],
        en: [
            'the', 'design', 'system', 'creates', 'simple', 'layout', 'with', 'clear', 'content', 'every',
            'section', 'brings', 'together', 'ideas', 'and', 'structure', 'while', 'keeping', 'balance',
            'between', 'space', 'typography', 'each', 'element', 'should', 'feel', 'light', 'but', 'precise',
            'when', 'people', 'read', 'this', 'text', 'they', 'focus', 'on', 'shape', 'rather', 'than',
            'meaning', 'because', 'words', 'here', 'only', 'hold', 'place', 'for', 'real', 'story', 'that',
            'will', 'come', 'later', 'good', 'rhythm', 'makes', 'page', 'easy', 'to', 'scan', 'strong',
            'titles', 'guide', 'reader', 'through', 'flow', 'of', 'sections', 'nothing', 'more', 'useful',
            'than', 'honest', 'draft', 'built', 'from', 'small', 'parts', 'working', 'quietly'
        ],
        fr: [
            'le', 'projet', 'prend', 'forme', 'avec', 'des', 'idées', 'simples', 'et', 'une', 'structure',
            'claire', 'chaque', 'section', 'apporte', 'un', 'équilibre', 'entre', 'espace', 'texte', 'les',
            'mots', 'posés', 'ici', 'ne', 'servent', 'que', 'de', 'repère', 'pour', 'la', 'mise', 'en',
            'page', 'car', 'vraie', 'histoire', 'viendra', 'plus', 'tard', 'quand', 'on', 'regarde', 'cette',
            'maquette', 'œil', 'suit', 'rythme', 'lignes', 'sans', 'chercher', 'sens', 'bon', 'gabarit',
            'rend', 'lecture', 'facile', 'titres', 'guident', 'lecteur', 'travers', 'contenu', 'rien', 'est',
            'utile', 'brouillon', 'honnête', 'construit', 'petites', 'touches', 'discrètes', 'élégantes',
            'dans', 'esprit', 'du', 'site', 'couleurs', 'douces', 'matières', 'papier'
        ]
    };

    // Sentences per paragraph, by selected size.
    const SIZES = {
        short: [2, 3],
        medium: [4, 6],
        long: [7, 10]
    };

    function randomInt(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function pick(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function buildSentence(bank) {
        const wordCount = randomInt(7, 15);
        const words = [];
        let previous = '';

        for (let i = 0; i < wordCount; i += 1) {
            let word = pick(bank);
            while (word === previous) word = pick(bank);
            previous = word;
            words.push(word);
        }

        // Occasional comma to make the rhythm feel natural.
        if (wordCount > 9) {
            const commaAt = randomInt(3, wordCount - 4);
            words[commaAt] += ',';
        }

        let sentence = words.join(' ');
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        return sentence + '.';
    }

    function buildParagraph(lang, size, isFirst) {
        const range = SIZES[size] || SIZES.medium;
        const sentenceCount = randomInt(range[0], range[1]);
        const sentences = [];

        // The classic opening keeps lorem output instantly recognizable.
        if (lang === 'lorem' && isFirst) {
            sentences.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
        }

        while (sentences.length < sentenceCount) {
            sentences.push(buildSentence(WORDS[lang] || WORDS.lorem));
        }

        return sentences.join(' ');
    }

    function selectedValue(name, fallback) {
        const checked = document.querySelector('input[name="' + name + '"]:checked');
        return checked ? checked.value : fallback;
    }

    function updateCountControls() {
        countValue.textContent = String(paragraphCount);
        countMinus.disabled = paragraphCount <= MIN_PARAGRAPHS;
        countPlus.disabled = paragraphCount >= MAX_PARAGRAPHS;
    }

    function updateStats(paragraphs, text) {
        paraCountEl.textContent = String(paragraphs.length);
        wordCountEl.textContent = String(text.trim().split(/\s+/).length);
        charCountEl.textContent = String(text.length);
    }

    function generate() {
        const lang = selectedValue('ph-lang', 'lorem');
        const size = selectedValue('ph-size', 'medium');
        const paragraphs = [];

        for (let i = 0; i < paragraphCount; i += 1) {
            paragraphs.push(buildParagraph(lang, size, i === 0));
        }

        currentText = paragraphs.join('\n\n');

        outputPanel.innerHTML = '';
        paragraphs.forEach(function (paragraph) {
            const p = document.createElement('p');
            p.textContent = paragraph;
            outputPanel.appendChild(p);
        });

        outputPlaceholder.style.display = 'none';
        outputPanel.style.display = 'flex';
        statsContainer.style.display = 'flex';
        updateStats(paragraphs, currentText);

        copyBtn.disabled = false;
        copyBtn.classList.remove('hidden');
        copyBtn.classList.add('visible');
    }

    countMinus.addEventListener('click', function () {
        if (paragraphCount > MIN_PARAGRAPHS) paragraphCount -= 1;
        if (window.GumiPrefs) window.GumiPrefs.set('ph-count', paragraphCount);
        updateCountControls();
    });

    countPlus.addEventListener('click', function () {
        if (paragraphCount < MAX_PARAGRAPHS) paragraphCount += 1;
        if (window.GumiPrefs) window.GumiPrefs.set('ph-count', paragraphCount);
        updateCountControls();
    });

    generateBtn.addEventListener('click', generate);

    copyBtn.addEventListener('click', async function () {
        if (!currentText) return;

        try {
            await navigator.clipboard.writeText(currentText);
        } catch (error) {
            const helper = document.createElement('textarea');
            helper.value = currentText;
            document.body.appendChild(helper);
            helper.select();
            document.execCommand('copy');
            helper.remove();
        }

        const copiedLabel = window.GumiI18n ? window.GumiI18n.t('ph_copied') : 'Copié !';
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' + copiedLabel;
        copyBtn.classList.add('success');

        setTimeout(function () {
            copyBtn.innerHTML = originalHtml;
            copyBtn.classList.remove('success');
        }, 2000);
    });

    updateCountControls();
})();
