/**
 * main.js — boot sequence: load content, then wire up navigation, scroll
 * behaviour, the contact form, and hand off to the animation/filter/github
 * modules once real markup exists in the DOM.
 */
document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const preloader = document.getElementById('preloader');
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let siteData = null;
  try {
    siteData = await PortfolioContent.init();
  } catch (err) {
    console.error('Content failed to load:', err);
    const main = document.getElementById('main-content');
    if (main) {
      main.innerHTML = `<div class="container section"><p style="color:var(--warn)">Something went wrong loading this page's content. Please refresh, or reach Firaol directly at <a href="mailto:firaoldugassa@gmail.com" style="color:var(--amber)">firaoldugassa@gmail.com</a>.</p></div>`;
    }
  }

  if (preloader) {
    setTimeout(() => preloader.classList.add('preloader--hidden'), 250);
  }

  // Kick off modules that depend on rendered DOM.
  if (siteData) {
    PortfolioFilters.init();
    PortfolioAnimations.init();
    if (siteData.github) GithubPanel.init(siteData.github);
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
      navMenu.classList.toggle('nav--open');
      document.body.style.overflow = open ? '' : 'hidden';
    });
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('.nav__link')) closeNav();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  }

  /* ---------------- Scroll-driven header + back-to-top + active link ---------------- */
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('back-to-top');
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;

    if (header) header.classList.toggle('header--sticky', scrollY > 20);
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('back-to-top--visible', scrollY > 640);
      backToTopBtn.setAttribute('aria-hidden', String(scrollY <= 640));
    }

    const sections = document.querySelectorAll('main section[id]');
    sections.forEach((section) => {
      const top = section.offsetTop - 140;
      const bottom = top + section.offsetHeight;
      const link = document.querySelector(`.nav__link[href="#${section.id}"]`);
      if (!link) return;
      link.classList.toggle('nav__link--active', scrollY >= top && scrollY < bottom);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------- Contact form (client-side only demo handler) ---------------- */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const name = contactForm.name.value.trim();

      if (submitBtn) submitBtn.disabled = true;
      formStatus.className = 'form__status';
      formStatus.textContent = 'Sending…';

      // NOTE: This is a placeholder handler — wire it to a real endpoint
      // (Formspree, a serverless function, mailto, etc.) before relying on it.
      setTimeout(() => {
        formStatus.className = 'form__status form__status--success';
        formStatus.textContent = `Thanks${name ? ', ' + name.split(' ')[0] : ''} — this form isn't wired to a backend yet, so please email firaoldugassa@gmail.com directly for now.`;
        if (submitBtn) submitBtn.disabled = false;
        contactForm.reset();
      }, 600);
    });
  }
});
