(function () {
    document.querySelectorAll('.controls-wrapper').forEach((wrapper) => {
        const searchInput = wrapper.querySelector('.search-input');
        const btns = wrapper.querySelectorAll('.filter-btn');
        const grid = wrapper.nextElementSibling;
        if (!grid) return;
        const items = grid.querySelectorAll('.card, .tool-card');

        // Announces result counts to screen readers after filtering/searching.
        const liveRegion = document.createElement('div');
        liveRegion.className = 'visually-hidden';
        liveRegion.setAttribute('aria-live', 'polite');
        wrapper.appendChild(liveRegion);

        function updateGrid() {
            const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const activeBtn = wrapper.querySelector('.filter-btn.active');
            const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
            let shown = 0;

            items.forEach((item) => {
                const titleEl = item.querySelector('.card-title, .tool-title');
                const descEl = item.querySelector('.tool-desc');
                const title = titleEl ? titleEl.textContent.toLowerCase() : '';
                const desc = descEl ? descEl.textContent.toLowerCase() : '';
                const cat = item.getAttribute('data-category');

                const matchSearch = title.includes(term) || desc.includes(term);
                const matchFilter = filter === 'all' || cat === filter;

                if (matchSearch && matchFilter) {
                    item.style.display = item.classList.contains('tool-card') && grid.classList.contains('tools-grid-full') ? 'flex' : 'block';
                    shown += 1;
                } else {
                    item.style.display = 'none';
                }
            });

            liveRegion.textContent = shown + ' / ' + items.length;
        }

        if (searchInput) searchInput.addEventListener('input', updateGrid);

        btns.forEach((btn) => {
            btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');

            btn.addEventListener('click', () => {
                btns.forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                updateGrid();
            });

            const cat = btn.getAttribute('data-filter');
            const count = cat === 'all' ? items.length : grid.querySelectorAll('[data-category="' + cat + '"]').length;
            const span = document.createElement('span');
            span.className = 'filter-count';
            span.textContent = count;
            btn.appendChild(span);
        });
    });
})();
