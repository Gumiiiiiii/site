document.addEventListener('DOMContentLoaded', () => {
    if (!window.gsap) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = Array.from(document.querySelectorAll('.navbar, .main-wrapper, .page-shell, .back-link, .header-container, .hero, .section, .tool-card, .controls-panel, .right-col, .left-col, .result-item, .qr-container'));

    if (!targets.length) return;

    targets.forEach((element) => element.classList.add('gsap-animate'));

    if (prefersReducedMotion) {
        window.gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
        return;
    }

    const nav = document.querySelector('.navbar');
    const rest = targets.filter((element) => element !== nav);
    const tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (nav) {
        tl.from(nav, { opacity: 0, y: -16, duration: 0.5 });
    }

    if (rest.length) {
        tl.from(rest, { opacity: 0, y: 24, scale: 0.985, duration: 0.5, stagger: 0.07 }, nav ? '-=0.2' : 0);
    }
});
