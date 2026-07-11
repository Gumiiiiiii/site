// Staggered intro reveal, CSS-driven (no animation library needed).
// The class is removed once the animation finishes: even though the
// keyframes end at `transform: none`, the retained fill-mode value still
// counts as a transform, which would trap position:fixed descendants
// (like the mobile tooltip) in the animated ancestor.
document.addEventListener('DOMContentLoaded', () => {
    const targets = Array.from(document.querySelectorAll('.main-wrapper, .page-shell, .back-link, .header-container, .hero, .section, .tool-card, .controls-panel, .right-col, .left-col, .result-item, .qr-container'));
    if (!targets.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    targets.forEach((element, index) => {
        element.style.animationDelay = Math.min(index * 0.07, 1) + 's';
        element.classList.add('reveal-on-load');

        element.addEventListener('animationend', function onEnd(event) {
            if (event.target !== element) return;
            element.removeEventListener('animationend', onEnd);
            element.classList.remove('reveal-on-load');
            element.style.animationDelay = '';
        });
    });
});
