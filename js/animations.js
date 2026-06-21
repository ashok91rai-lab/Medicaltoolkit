/* ============================================
   PHASE B — Animation Engine
   MedicalToolKit Premium UX System
   Pure Vanilla JS — Zero Dependencies
   ============================================ */

'use strict';

// ─────────────────────────────────────────
// 1. PAGE TRANSITION SYSTEM
// ─────────────────────────────────────────
function initPageTransitions() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);

  // Intercept all internal navigation links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip: external, hash, mailto, tel, target="_blank"
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      link.target === '_blank' ||
      e.ctrlKey || e.metaKey || e.shiftKey
    ) return;

    e.preventDefault();

    // Fade out overlay
    overlay.classList.add('fade-out');

    setTimeout(() => {
      window.location.href = href;
    }, 200);
  });

  // On page show (back/forward cache)
  window.addEventListener('pageshow', () => {
    overlay.classList.remove('fade-out');
  });
}

// Counter animation handled by initDataAttrCounter() below


// ─────────────────────────────────────────
// 3. SCROLL REVEAL SYSTEM
// ─────────────────────────────────────────
function initScrollReveal() {
  // Auto-add reveal class to key elements
  const autoRevealSelectors = [
    // '.content-section' removed — article body must never be opacity:0
    '.formula-box',
    '.medical-disclaimer',
    '.faq-section',
    '.trust-section',
    '.feature-section',
  ];

  autoRevealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      // Never add reveal to article body content or elements inside article-body
      if (el.classList.contains('article-body') || el.closest('.article-body')) return;
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-stagger')) {
        el.classList.add('reveal');
      }
    });
  });

  // Auto-add stagger to grids
  const staggerSelectors = [
    '.tools-grid',
    '.categories-grid',
    '.related-tools-grid',
  ];
  staggerSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.closest('.calc-main') || el.closest('.article-body')) return;
      el.classList.add('reveal-stagger');
    });
  });

  // Section headings
  document.querySelectorAll('.content-section h2, .categories-section h2, h2[id]').forEach(el => {
    // Don't hide h2s inside article body or calc main content
    if (el.closest('.article-body') || el.closest('.calc-main')) return;
    el.classList.add('section-title-reveal');
  });

  // Sidebar widgets
  document.querySelectorAll('.sidebar-widget').forEach(el => {
    el.classList.add('reveal');
  });

  // Intersection Observer for all reveal elements
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.01, // lower threshold - triggers earlier on mobile
    rootMargin: '0px 0px 0px 0px' // no negative margin - trigger as soon as visible
  });

  document.querySelectorAll('.reveal, .reveal-stagger, .section-title-reveal, .sidebar-widget').forEach(el => {
    revealObserver.observe(el);
  });
}

// ─────────────────────────────────────────
// 4. RIPPLE EFFECT ON BUTTONS
// ─────────────────────────────────────────
function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.calc-btn, .btn-primary, .btn-secondary, .hero-search button');
    if (!btn) return;

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;
    btn.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ─────────────────────────────────────────
// 5. CALCULATE BUTTON LOADING STATE
// ─────────────────────────────────────────
function initCalcButtonLoading() {
  document.querySelectorAll('.calc-btn, form button[type="submit"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const originalText = this.textContent;
      this.classList.add('loading');
      this.dataset.originalText = originalText;

      // Remove loading state after calc completes (max 800ms)
      setTimeout(() => {
        this.classList.remove('loading');
      }, 600);
    });
  });
}

// ─────────────────────────────────────────
// 6. HAMBURGER MORPHING (CSS-only enhancement)
// ─────────────────────────────────────────
function initHamburgerMorph() {
  // main.js already handles click events
  // This function only ensures .hamburger class is present for CSS animations
  const hamburger = document.getElementById('hamburger');
  if (!hamburger) return;
  if (!hamburger.classList.contains('hamburger')) {
    hamburger.classList.add('hamburger');
  }
  // .bar spans already in HTML — no need to recreate
}

