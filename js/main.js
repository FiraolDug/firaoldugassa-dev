/**
 * @file main.js
 * @description Central execution node orchestrating interface states, menus, and forms.
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Terminate Global Loading Veil
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('preloader--hidden');
    }

    // Initialize Specialized Subsystems
    PortfolioAnimations.init();
    PortfolioCore.init();

    // Toggle Responsive Menu Matrix
    const burger = document.getElementById('burger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (burger && navMenu) {
        burger.addEventListener('click', () => {
            const opened = burger.getAttribute('aria-expanded') === 'true';
            burger.setAttribute('aria-expanded', !opened);
            navMenu.classList.toggle('nav--open');
        });

        navLinks.forEach(link => link.addEventListener('click', () => {
            burger.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('nav--open');
        }));
    }

    // Intersection Monitor for Top Navigation Highlights
    const sections = document.querySelectorAll('section[id]');
    const header = document.getElementById('header');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Header Transformation Styling
        if (scrollY > 50) {
            header.classList.add('header--sticky');
        } else {
            header.classList.remove('header--sticky');
        }

        // Back To Top Display
        if (scrollY > 600) {
            backToTopBtn.classList.add('back-to-top--visible');
            backToTopBtn.setAttribute('aria-hidden', 'false');
        } else {
            backToTopBtn.classList.remove('back-to-top--visible');
            backToTopBtn.setAttribute('aria-hidden', 'true');
        }

        // Track Active Link State
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const targetLink = document.querySelector(`.nav__link[href*=${sectionId}]`);

            if (targetLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    targetLink.classList.add('nav__link--active');
                } else {
                    targetLink.classList.remove('nav__link--active');
                }
            }
        });
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Contact Submission Handler
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            formStatus.className = 'form__status form__status--success';
            formStatus.textContent = 'Transmission verified. Connection protocols operational.';
            contactForm.reset();
        });
    }
});