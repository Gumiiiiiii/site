(function () {
    const dotContainers = document.querySelectorAll('.dynamic-dots');
    let resizeTimeout;

    function drawDots() {
        if (!dotContainers.length) return;
        const width = window.innerWidth;

        dotContainers.forEach((container) => {
            // data-height="auto" : le motif couvre toute la hauteur de son conteneur au lieu d'une bande fixe.
            const height = container.dataset.height === 'auto'
                ? container.offsetHeight
                : Number(container.dataset.height || 250);
            // Pas réglable : un semis clairsemé tombe sur la même trame que les autres.
            const spacingX = Number(container.dataset.spacingX || 20);
            const spacingY = Number(container.dataset.spacingY || 18);
            const opacity = container.dataset.opacity || '0.04';
            const fixedRadius = container.dataset.radius ? Number(container.dataset.radius) : null;
            // data-fade="diagonale" : la densité se concentre sur deux coins opposés, haut-gauche et bas-droite.
            const fade = container.dataset.fade || '';
            // Les fonds pleine largeur se calent sur la fenêtre.
            const span = container.dataset.width === 'auto' ? container.offsetWidth : width;

            // Un semis régulier à rayon fixe se dessine d'un seul motif CSS : à ces densités.
            if (fade === 'diagonale' && fixedRadius !== null && container.dataset.stagger === 'off') {
                const foyer = (position) => 'radial-gradient(ellipse 85% 85% at ' + position + ', #000, rgba(0,0,0,.5625) 25%, rgba(0,0,0,.25) 50%, rgba(0,0,0,.0625) 75%, transparent)';
                const masque = foyer('0 0') + ', ' + foyer('100% 100%') + ', linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.12))';
                container.innerHTML = '';
                container.style.opacity = opacity;
                container.style.backgroundImage = 'radial-gradient(circle, currentColor ' + fixedRadius + 'px, transparent ' + (fixedRadius + 0.5) + 'px)';
                container.style.backgroundSize = spacingX + 'px ' + spacingY + 'px';
                container.style.backgroundPosition = (-spacingX / 2) + 'px ' + (-spacingY / 2) + 'px';
                container.style.webkitMaskImage = masque;
                container.style.maskImage = masque;
                return;
            }

            let svg = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor" opacity="' + opacity + '">';

            // Un semis clairsemé doit rester sur les rangées non décalées du quinconce.
            const stagger = container.dataset.stagger !== 'off';

            for (let y = 0; y <= height; y += spacingY) {
                const isOdd = Math.round(y / spacingY) % 2 !== 0;
                const offsetX = (stagger && isOdd) ? spacingX / 2 : 0;

                for (let x = offsetX; x <= span + spacingX; x += spacingX) {
                    const nx = Math.abs(x - span / 2) / (span / 2);
                    // data-radius : un rayon constant, au lieu du rayon qui grossit vers les bords gauche et droit.
                    const baseRadius = fixedRadius !== null
                        ? fixedRadius
                        : 3.0 + Math.pow(nx, 2.0) * 4.0;

                    if (baseRadius > 0.3) {
                        let attrs = '';
                        if (fade === 'diagonale' && height > 0) {
                            const u = x / span;
                            const v = y / height;
                            // Deux foyers, l'un dans chaque coin de la diagonale ; on garde le plus proche des deux.
                            const coin = Math.max(
                                1 - Math.min(1, Math.hypot(u, v) / 0.85),
                                1 - Math.min(1, Math.hypot(1 - u, 1 - v) / 0.85)
                            );
                            // Un plancher, pour que les deux autres coins restent très faibles plutôt que vides.
                            attrs = ' opacity="' + (0.12 + 0.88 * coin * coin).toFixed(3) + '"';
                        }
                        svg += '<circle cx="' + x + '" cy="' + y + '" r="' + baseRadius.toFixed(2) + '"' + attrs + ' />';
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

    // Offline support: the service worker precaches the tools.
    if ('serviceWorker' in navigator &&
        window.location.protocol === 'https:' &&
        window.location.hostname !== 'pierre.gumi.ch' &&
        !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
    }
})();
