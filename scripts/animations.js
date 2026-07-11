// Staggered intro reveal, CSS-driven (no animation library needed).
// Each target gets the .reveal-on-load class plus an incremental
// animation-delay; the keyframes end at `transform: none`, so once the
// intro finishes no lingering transform remains to trap tooltips/popups
// in a stacking context.
document.addEventListener('DOMContentLoaded', () => {
    const targets = Array.from(document.querySelectorAll('.main-wrapper, .page-shell, .back-link, .header-container, .hero, .section, .tool-card, .controls-panel, .right-col, .left-col, .result-item, .qr-container'));
    if (!targets.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    targets.forEach((element, index) => {
        element.style.animationDelay = Math.min(index * 0.07, 1) + 's';
        element.classList.add('reveal-on-load');
    });
});
