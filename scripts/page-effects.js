(function () {
    const dotContainers = document.querySelectorAll('.dynamic-dots');
    let resizeTimeout;

    function drawDots() {
        if (!dotContainers.length) return;
        const width = window.innerWidth;

        dotContainers.forEach((container) => {
            const height = Number(container.dataset.height || 250);
            const spacingX = 20;
            const spacingY = 18;
            let svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor" opacity="0.04">';

            for (let y = 0; y <= height; y += spacingY) {
                const isOdd = Math.round(y / spacingY) % 2 !== 0;
                const offsetX = isOdd ? spacingX / 2 : 0;

                for (let x = offsetX; x <= width + spacingX; x += spacingX) {
                    const nx = Math.abs(x - width / 2) / (width / 2);
                    const baseRadius = 3.0 + Math.pow(nx, 2.0) * 4.0;

                    if (baseRadius > 0.3) {
                        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + baseRadius.toFixed(2) + '" />';
                    }
                }
            }

            svg += '</g></svg>';
            container.innerHTML = svg;
        });
    }

    drawDots();
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(drawDots, 100);
    });

    // Offline support: the service worker precaches the tools so the
    // "works offline" tooltip tags hold true. Skipped on localhost so the
    // dev server always serves fresh files, and on pierre.gumi.ch (the CV
    // landing) where precaching the whole site under a second origin would
    // just duplicate the cache.
    if ('serviceWorker' in navigator &&
        window.location.protocol === 'https:' &&
        window.location.hostname !== 'pierre.gumi.ch' &&
        !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
    }

    // Respect reduced-motion: keep native scrolling, skip the smooth-scroll layer.
    if (!window.Lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new window.Lenis({
        duration: 1.1,
        easing: function (t) {
            return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        smoothWheel: true,
        touchMultiplier: 1.5
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    window.addEventListener('resize', function () {
        lenis.resize();
    });

    window.gumiLenis = lenis;
})();
