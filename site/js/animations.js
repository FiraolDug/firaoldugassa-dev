/**
 * animations.js — typing effect, animated counters, skill bars, and the
 * shared scroll-reveal IntersectionObserver. All motion is skipped for
 * users who prefer reduced motion.
 */
const PortfolioAnimations = (function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initTyping() {
    const node = document.getElementById('hero-typing');
    if (!node) return;
    let words = [];
    try { words = JSON.parse(node.getAttribute('data-words') || '[]'); } catch (e) { words = []; }
    if (!words.length) return;

    if (prefersReducedMotion) {
      node.textContent = words[0];
      return;
    }

    let wordIndex = 0, charIndex = 0, deleting = false;
    const TYPE_MS = 55, DELETE_MS = 28, HOLD_MS = 1600, GAP_MS = 350;

    function tick() {
      const current = words[wordIndex];
      if (!deleting) {
        charIndex++;
        node.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(tick, HOLD_MS);
        }
        return setTimeout(tick, TYPE_MS);
      }
      charIndex--;
      node.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        return setTimeout(tick, GAP_MS);
      }
      setTimeout(tick, DELETE_MS);
    }
    setTimeout(tick, 600);
  }

  function animateCounter(node) {
    const target = parseFloat(node.getAttribute('data-target'));
    if (isNaN(target)) return;
    if (prefersReducedMotion) { node.textContent = target; return; }
    const duration = 1200;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initRevealObserver() {
    const revealables = document.querySelectorAll('.reveal, .stat, .skill-card, .project-card, .timeline-item, .cert-card, .about__text, .about__side, .console');
    if (!revealables.length) return;

    revealables.forEach((n) => n.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        target.classList.add('reveal--visible');

        const counter = target.querySelector ? target.querySelector('.stat-counter') : null;
        if (counter && !counter.dataset.animated) {
          counter.dataset.animated = 'true';
          animateCounter(counter);
        }
        const bar = target.querySelector ? target.querySelector('.skill-bar__fill') : null;
        if (bar && !bar.dataset.animated) {
          bar.dataset.animated = 'true';
          requestAnimationFrame(() => { bar.style.width = bar.getAttribute('data-level') + '%'; });
        }
        observer.unobserve(target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealables.forEach((n) => observer.observe(n));
  }

  function initStaggerDelays() {
    document.querySelectorAll('.stats__row, .skills__grid, .projects__grid, .about__highlights').forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.style.setProperty('--reveal-delay', Math.min(i * 70, 280) + 'ms');
      });
    });
  }

  function init() {
    initTyping();
    initRevealObserver();
    initStaggerDelays();
  }

  return { init, initTyping, initRevealObserver, initStaggerDelays };
})();
