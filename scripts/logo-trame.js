// Halftone logo: inlines img[data-trame] SVGs; inside a link, its dots swell under the pointer.
(function () {
    const FORCE = 0.8, RAYON = 0.4;
    const calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animer(svg, cible) {
        const vb = svg.viewBox.baseVal;
        const R = RAYON * vb.height * 0.85;
        const pts = [...svg.querySelectorAll('circle')].map((el) => ({ el, x: +el.getAttribute('cx'), y: +el.getAttribute('cy'), r: +el.getAttribute('r'), s: 1 }));
        let px = 0, py = 0, dedans = false, presence = 0, boucle = 0;
        function pas() {
            boucle = 0;
            presence += ((dedans ? 1 : 0) - presence) * 0.12;
            let encore = dedans || presence > 0.002;
            pts.forEach((p) => {
                const dx = p.x - px, dy = p.y - py;
                const s = 1 + FORCE * presence * Math.exp(-(dx * dx + dy * dy) / (R * R));
                p.s += (s - p.s) * 0.25;
                if (Math.abs(p.s - 1) > 0.002) encore = true;
                p.el.setAttribute('r', (p.r * p.s).toFixed(2));
            });
            if (encore) boucle = requestAnimationFrame(pas);
        }
        const suivre = (e) => {
            const m = svg.getScreenCTM();
            if (!m) return;
            const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
            px = q.x; py = q.y;
            if (!boucle) boucle = requestAnimationFrame(pas);
        };
        cible.addEventListener('pointerenter', (e) => { dedans = true; suivre(e); });
        cible.addEventListener('pointermove', suivre);
        cible.addEventListener('pointerleave', () => { dedans = false; if (!boucle) boucle = requestAnimationFrame(pas); });
    }

    async function inliner(img) {
        if (img.dataset.trameFait) return;
        img.dataset.trameFait = '1';
        try {
            const res = await fetch(img.getAttribute('src'));
            if (!res.ok) return;
            const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
            const svg = doc.documentElement;
            if (svg.nodeName !== 'svg') return;
            svg.querySelector('title')?.remove();
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', img.alt || 'Gumi');
            if (img.className) svg.setAttribute('class', img.className);
            svg.style.overflow = 'visible';
            img.replaceWith(svg);
            const lien = svg.closest('a');
            if (lien && !calme) animer(svg, lien);
        } catch (e) { /* the img stays as it was */ }
    }

    function tout() { document.querySelectorAll('img[data-trame]').forEach(inliner); }
    window.GumiTrame = { tout };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tout); else tout();
})();
