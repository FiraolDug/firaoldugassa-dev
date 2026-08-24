/**
 * portfolio.js — project category filtering. Re-run init() after content
 * is rendered since the filter buttons/cards are built dynamically.
 */
const PortfolioFilters = (function () {
  'use strict';

  function init() {
    const filters = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!filters.length || !cards.length) return;

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.forEach((f) => { f.classList.remove('filter-btn--active'); f.setAttribute('aria-selected', 'false'); });
        btn.classList.add('filter-btn--active');
        btn.setAttribute('aria-selected', 'true');

        const scope = btn.getAttribute('data-filter');
        cards.forEach((card) => {
          const match = scope === 'all' || card.getAttribute('data-category') === scope;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  return { init };
})();
