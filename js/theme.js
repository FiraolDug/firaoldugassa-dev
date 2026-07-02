/**
 * @file theme.js
 * @description Highly optimized, fail-safe application theme state dispatcher.
 */
(function () {
    'use strict';
    const storageKey = 'firaol_portfolio_theme';
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(storageKey, theme);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem(storageKey);
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(systemPrefersDark ? 'dark' : 'light');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    document.addEventListener('DOMContentLoaded', initTheme);
})();