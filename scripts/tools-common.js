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

    // Custom color picker popover, replacing the native <input type="color">
    // dialog so the tools keep one visual language. One popover is shared by
    // every trigger on the page. Usage:
    //   GumiColorPicker.attach(button, { get: () => '#AABBCC', onChange: (hex) => {} })
    const ColorPicker = (function () {
        let panel = null;
        let svArea = null;
        let svThumb = null;
        let hueTrack = null;
        let hueThumb = null;
        let hexInput = null;
        let preview = null;
        let current = { h: 0, s: 0, v: 0 };
        let activeOpts = null;
        let activeTrigger = null;

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

        function hexToRgb(value) {
            const raw = String(value || '').trim().replace(/^#/, '');
            if (/^[0-9a-f]{3}$/i.test(raw)) return raw.split('').map((c) => parseInt(c + c, 16));
            if (/^[0-9a-f]{6}$/i.test(raw)) {
                return [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((c) => parseInt(c, 16));
            }
            return null;
        }

        function build() {
            if (panel) return;
            panel = document.createElement('div');
            panel.className = 'gumi-cp';
            panel.setAttribute('role', 'dialog');
            panel.innerHTML =
                '<div class="gumi-cp-sv"><div class="gumi-cp-thumb"></div></div>' +
                '<div class="gumi-cp-hue"><div class="gumi-cp-hue-thumb"></div></div>' +
                '<div class="gumi-cp-row"><span class="gumi-cp-preview"></span>' +
                '<input class="gumi-cp-hex" spellcheck="false" maxlength="7" aria-label="Hex"></div>';
            document.body.appendChild(panel);

            svArea = panel.querySelector('.gumi-cp-sv');
            svThumb = panel.querySelector('.gumi-cp-thumb');
            hueTrack = panel.querySelector('.gumi-cp-hue');
            hueThumb = panel.querySelector('.gumi-cp-hue-thumb');
            hexInput = panel.querySelector('.gumi-cp-hex');
            preview = panel.querySelector('.gumi-cp-preview');

            bindDrag(svArea, (x, y) => {
                current.s = x;
                current.v = 1 - y;
                emit();
            });
            bindDrag(hueTrack, (x) => {
                current.h = x * 360;
                emit();
            });

            hexInput.addEventListener('input', () => {
                const rgb = hexToRgb(hexInput.value);
                if (!rgb) return;
                current = rgbToHsv(rgb[0], rgb[1], rgb[2]);
                paint();
                if (activeOpts && activeOpts.onChange) activeOpts.onChange(rgbToHex(rgb));
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
            preview.style.backgroundColor = hex;
            if (document.activeElement !== hexInput) hexInput.value = hex;
        }

        function emit() {
            paint();
            if (activeOpts && activeOpts.onChange) {
                activeOpts.onChange(rgbToHex(hsvToRgb(current.h, current.s, current.v)));
            }
        }

        function open(trigger, opts) {
            build();
            activeTrigger = trigger;
            activeOpts = opts;

            const rgb = hexToRgb(opts.get ? opts.get() : '#FFFFFF') || [255, 255, 255];
            current = rgbToHsv(rgb[0], rgb[1], rgb[2]);
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
