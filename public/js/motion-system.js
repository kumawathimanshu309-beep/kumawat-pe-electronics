/**
 * Kumawat P&E — Motion & Micro-Interaction System
 * Vanilla JS lightweight scroll reveal, desktop 3D card tilt, and badge feedback.
 */

(function () {
  'use strict';

  // 1. SCROLL REVEAL OBSERVER
  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal], .reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          if (delay > 0) {
            setTimeout(() => {
              el.classList.add('visible');
            }, delay);
          } else {
            el.classList.add('visible');
          }
          obs.unobserve(el);
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-reveal], .reveal').forEach(el => observer.observe(el));
  }

  // 2. DESKTOP 3D CARD TILT MODULE
  function init3DTilt() {
    // Only enable on desktop pointer devices
    const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktopPointer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1)';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -3; // Max 3 deg
        const rotateY = ((x - centerX) / centerX) * 3;  // Max 3 deg

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // 3. BADGE BUMP FEEDBACK HELPER
  window.animateBadgeBump = function (badgeId) {
    if (!badgeId) return;
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    badge.classList.remove('badge-bump-anim');
    // Force reflow
    void badge.offsetWidth;
    badge.classList.add('badge-bump-anim');
  };

  // INITIALIZE ON DOM CONTENT LOADED
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-reveal], .reveal')) {
      initScrollReveal();
    }
    if (document.querySelector('[data-tilt]')) {
      init3DTilt();
    }
  });
})();