// ─────────────────────────────────────────
// 7. RESULT BOX SMOOTH REVEAL
// ─────────────────────────────────────────
function initResultBoxObserver() {
  // Watch for result box becoming visible (show class added by calculators)
  const resultBox = document.querySelector('.calc-result-box');
  if (!resultBox) return;

  // Use MutationObserver to detect when 'show' class is added
  const mutObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('show')) {
          // Scroll result into view smoothly on mobile
          if (window.innerWidth < 768) {
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
          }
        }
      }
    });
  });

  mutObserver.observe(resultBox, { attributes: true });
}

// ─────────────────────────────────────────
// 8. CATEGORY ICON WRAPPER
// ─────────────────────────────────────────
function initCategoryIconWrap() {
  // Wrap category emojis for animation targeting
  document.querySelectorAll('.category-card').forEach(card => {
    const emojiEl = card.querySelector('.category-emoji, .cat-icon');
    if (emojiEl && !emojiEl.classList.contains('category-icon')) {
      emojiEl.classList.add('category-icon');
    }
    // If there's a direct text emoji in h3 or similar
    const h3 = card.querySelector('h3');
    if (h3 && !card.querySelector('.category-icon')) {
      const firstChild = h3.childNodes[0];
      if (firstChild && firstChild.nodeType === 3) {
        // wrap text node in span
        const span = document.createElement('span');
        span.className = 'category-icon';
        span.textContent = firstChild.textContent;
        h3.replaceChild(span, firstChild);
      }
    }
  });
}

// ─────────────────────────────────────────
// 9. SEARCH BAR FOCUS ANIMATION
// ─────────────────────────────────────────
function initSearchFocusAnimation() {
  const heroSearch = document.querySelector('.hero-search');
  const heroInput  = document.querySelector('#heroSearch, .hero-search input');
  if (!heroSearch || !heroInput) return;

  heroInput.addEventListener('focus', () => {
    heroSearch.style.transform = 'scale(1.02)';
    heroSearch.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
    heroSearch.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
  });

  heroInput.addEventListener('blur', () => {
    heroSearch.style.transform = '';
    heroSearch.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
  });
}

