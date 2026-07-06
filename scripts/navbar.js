(function () {
    const navbarMarkup = `
        <div class="nav-logo">
            <a href="brand-guidelines.html" class="no-select">
                <img src="Gumi-Logotype.png" alt="Gumi Logo" onerror="this.src='https://placehold.co/100x35/transparent/9C77F5?text=GUMI.'">
            </a>
        </div>
        <div class="nav-links">
            <a href="index.html">Home</a>
            <a href="experiments.html">Experiments</a>
            <a href="brand-guidelines.html">Brand Guidelines</a>
            <a href="outils.html">Tools</a>
        </div>
    `;

    const currentPage = window.location.pathname.split('/').pop() || 'brand-guidelines.html';

    document.querySelectorAll('[data-navbar-root]').forEach((root) => {
        root.innerHTML = navbarMarkup;

        root.querySelectorAll('.nav-links a').forEach((link) => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    });
})();
