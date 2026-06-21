/* ============================================
   MedicalToolKit — Analytics & Tracking
   Phase E: GA4 + Search Console + Events
   ============================================
   SETUP INSTRUCTIONS:
   1. Replace 'G-XXXXXXXXXX' with your GA4 Measurement ID
      → Go to analytics.google.com → Admin → Data Streams
   2. Replace 'GSC_VERIFICATION_CODE' with your Search Console code
      → Go to search.google.com/search-console → Verify
   3. Replace 'BING_VERIFICATION_CODE' with Bing Webmaster code
      → Go to bing.com/webmasters → Verify
   ============================================ */

'use strict';

// ─────────────────────────────────────────
// CONFIGURATION — Replace with your IDs
// ─────────────────────────────────────────
const MTK_CONFIG = {
  GA4_ID: 'G-JWW19HEZBJ',        // ← Replace with your GA4 ID
  DEBUG:  false,                   // Set true for console logs
};

// ─────────────────────────────────────────
// 1. LOAD GA4 (Async — non-blocking)
// ─────────────────────────────────────────
function loadGA4() {
  if (MTK_CONFIG.GA4_ID === 'G-XXXXXXXXXX') {
    if (MTK_CONFIG.DEBUG) console.log('[MTK Analytics] GA4 ID not configured yet');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MTK_CONFIG.GA4_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', MTK_CONFIG.GA4_ID, {
    page_title:    document.title,
    page_location: window.location.href,
    // Privacy-friendly settings
    anonymize_ip:           true,
    allow_google_signals:   false,
    allow_ad_personalization_signals: false,
  });

  if (MTK_CONFIG.DEBUG) console.log('[MTK Analytics] GA4 loaded:', MTK_CONFIG.GA4_ID);
}

// ─────────────────────────────────────────
// 2. CALCULATOR EVENT TRACKING
// ─────────────────────────────────────────
function trackCalculatorUse() {
  // Track when calculator is used
  document.querySelectorAll('.calc-btn, form button[type="submit"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const calcName = document.querySelector('.calc-widget-icon')?.textContent || 
                       document.querySelector('.page-hero h1')?.textContent?.replace(' Calculator', '') ||
                       document.title.replace(' | MedicalToolKit', '');
      
      if (window.gtag) {
        gtag('event', 'calculator_used', {
          event_category: 'engagement',
          event_label:    calcName,
          page_path:      window.location.pathname,
        });
      }
      if (MTK_CONFIG.DEBUG) console.log('[MTK Analytics] Calculator used:', calcName);
    });
  });
}

// ─────────────────────────────────────────
// 3. SCROLL DEPTH TRACKING
// ─────────────────────────────────────────
function trackScrollDepth() {
  const milestones = [25, 50, 75, 90];
  const reached    = new Set();

  window.addEventListener('scroll', () => {
    const scrollPct = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );

    milestones.forEach(pct => {
      if (scrollPct >= pct && !reached.has(pct)) {
        reached.add(pct);
        if (window.gtag) {
          gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label:    `${pct}%`,
            value:          pct,
          });
        }
      }
    });
  }, { passive: true });
}

// ─────────────────────────────────────────
// 4. OUTBOUND LINK TRACKING
// ─────────────────────────────────────────
function trackOutboundLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;

    if (href.startsWith('http') && !href.includes('medicaltoolkit')) {
      if (window.gtag) {
        gtag('event', 'click', {
          event_category: 'outbound',
          event_label:    href,
          transport_type: 'beacon',
        });
      }
    }
  });
}

// ─────────────────────────────────────────
// 5. BLOG ARTICLE TRACKING
// ─────────────────────────────────────────
function trackArticleRead() {
  if (!window.location.pathname.includes('/blog/')) return;
  if (window.location.pathname === '/blog/' || window.location.pathname === '/blog/index.html') return;

  // Track article start read
  if (window.gtag) {
    gtag('event', 'article_view', {
      event_category: 'content',
      event_label:    document.title.replace(' | MedicalToolKit', ''),
      page_path:      window.location.pathname,
    });
  }

  // Track article completion (90% scroll)
  let completed = false;
  window.addEventListener('scroll', () => {
    if (completed) return;
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (pct >= 90) {
      completed = true;
      if (window.gtag) {
        gtag('event', 'article_completed', {
          event_category: 'content',
          event_label:    document.title.replace(' | MedicalToolKit', ''),
        });
      }
    }
  }, { passive: true });
}

// ─────────────────────────────────────────
// 6. SEARCH TRACKING
// ─────────────────────────────────────────
function trackSearch() {
  const searchInput = document.getElementById('heroSearch');
  if (!searchInput) return;

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = searchInput.value.trim();
      if (q.length < 2) return;
      if (window.gtag) {
        gtag('event', 'search', {
          search_term:    q,
          event_category: 'engagement',
        });
      }
    }, 1500);
  });
}

// ─────────────────────────────────────────
// 7. CORE WEB VITALS REPORTING
// ─────────────────────────────────────────
function reportWebVitals() {
  if (!window.gtag) return;

  // Report LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label:    'LCP',
        value:          Math.round(entry.startTime),
        non_interaction: true,
      });
    });
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // Report CLS (Cumulative Layout Shift)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) clsValue += entry.value;
    });
  }).observe({ type: 'layout-shift', buffered: true });

  // Report FID/INP
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label:    'FID',
        value:          Math.round(entry.processingStart - entry.startTime),
        non_interaction: true,
      });
    });
  }).observe({ type: 'first-input', buffered: true });
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadGA4();
  trackCalculatorUse();
  trackScrollDepth();
  trackOutboundLinks();
  trackArticleRead();
  trackSearch();
  setTimeout(reportWebVitals, 2000);
});
