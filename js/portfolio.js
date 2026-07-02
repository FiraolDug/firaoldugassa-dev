/**
 * @file portfolio.js
 * @description Thread-safe operational matrix controls for sorting and filtering cards.
 */
const PortfolioCore = (function () {
    'use strict';

    function initFilteringSystem() {
        const filters = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.project-card');

        filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                filters.forEach(f => {
                    f.classList.remove('filter-btn--active');
                    f.setAttribute('aria-selected', 'false');
                });
                
                e.target.classList.add('filter-btn--active');
                e.target.setAttribute('aria-selected', 'true');

                const scope = e.target.getAttribute('data-filter');

                cards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (scope === 'all' || category === scope) {
                        card.style.display = 'flex';
                        setTimeout(() => card.style.opacity = '1', 50);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    return {
        init: function () {
            initFilteringSystem();
        }
    };
})();