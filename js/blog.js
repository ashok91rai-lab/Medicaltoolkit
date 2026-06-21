/* ============================================
   MedicalToolKit — Blog System JS
   Reading Progress, TOC, FAQ, Share
   ============================================ */
'use strict';

// Reading Progress Bar
function initReadingProgress() {
  const bar = document.getElementById('readingProgress');
  if (!bar) return;
  const article = document.querySelector('.article-body, .article-main');
  if (!article) return;

  window.addEventListener('scroll', () => {
    const articleTop  = article.getBoundingClientRect().top + window.scrollY;
    const articleH    = article.offsetHeight;
    const scrolled    = window.scrollY - articleTop;
    const pct         = Math.min(Math.max((scrolled / articleH) * 100, 0), 100);
    bar.style.width   = pct + '%';
  }, { passive: true });
}

// Sticky TOC Highlight
function initTOCHighlight() {
  const tocLinks = document.querySelectorAll('.toc-mini a');
  if (!tocLinks.length) return;

  const headings = document.querySelectorAll(
    '.article-body h2[id], .article-body h3[id], section[id], .article-faq[id]'
  );
  if (!headings.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.toc-mini a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-15% 0px -75% 0px' });

  headings.forEach(h => obs.observe(h));
}

// Article FAQ Accordion
function initArticleFAQ() {
  document.querySelectorAll('.article-faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.parentElement;
      const ans    = item.querySelector('.article-faq-a');
      const isOpen = q.classList.contains('open');

      // Close all
      document.querySelectorAll('.article-faq-q').forEach(o => {
        o.classList.remove('open');
        const a = o.parentElement.querySelector('.article-faq-a');
        if (a) a.classList.remove('open');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        q.classList.add('open');
        if (ans) ans.classList.add('open');
      }
    });

    // Keyboard
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        q.click();
      }
    });
  });
}

// Blog Category Filter
function initBlogFilter() {
  const btns  = document.querySelectorAll('.blog-filter-btn');
  const cards = document.querySelectorAll('.article-card, .blog-featured-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.cat;
      cards.forEach(card => {
        const cardCat = card.dataset.cat || '';
        const show    = cat === 'all' || cardCat === cat;
        card.style.display      = show ? '' : 'none';
        // Animate visible cards back in
        if (show) {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          });
        }
      });
    });
  });
}

// Copy link share button
function initShareButtons() {
  document.querySelectorAll('.share-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.style.background = '#d1fae5';
        btn.style.color = '#065f46';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = window.location.href;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy Link'; }, 2000);
      });
    });
  });
}

// Auto-generate TOC from article headings (if no manual TOC)
function initAutoTOC() {
  const tocEl = document.querySelector('.article-toc ol');
  if (!tocEl || tocEl.children.length > 0) return; // already has items

  const headings = document.querySelectorAll('.article-body h2');
  headings.forEach(h => {
    if (!h.id) {
      h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href        = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    tocEl.appendChild(li);
  });
}

// Estimated reading time
function initReadingTime() {
  const body = document.querySelector('.article-body');
  const metaBar = document.querySelector('.article-meta-bar');
  if (!body || !metaBar) return;

  const words = body.innerText.split(/\s+/).length;
  const mins  = Math.ceil(words / 200); // average reading speed
  const existing = metaBar.querySelector('[data-reading-time]');
  if (!existing) {
    const span = document.createElement('span');
    span.dataset.readingTime = true;
    span.textContent = `⏱ ${mins} min read`;
    // Update existing time spans
    metaBar.querySelectorAll('span').forEach(s => {
      if (s.textContent.includes('min read')) s.textContent = `⏱ ${mins} min read`;
    });
  }
}

// Init all blog functions
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initTOCHighlight();
  initArticleFAQ();
  initBlogFilter();
  initShareButtons();
  initAutoTOC();
  initReadingTime();
});
