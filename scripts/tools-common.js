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
})();
