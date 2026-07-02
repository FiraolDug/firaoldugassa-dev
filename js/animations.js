/**
 * @file animations.js
 * @description Advanced layout mechanics including scroll monitoring, performance-minded numerical increments, and typing telemetry.
 */
const PortfolioAnimations = (function () {
    'use strict';

    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => observer.observe(el));
    }

    function initNumericalCounters() {
        const counters = document.querySelectorAll('.stat-card__number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'), 10);
                    let count = 0;
                    const duration = 2000;
                    const increment = target / (duration / 16);

                    const updateCount = () => {
                        count += increment;
                        if (count < target) {
                            entry.target.innerText = Math.ceil(count);
                            requestAnimationFrame(updateCount);
                        } else {
                            entry.target.innerText = target + (entry.target.innerText.includes('%') || target === 99 ? '%' : '+');
                        }
                    };
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    function initTypingSimulator() {
        const element = document.querySelector('.typing-text');
        if (!element) return;
        
        const words = JSON.parse(element.getAttribute('data-words'));
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                element.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                element.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000; // Pause at end of word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }
        type();
    }

    function initRippleEffects() {
        document.querySelectorAll('.ripple').forEach(button => {
            button.addEventListener('click', function (e) {
                const circle = document.createElement('span');
                const diameter = Math.max(this.clientWidth, this.clientHeight);
                const radius = diameter / 2;

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
                circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
                circle.classList.add('ripple-effect');

                const prevRipple = this.querySelector('.ripple-effect');
                if (prevRipple) prevRipple.remove();

                this.appendChild(circle);
            });
        });
    }

    return {
        init: function () {
            initScrollReveal();
            initNumericalCounters();
            initTypingSimulator();
            initRippleEffects();
        }
    };
})();