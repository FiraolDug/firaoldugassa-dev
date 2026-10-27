/**
 * main.js — boot sequence: render content, then wire up theme, navigation,
 * scroll behaviour, the contact form, and hand off to the animation, github
 * and TV modules once real markup exists in the DOM.
 * (The initial theme is applied by an inline script in <head> to avoid a flash.)
 */
document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const CONTACT_EMAIL = 'firaoldugassalikassa@gmail.com';

  let siteData = null;
  try {
    siteData = await PortfolioContent.init();
  } catch (err) {
    console.error('Content failed to load:', err);
    const main = document.getElementById('main-content');
    if (main) {
      main.innerHTML = `<div class="container section"><p>Something went wrong loading this page. Please refresh, or email <a href="mailto:${CONTACT_EMAIL}" style="color:var(--accent)">${CONTACT_EMAIL}</a>.</p></div>`;
    }
  }

  if (siteData) {
    PortfolioAnimations.init();
    LiveTV.init(PortfolioContent.getLiveProjects());
    if (siteData.github) GithubPanel.init(siteData.github);
  }

  /* ---------------- Theme toggle ---------------- */
  const THEME_KEY = 'firaol_portfolio_theme';
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function syncThemeUI() {
    const light = root.getAttribute('data-theme') === 'light';
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(light));
    if (themeColor) themeColor.setAttribute('content', light ? '#f6f7f9' : '#0a0c11');
  }
  syncThemeUI();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
      syncThemeUI();
    });
  }

  /* ---------------- Mobile navigation ---------------- */
  const burger = document.getElementById('burger-menu');
  const navMenu = document.getElementById('nav-menu');

  function closeNav() {
    if (!burger || !navMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('nav--open');
    document.body.style.overflow = '';
  }

  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      navMenu.classList.toggle('nav--open', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('.nav__link')) closeNav();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) closeNav(); });
  }

  /* ---------------- Header state + back-to-top ---------------- */
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('back-to-top');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('header--sticky', y > 12);
    if (backToTopBtn) backToTopBtn.classList.toggle('back-to-top--visible', y > 640);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------- Active nav link (observer, no per-frame layout reads) ---------------- */
  const navLinks = new Map();
  document.querySelectorAll('.nav__link').forEach((a) => navLinks.set(a.getAttribute('href').slice(1), a));
  if (navLinks.size && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link, id) => {
          const active = id === entry.target.id;
          link.classList.toggle('nav__link--active', active);
          if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));
  }

  /* ---------------- Contact form → pre-filled email ----------------
     No backend: the form composes a mailto: link so messages actually
     arrive. Swap for Formspree / a serverless endpoint if preferred. */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !message || !contactForm.email.checkValidity() || !email) {
        formStatus.className = 'form__status form__status--error';
        formStatus.textContent = 'Please add your name, a valid email, and a short brief.';
        const firstInvalid = contactForm.querySelector('.form__input:invalid') || (!name ? contactForm.name : contactForm.message);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const subject = `Project inquiry from ${name}`;
      const body = `${message}\n\n— ${name}\n${email}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      formStatus.className = 'form__status';
      formStatus.textContent = `Your email app should open now. If not, write to ${CONTACT_EMAIL}.`;
    });
  }
});