// ─────────────────────────────────────────
// 10. FLOATING PARTICLES IN HERO (CSS Only trigger)
// ─────────────────────────────────────────
function initHeroParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.style.overflow = 'hidden'; // prevent particles causing horizontal scroll

  // Create 6 floating medical cross particles
  const crosses = ['+', '+', '+', '✚', '+', '✚'];
  crosses.forEach((symbol, i) => {
    const particle = document.createElement('span');
    particle.className = 'hero-particle';
    particle.textContent = symbol;
    particle.style.cssText = `
      position: absolute;
      color: rgba(255,255,255,0.06);
      font-size: ${Math.random() * 24 + 16}px;
      font-weight: 300;
      left: ${Math.random() * 90 + 5}%;
      top: ${Math.random() * 80 + 10}%;
      animation: floatParticle ${3 + i * 0.8}s ease-in-out ${i * 0.4}s infinite alternate;
      pointer-events: none;
      user-select: none;
      z-index: 0;
    `;
    hero.appendChild(particle);
  });

  // Add keyframe dynamically
  if (!document.getElementById('particleStyle')) {
    const style = document.createElement('style');
    style.id = 'particleStyle';
    style.textContent = `
      @keyframes floatParticle {
        from { transform: translateY(0px) rotate(0deg); opacity: 0.04; }
        to   { transform: translateY(-18px) rotate(15deg); opacity: 0.1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ─────────────────────────────────────────
// 11. TOOL CARD TILT (Subtle 3D on Desktop)
// ─────────────────────────────────────────
function initCardTilt() {
  if (window.innerWidth < 768) return; // Desktop only

  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX  = y * 6;
      const tiltY  = -x * 6;

      card.style.transform = `translateY(-5px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
}

// ─────────────────────────────────────────
// 12. PROGRESS BAR ON PAGE TOP (Loading indicator)
// ─────────────────────────────────────────
function initTopProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'topProgressBar';
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    width: 0%;
    max-width: 100vw;
    background: linear-gradient(90deg, #2563EB, #10B981, #0EA5E9);
    z-index: 100000;
    transition: width 0.3s ease, opacity 0.4s ease;
    border-radius: 0 3px 3px 0;
    box-shadow: 0 0 8px rgba(37,99,235,0.6);
  `;
  document.body.appendChild(bar);

  // Show progress on link click
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || link.target === '_blank') return;
    if (e.ctrlKey || e.metaKey) return;

    bar.style.width = '0%';
    bar.style.opacity = '1';
    setTimeout(() => { bar.style.width = '70%'; }, 10);
    setTimeout(() => { bar.style.width = '92%'; }, 180);
  });

  // Complete on load
  window.addEventListener('load', () => {
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; }, 350);
    setTimeout(() => { bar.style.width = '0%'; bar.style.opacity = '1'; }, 750);
  });
}

// ─────────────────────────────────────────
// INIT ALL PHASE B ANIMATIONS
// ─────────────────────────────────────────
function initPhaseB() {
  // Only fade-in body on homepage (prevents blank flash on article/calculator pages)
  if (document.querySelector('.hero') || window.location.pathname === '/') {
    document.body.classList.add('animate-fadein');
  }

  initPageTransitions();
  // initCounterAnimation — replaced by initDataAttrCounter
  initScrollReveal();
  initRippleEffect();
  initCalcButtonLoading();
  initHamburgerMorph();
  initResultBoxObserver();
  initCategoryIconWrap();
  initSearchFocusAnimation();
  initHeroParticles();
  initTopProgressBar();

  // Card tilt — defer slightly for performance
  setTimeout(initCardTilt, 500);
}

// Run when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPhaseB);
} else {
  initPhaseB();
}

// ─────────────────────────────────────────
// DATA-ATTRIBUTE COUNTER (reads HTML data-target)
// ─────────────────────────────────────────
function initDataAttrCounter() {
  const statNumbers = document.querySelectorAll(
    '.stat-number[data-target], .stat-number[data-typewriter]'
  );
  if (!statNumbers.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function countUp(el, target, suffix, prefix, fmt, dur) {
    el.classList.add('counting');
    const t0 = performance.now();
    function format(n) {
      if (fmt && n >= 1e6) return (n/1e6).toFixed(1).replace('.0','') + 'M';
      if (fmt && n >= 1e3) return (n/1e3).toFixed(0) + 'K';
      return n.toLocaleString();
    }
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = prefix + format(Math.floor(easeOut(p) * target)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else { el.textContent = prefix + format(target) + suffix; el.classList.remove('counting'); }
    })(t0);
  }

  function typeIt(el, text) {
    el.textContent = ''; el.classList.add('counting'); let i = 0;
    const iv = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(iv); el.classList.remove('counting'); }
    }, 130);
  }

  // Disconnect original observer, use this one
  const obs = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    document.querySelectorAll('.stat-item').forEach((item, i) =>
      setTimeout(() => item.classList.add('animated'), i * 120)
    );
    statNumbers.forEach((el, i) => {
      const d  = el.dataset;
      const delay = i * 160;
      if (d.typewriter) {
        setTimeout(() => typeIt(el, d.typewriter), delay + 320);
      } else {
        setTimeout(() => countUp(
          el,
          parseInt(d.target),
          d.suffix || '',
          d.prefix || '',
          d.format === 'true',
          1700
        ), delay + 200);
      }
    });
  }, { threshold: 0.35 });

  const bar = document.querySelector('.stats-bar');
  if (bar) obs.observe(bar);
}

document.addEventListener('DOMContentLoaded', initDataAttrCounter);
