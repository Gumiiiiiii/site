(function () {
    function closeTooltip(wrapper) {
        wrapper.classList.remove('active');
        const trigger = wrapper.querySelector('.tooltip-icon');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('click', function (event) {
        document.querySelectorAll('.tooltip-wrapper.active').forEach(function (wrapper) {
            if (!wrapper.contains(event.target)) {
                closeTooltip(wrapper);
            }
        });
    });

    // Escape closes any open tooltip and returns focus to its trigger.
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        document.querySelectorAll('.tooltip-wrapper.active').forEach(function (wrapper) {
            closeTooltip(wrapper);
            const trigger = wrapper.querySelector('.tooltip-icon');
            if (trigger) trigger.focus();
        });
    });

    window.toggleTooltip = function (event) {
        event.stopPropagation();
        const trigger = event.currentTarget;
        const wrapper = trigger.closest('.tooltip-wrapper');
        if (!wrapper) return;
        const isActive = wrapper.classList.toggle('active');
        trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    };

    window.toggleAdvanced = function () {
        const header = document.querySelector('.advanced-header');
        const content = document.getElementById('adv-content');
        if (!header || !content) return;

        header.classList.toggle('open');
        content.style.maxHeight = header.classList.contains('open') ? content.scrollHeight + 'px' : '0px';
    };

    window.showToolToast = function (msg, isError) {
        const toast = document.createElement('div');
        toast.className = 'toast';

        const icon = isError
            ? '<svg viewBox="0 0 24 24" style="width: 20px; stroke: var(--negative); fill: none; stroke-width: 2.5; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
            : '<svg viewBox="0 0 24 24" style="width: 20px; stroke: var(--positive); fill: none; stroke-width: 2.5; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';

        toast.innerHTML = icon + ' <span>' + msg + '</span>';
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.classList.add('show');
        }, 10);

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                toast.remove();
            }, 400);
        }, 3500);
    };

    window.autoGrowTextarea = function (element, minHeight) {
        if (!element) return;
        element.style.height = 'auto';
        if (!element.value) {
            element.style.height = (minHeight || 140) + 'px';
            return;
        }
        element.style.height = element.scrollHeight + 'px';
    };

    // Per-tool preference storage: each tool page gets one localStorage entry
    // keyed by its path (the /en prefix is stripped so both languages share
    // the same preferences). Settings only, never user content.
    window.GumiPrefs = (function () {
        const KEY = 'gumi-prefs:' + window.location.pathname.replace(/^\/en(?=\/|$)/, '');

        function read() {
            try {
                return JSON.parse(localStorage.getItem(KEY)) || {};
            } catch (err) {
                return {};
            }
        }

        function write(prefs) {
            try {
                localStorage.setItem(KEY, JSON.stringify(prefs));
            } catch (err) {
                // Storage full or blocked: preferences just don't persist.
            }
        }

        return {
            read,
            get(name, fallback) {
                const prefs = read();
                return name in prefs ? prefs[name] : fallback;
            },
            set(name, value) {
                const prefs = read();
                prefs[name] = value;
                write(prefs);
            }
        };
    })();

    // Auto-persistence for the common controls: radios (by name) and
    // checkboxes (by id) are restored on load and saved on change. Restores
    // dispatch a change event so dependent UI (disabled inputs, sliders)
    // stays consistent. Runs on DOMContentLoaded, after the tool scripts
    // have built any dynamic controls.
    function autoPersistInputs() {
        const prefs = window.GumiPrefs.read();

        Object.keys(prefs).forEach(function (key) {
            if (key.indexOf('radio:') === 0) {
                const el = document.querySelector(
                    'input[type="radio"][name="' + CSS.escape(key.slice(6)) + '"][value="' + CSS.escape(String(prefs[key])) + '"]'
                );
                if (el && !el.hasAttribute('data-no-persist') && !el.checked) {
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else if (key.indexOf('check:') === 0) {
                const el = document.getElementById(key.slice(6));
                if (el && !el.hasAttribute('data-no-persist') && el.type === 'checkbox' && el.checked !== prefs[key]) {
                    el.checked = Boolean(prefs[key]);
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        // Controls a tool manages itself (e.g. because it also syncs them to
        // the URL) opt out with data-no-persist so this generic layer doesn't
        // fight the tool's own restore logic.
        document.addEventListener('change', function (event) {
            const el = event.target;
            if (!(el instanceof HTMLInputElement) || el.hasAttribute('data-no-persist')) return;
            if (el.type === 'radio' && el.name) {
                window.GumiPrefs.set('radio:' + el.name, el.value);
            } else if (el.type === 'checkbox' && el.id) {
                window.GumiPrefs.set('check:' + el.id, el.checked);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoPersistInputs);
    } else {
        autoPersistInputs();
    }

    // Clipboard image paste: calls back with the first image File found when
    // the user pastes (Ctrl/Cmd+V) anywhere on the page, unless focus is in a
    // text field. Lets the image tools accept a screenshot without saving it.
    window.GumiPaste = {
        onImage(callback) {
            document.addEventListener('paste', function (event) {
                // Only ever acts on an image in the clipboard; a text paste has
                // no image item, so text fields keep their normal behavior.
                const items = (event.clipboardData && event.clipboardData.items) || [];
                for (const item of items) {
                    if (item.kind === 'file' && item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        if (file) {
                            event.preventDefault();
                            callback(file);
                            return;
                        }
                    }
                }
            });
        }
    };

    // Shareable tool state through the URL query string. Tools register their
    // parameters; state is read on load (URL wins over saved prefs) and the
    // URL is kept in sync via history.replaceState so it can be copied/shared.
    window.GumiUrlState = {
        read() {
            return new URLSearchParams(window.location.search);
        },
        get(name) {
            const value = this.read().get(name);
            return value === null ? undefined : value;
        },
        // Merge the given key/values into the query string without reloading.
        set(values) {
            const params = this.read();
            Object.keys(values).forEach(function (key) {
                const v = values[key];
                if (v === null || v === undefined || v === '') params.delete(key);
                else params.set(key, String(v));
            });
            const qs = params.toString();
            const url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
            try {
                window.history.replaceState(null, '', url);
            } catch (err) {
                // Some sandboxed contexts refuse replaceState; sharing just
                // won't reflect the latest state, which is non-fatal.
            }
        },
        // Absolute URL for the current state, for a "copy link" button.
        shareUrl() {
            return window.location.href;
        }
    };

    // Custom color picker popover, replacing the native <input type="color">
    // dialog so the tools keep one visual language. One popover is shared by
    // every trigger on the page. Usage:
    //   GumiColorPicker.attach(button, { get: () => '#AABBCC', onChange: (hex) => {} })
    //
    // The opacity track is opt-in, per trigger:
    //   GumiColorPicker.attach(button, { alpha: true, get, onChange: (hex, a) => {} })
    // With `alpha`, get() may return #RRGGBBAA and onChange receives the
    // opacity as a second argument (0..1) alongside the 8-digit hex. Triggers
    // that don't ask for it never see the track and keep getting plain
    // 6-digit hex, so the palette and QR tools are untouched.
    const ColorPicker = (function () {
        let panel = null;
        let svArea = null;
        let svThumb = null;
        let hueTrack = null;
        let hueThumb = null;
        let alphaTrack = null;
        let alphaTeinte = null;
        let alphaThumb = null;
        let hexInput = null;
        let preview = null;
        let current = { h: 0, s: 0, v: 0, a: 1 };
        let activeOpts = null;
        let activeTrigger = null;

        function alphaOn() {
            return !!(activeOpts && activeOpts.alpha);
        }

        function hsvToRgb(h, s, v) {
            const f = (n) => {
                const k = (n + h / 60) % 6;
                return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
            };
            return [f(5), f(3), f(1)].map((c) => Math.round(c * 255));
        }

        function rgbToHsv(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;
            let h = 0;
            if (d) {
                if (max === r) h = 60 * (((g - b) / d) % 6);
                else if (max === g) h = 60 * ((b - r) / d + 2);
                else h = 60 * ((r - g) / d + 4);
            }
            if (h < 0) h += 360;
            return { h, s: max ? d / max : 0, v: max };
        }

        function rgbToHex(rgb) {
            return '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
        }

        // The value the caller is handed. Opaque, or a trigger that never asked
        // for opacity, gets the plain 6-digit form it has always had; only a
        // real transparency widens it to 8 digits.
        function sortie() {
            const hex = rgbToHex(hsvToRgb(current.h, current.s, current.v));
            if (!alphaOn() || current.a >= 1) return hex;
            return hex + Math.round(current.a * 255).toString(16).padStart(2, '0').toUpperCase();
        }

        function hexToRgb(value) {
            const raw = String(value || '').trim().replace(/^#/, '');
            if (/^[0-9a-f]{3}$/i.test(raw)) return raw.split('').map((c) => parseInt(c + c, 16));
            if (/^[0-9a-f]{6}$/i.test(raw) || /^[0-9a-f]{8}$/i.test(raw)) {
                return [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((c) => parseInt(c, 16));
            }
            return null;
        }

        // The opacity carried by an 8-digit hex, or 1 when there is none.
        function hexToAlpha(value) {
            const raw = String(value || '').trim().replace(/^#/, '');
            if (/^[0-9a-f]{8}$/i.test(raw)) return parseInt(raw.slice(6, 8), 16) / 255;
            return 1;
        }

        function build() {
            if (panel) return;
            panel = document.createElement('div');
            panel.className = 'gumi-cp';
            panel.setAttribute('role', 'dialog');
            panel.innerHTML =
                '<div class="gumi-cp-sv" tabindex="0" aria-label="Saturation et luminosité (flèches pour ajuster)"><div class="gumi-cp-thumb"></div></div>' +
                '<div class="gumi-cp-hue" tabindex="0" aria-label="Teinte (flèches pour ajuster)"><div class="gumi-cp-hue-thumb"></div></div>' +
                '<div class="gumi-cp-alpha" tabindex="0" role="slider" aria-label="Opacité (flèches pour ajuster)" aria-valuemin="0" aria-valuemax="100"><div class="gumi-cp-alpha-teinte"></div><div class="gumi-cp-alpha-thumb"></div></div>' +
                '<div class="gumi-cp-row"><span class="gumi-cp-preview"><span class="gumi-cp-preview-teinte"></span></span>' +
                '<input class="gumi-cp-hex" spellcheck="false" maxlength="9" aria-label="Hex"></div>';
            document.body.appendChild(panel);

            svArea = panel.querySelector('.gumi-cp-sv');
            svThumb = panel.querySelector('.gumi-cp-thumb');
            hueTrack = panel.querySelector('.gumi-cp-hue');
            hueThumb = panel.querySelector('.gumi-cp-hue-thumb');
            alphaTrack = panel.querySelector('.gumi-cp-alpha');
            alphaTeinte = panel.querySelector('.gumi-cp-alpha-teinte');
            alphaThumb = panel.querySelector('.gumi-cp-alpha-thumb');
            hexInput = panel.querySelector('.gumi-cp-hex');
            preview = panel.querySelector('.gumi-cp-preview-teinte');

            bindDrag(alphaTrack, (x) => {
                current.a = x;
                emit();
            });
            alphaTrack.addEventListener('keydown', (event) => {
                const step = event.shiftKey ? 0.1 : 0.02;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') current.a = Math.max(0, current.a - step);
                else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') current.a = Math.min(1, current.a + step);
                else return;
                event.preventDefault();
                emit();
            });

            bindDrag(svArea, (x, y) => {
                current.s = x;
                current.v = 1 - y;
                emit();
            });
            bindDrag(hueTrack, (x) => {
                current.h = x * 360;
                emit();
            });

            // Keyboard parity with the native color input: arrows nudge the
            // values, Shift makes bigger steps.
            svArea.addEventListener('keydown', (event) => {
                const step = event.shiftKey ? 0.1 : 0.02;
                if (event.key === 'ArrowLeft') current.s = Math.max(0, current.s - step);
                else if (event.key === 'ArrowRight') current.s = Math.min(1, current.s + step);
                else if (event.key === 'ArrowUp') current.v = Math.min(1, current.v + step);
                else if (event.key === 'ArrowDown') current.v = Math.max(0, current.v - step);
                else return;
                event.preventDefault();
                emit();
            });
            hueTrack.addEventListener('keydown', (event) => {
                const step = event.shiftKey ? 15 : 3;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') current.h -= step;
                else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') current.h += step;
                else return;
                event.preventDefault();
                current.h = (current.h + 360) % 360;
                emit();
            });

            hexInput.addEventListener('input', () => {
                const rgb = hexToRgb(hexInput.value);
                if (!rgb) return;
                const a = alphaOn() ? hexToAlpha(hexInput.value) : 1;
                current = rgbToHsv(rgb[0], rgb[1], rgb[2]);
                current.a = a;
                paint();
                if (activeOpts && activeOpts.onChange) activeOpts.onChange(sortie(), a);
            });

            document.addEventListener('pointerdown', (event) => {
                if (!panel.classList.contains('open')) return;
                if (panel.contains(event.target) || event.target === activeTrigger) return;
                close();
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && panel.classList.contains('open')) {
                    close();
                    if (activeTrigger) activeTrigger.focus();
                }
            });
        }

        // Pointer drag over an area, reported as normalized 0..1 coordinates.
        function bindDrag(area, onMove) {
            function handle(event) {
                const rect = area.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
                const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
                onMove(x, y);
            }
            area.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                area.setPointerCapture(event.pointerId);
                handle(event);
            });
            area.addEventListener('pointermove', (event) => {
                if (event.buttons) handle(event);
            });
        }

        function paint() {
            const rgb = hsvToRgb(current.h, current.s, current.v);
            const hex = rgbToHex(rgb);
            svArea.style.backgroundColor = 'hsl(' + current.h + ', 100%, 50%)';
            svThumb.style.left = (current.s * 100) + '%';
            svThumb.style.top = ((1 - current.v) * 100) + '%';
            svThumb.style.backgroundColor = hex;
            hueThumb.style.left = (current.h / 360 * 100) + '%';

            // The opacity track shows the colour it is about to fade, over the
            // chequerboard that stands for nothing behind it.
            alphaTeinte.style.backgroundImage =
                'linear-gradient(to right, ' + hex + '00, ' + hex + ')';
            alphaThumb.style.left = (current.a * 100) + '%';
            alphaTrack.setAttribute('aria-valuenow', Math.round(current.a * 100));
            // Seule la teinte s'efface ; le damier qui la porte reste entier,
            // sans quoi une couleur transparente et une couleur pâle se
            // ressembleraient.
            preview.style.backgroundColor = hex;
            preview.style.opacity = alphaOn() ? current.a : 1;

            if (document.activeElement !== hexInput) hexInput.value = sortie();
        }

        function emit() {
            paint();
            if (activeOpts && activeOpts.onChange) {
                activeOpts.onChange(sortie(), alphaOn() ? current.a : 1);
            }
        }

        function open(trigger, opts) {
            build();
            activeTrigger = trigger;
            activeOpts = opts;

            const valeur = opts.get ? opts.get() : '#FFFFFF';
            const rgb = hexToRgb(valeur) || [255, 255, 255];
            current = rgbToHsv(rgb[0], rgb[1], rgb[2]);
            current.a = alphaOn() ? hexToAlpha(valeur) : 1;
            // Le champ ne s'élargit qu'au besoin, et la piste d'opacité ne
            // s'affiche que pour un déclencheur qui l'a demandée.
            hexInput.maxLength = alphaOn() ? 9 : 7;
            panel.classList.toggle('a-alpha', alphaOn());
            paint();

            panel.classList.add('open');
            const rect = trigger.getBoundingClientRect();
            const panelWidth = panel.offsetWidth;
            let left = Math.min(rect.left + window.scrollX, window.scrollX + window.innerWidth - panelWidth - 12);
            let top = rect.bottom + window.scrollY + 10;
            if (rect.bottom + panel.offsetHeight + 20 > window.innerHeight) {
                top = rect.top + window.scrollY - panel.offsetHeight - 10;
            }
            panel.style.left = Math.max(12, left) + 'px';
            panel.style.top = top + 'px';
            svArea.focus();
        }

        function close() {
            if (panel) panel.classList.remove('open');
            activeOpts = null;
            activeTrigger = null;
        }

        return {
            attach(trigger, opts) {
                trigger.addEventListener('click', () => {
                    if (panel && panel.classList.contains('open') && activeTrigger === trigger) {
                        close();
                    } else {
                        open(trigger, opts);
                    }
                });
            },
            close
        };
    })();

    window.GumiColorPicker = ColorPicker;
})();
