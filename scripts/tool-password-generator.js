(function () {
    if (!document.getElementById('password-card')) return;

    const lenValue = document.getElementById('len-value');
    const lenMinus = document.getElementById('len-minus');
    const lenPlus = document.getElementById('len-plus');
    const optLower = document.getElementById('opt-lower');
    const optUpper = document.getElementById('opt-upper');
    const optDigits = document.getElementById('opt-digits');
    const optSymbols = document.getElementById('opt-symbols');
    const optAmbiguous = document.getElementById('opt-ambiguous');
    const generateBtn = document.getElementById('generate-btn');
    const placeholder = document.getElementById('output-placeholder');
    const passwordCard = document.getElementById('password-card');
    const strengthBlock = document.getElementById('strength-block');
    const strengthMeter = document.getElementById('strength-meter');
    const strengthLabel = document.getElementById('strength-label');
    const strengthSub = document.getElementById('strength-sub');
    const copyBtn = document.getElementById('copy-all-btn');

    function t(key, fallback) {
        return window.GumiI18n ? window.GumiI18n.t(key) || fallback : fallback;
    }

    const MIN_LENGTH = 4;
    const MAX_LENGTH = 64;
    let passwordLength = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH,
        Number(window.GumiPrefs && window.GumiPrefs.get('pw-length', 16)) || 16));
    let currentPassword = '';

    const SETS = {
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        digits: '0123456789',
        symbols: '!@#$%^&*()-_=+[]{};:,.?/'
    };
    const AMBIGUOUS = /[0OlI1]/g;

    function updateLengthControls() {
        lenValue.textContent = String(passwordLength);
        lenMinus.disabled = passwordLength <= MIN_LENGTH;
        lenPlus.disabled = passwordLength >= MAX_LENGTH;
    }

    function activeSets() {
        const sets = [];
        if (optLower.checked) sets.push(SETS.lower);
        if (optUpper.checked) sets.push(SETS.upper);
        if (optDigits.checked) sets.push(SETS.digits);
        if (optSymbols.checked) sets.push(SETS.symbols);

        if (optAmbiguous.checked) {
            return sets
                .map(function (set) { return set.replace(AMBIGUOUS, ''); })
                .filter(function (set) { return set.length > 0; });
        }
        return sets;
    }

    // Unbiased random index via rejection sampling on crypto.getRandomValues.
    function randomIndex(max) {
        const limit = Math.floor(65536 / max) * max;
        const buffer = new Uint16Array(1);
        let value;
        do {
            crypto.getRandomValues(buffer);
            value = buffer[0];
        } while (value >= limit);
        return value % max;
    }

    function generatePassword(sets, length) {
        const pool = sets.join('');
        const chars = [];

        // One character from each selected set, so none is ever missing.
        sets.forEach(function (set) {
            chars.push(set[randomIndex(set.length)]);
        });

        while (chars.length < length) {
            chars.push(pool[randomIndex(pool.length)]);
        }

        // Fisher-Yates shuffle so the guaranteed characters aren't grouped first.
        for (let i = chars.length - 1; i > 0; i -= 1) {
            const j = randomIndex(i + 1);
            const tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
        }

        return chars.slice(0, length).join('');
    }

    function renderStrength(poolSize, length) {
        const entropy = Math.round(length * Math.log2(poolSize));

        let level, label;
        if (entropy < 40) { level = 1; label = t('pw_s1', 'Très faible'); }
        else if (entropy < 60) { level = 2; label = t('pw_s2', 'Faible'); }
        else if (entropy < 80) { level = 3; label = t('pw_s3', 'Correct'); }
        else if (entropy < 100) { level = 4; label = t('pw_s4', 'Solide'); }
        else { level = 5; label = t('pw_s5', 'Excellent'); }

        const levelClass = level <= 2 ? 'lvl-low' : level <= 3 ? 'lvl-mid' : 'lvl-high';
        Array.from(strengthMeter.children).forEach(function (segment, index) {
            segment.className = index < level ? 'on ' + levelClass : '';
        });

        strengthLabel.textContent = label;
        strengthLabel.style.color = level <= 2 ? 'var(--negative)' : level <= 3 ? 'var(--accent)' : 'var(--positive)';
        strengthSub.textContent = '~' + entropy + ' ' + t('pw_bits', 'bits d’entropie');
    }

    function generate() {
        const sets = activeSets();
        if (!sets.length) {
            if (window.showToolToast) window.showToolToast(t('pw_no_charset', 'Activez au moins un type de caractères.'), true);
            return;
        }

        currentPassword = generatePassword(sets, passwordLength);

        placeholder.style.display = 'none';
        passwordCard.style.display = 'block';
        passwordCard.textContent = currentPassword;
        strengthBlock.style.display = 'flex';
        renderStrength(sets.join('').length, passwordLength);

        generateBtn.textContent = t('pw_regenerate', 'Régénérer');
        copyBtn.disabled = false;
        copyBtn.classList.remove('hidden');
        copyBtn.classList.add('visible');
    }

    async function copyPassword() {
        if (!currentPassword) return;

        try {
            await navigator.clipboard.writeText(currentPassword);
        } catch (error) {
            const helper = document.createElement('textarea');
            helper.value = currentPassword;
            document.body.appendChild(helper);
            helper.select();
            document.execCommand('copy');
            helper.remove();
        }

        const copiedLabel = t('pw_copied', 'Copié !');
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' + copiedLabel;
        copyBtn.classList.add('success');

        setTimeout(function () {
            copyBtn.innerHTML = originalHtml;
            copyBtn.classList.remove('success');
        }, 2000);
    }

    lenMinus.addEventListener('click', function () {
        if (passwordLength > MIN_LENGTH) passwordLength -= 1;
        if (window.GumiPrefs) window.GumiPrefs.set('pw-length', passwordLength);
        updateLengthControls();
        if (currentPassword) generate();
    });

    lenPlus.addEventListener('click', function () {
        if (passwordLength < MAX_LENGTH) passwordLength += 1;
        if (window.GumiPrefs) window.GumiPrefs.set('pw-length', passwordLength);
        updateLengthControls();
        if (currentPassword) generate();
    });

    [optLower, optUpper, optDigits, optSymbols, optAmbiguous].forEach(function (input) {
        input.addEventListener('change', function () {
            if (currentPassword) generate();
        });
    });

    generateBtn.addEventListener('click', generate);
    passwordCard.addEventListener('click', copyPassword);
    copyBtn.addEventListener('click', copyPassword);

    updateLengthControls();

    // Show a password immediately so the tool is useful on arrival; the button
    // then reads "Régénérer" and acts as an explicit reroll.
    if (activeSets().length) generate();
})();
