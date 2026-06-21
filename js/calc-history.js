/* ============================================
   MedicalToolKit — Phase J
   Calculation History + Smart Related Tools
   ============================================ */
'use strict';

/* ─────────────────────────────────────────
   1. CALCULATOR REGISTRY
   Maps every calculator to category + smart
   relationships used for suggestions
───────────────────────────────────────── */
const CALC_REGISTRY = {
  'bmi-calculator.html':           { name: 'BMI Calculator',           icon: '⚖️', category: 'fitness',   related: ['body-fat-calculator.html','ideal-weight-calculator.html','calorie-calculator.html','tdee-calculator.html'] },
  'body-fat-calculator.html':      { name: 'Body Fat Calculator',      icon: '💪', category: 'fitness',   related: ['bmi-calculator.html','ideal-weight-calculator.html','tdee-calculator.html','calorie-calculator.html'] },
  'ideal-weight-calculator.html':  { name: 'Ideal Weight Calculator',  icon: '🎯', category: 'fitness',   related: ['bmi-calculator.html','body-fat-calculator.html','calorie-calculator.html','tdee-calculator.html'] },
  'calorie-calculator.html':       { name: 'Calorie Calculator',       icon: '🔥', category: 'fitness',   related: ['tdee-calculator.html','bmi-calculator.html','ideal-weight-calculator.html','body-fat-calculator.html'] },
  'tdee-calculator.html':          { name: 'TDEE Calculator',          icon: '⚡', category: 'fitness',   related: ['calorie-calculator.html','bmi-calculator.html','body-fat-calculator.html','heart-rate-calculator.html'] },
  'heart-rate-calculator.html':    { name: 'Heart Rate Calculator',    icon: '💓', category: 'fitness',   related: ['blood-pressure-checker.html','tdee-calculator.html','calorie-calculator.html','sleep-calculator.html'] },

  'due-date-calculator.html':      { name: 'Due Date Calculator',      icon: '🤰', category: 'pregnancy', related: ['pregnancy-week-calculator.html','ovulation-calculator.html','bmi-calculator.html','calorie-calculator.html'] },
  'pregnancy-week-calculator.html':{ name: 'Pregnancy Week Calculator',icon: '📅', category: 'pregnancy', related: ['due-date-calculator.html','ovulation-calculator.html','bmi-calculator.html','calorie-calculator.html'] },
  'ovulation-calculator.html':     { name: 'Ovulation Calculator',     icon: '🌸', category: 'pregnancy', related: ['due-date-calculator.html','pregnancy-week-calculator.html','bmi-calculator.html'] },

  'blood-sugar-calculator.html':   { name: 'Blood Sugar Calculator',   icon: '🩸', category: 'diabetes',  related: ['a1c-converter.html','bmi-calculator.html','calorie-calculator.html','blood-pressure-checker.html'] },
  'a1c-converter.html':            { name: 'A1C Converter',            icon: '🧪', category: 'diabetes',  related: ['blood-sugar-calculator.html','bmi-calculator.html','calorie-calculator.html','gfr-calculator.html'] },

  'blood-pressure-checker.html':   { name: 'Blood Pressure Checker',   icon: '❤️', category: 'heart',     related: ['heart-rate-calculator.html','bmi-calculator.html','gfr-calculator.html','blood-sugar-calculator.html'] },
  'gfr-calculator.html':           { name: 'GFR Calculator',           icon: '🫘', category: 'kidney',    related: ['blood-pressure-checker.html','a1c-converter.html','bmi-calculator.html','blood-sugar-calculator.html'] },

  'sleep-calculator.html':         { name: 'Sleep Calculator',         icon: '😴', category: 'wellness',  related: ['anxiety-test.html','heart-rate-calculator.html','tdee-calculator.html','calorie-calculator.html'] },
  'anxiety-test.html':             { name: 'Anxiety Test (GAD-7)',     icon: '🧠', category: 'wellness',  related: ['sleep-calculator.html','heart-rate-calculator.html','blood-pressure-checker.html'] },
};

const STORAGE_KEY = 'mtk_calc_history';
const MAX_HISTORY  = 8;

/* ─────────────────────────────────────────
   2. HELPERS
───────────────────────────────────────── */
function getCurrentSlug() {
  const path = window.location.pathname;
  const match = path.match(/\/pages\/([a-z0-9-]+\.html)/);
  return match ? match[1] : null;
}

function getCalcMeta(slug) {
  return CALC_REGISTRY[slug] || null;
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {}
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/* ─────────────────────────────────────────
   3. RECORD A CALCULATION
   Called whenever a result box becomes visible
───────────────────────────────────────── */
function recordCalculation(resultValue, resultCategory) {
  const slug = getCurrentSlug();
  const meta = getCalcMeta(slug);
  if (!slug || !meta) return;

  const history = loadHistory();

  const entry = {
    slug,
    name:     meta.name,
    icon:     meta.icon,
    category: meta.category,
    value:    resultValue || '',
    detail:   resultCategory || '',
    timestamp: Date.now(),
  };

  // Remove any previous entry for the same calculator (keep most recent only)
  const filtered = history.filter(h => h.slug !== slug);
  filtered.unshift(entry);

  saveHistory(filtered);
  renderHistoryWidget();
}

/* ─────────────────────────────────────────
   4. WATCH RESULT BOXES (auto-detect calculation)
───────────────────────────────────────── */
function initHistoryWatcher() {
  const resultBox = document.querySelector('.calc-result-box');
  if (!resultBox) return;

  const observer = new MutationObserver(() => {
    if (resultBox.classList.contains('show')) {
      const valueEl    = resultBox.querySelector('.result-value');
      const categoryEl = resultBox.querySelector('.result-category, [id*="Category"]');
      const value    = valueEl    ? valueEl.textContent.trim()    : '';
      const category = categoryEl ? categoryEl.textContent.trim() : '';
      if (value && value !== '--') {
        recordCalculation(value, category);
      }
    }
  });

  observer.observe(resultBox, { attributes: true, attributeFilter: ['class'] });
}

/* ─────────────────────────────────────────
   5. RENDER HISTORY WIDGET (sidebar)
───────────────────────────────────────── */
function renderHistoryWidget() {
  const container = document.getElementById('calcHistoryWidget');
  if (!container) return;

  const history = loadHistory();

  if (!history.length) {
    container.innerHTML = `
      <div class="history-empty">
        <span class="history-empty-icon">🕐</span>
        <p>Your recent calculations will appear here</p>
      </div>`;
    return;
  }

  container.innerHTML = history.map(h => `
    <a href="/pages/${h.slug}" class="history-item" data-slug="${h.slug}">
      <span class="history-icon">${h.icon}</span>
      <div class="history-info">
        <div class="history-name">${h.name}</div>
        <div class="history-value">${h.value}${h.detail ? ' · ' + h.detail : ''}</div>
      </div>
      <span class="history-time">${timeAgo(h.timestamp)}</span>
    </a>
  `).join('') + `
    <button class="history-clear-btn" id="clearHistoryBtn" type="button">🗑️ Clear History</button>
  `;

  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      renderHistoryWidget();
      if (window.gtag) gtag('event', 'history_cleared', { event_category: 'engagement' });
    });
  }
}

/* ─────────────────────────────────────────
   6. SMART RELATED TOOLS
   Replaces static hardcoded related-tools
   with registry-driven + history-aware logic
───────────────────────────────────────── */
function renderSmartRelatedTools() {
  const container = document.querySelector('.related-tools');
  if (!container) return;

  const slug = getCurrentSlug();
  const meta = getCalcMeta(slug);
  if (!meta) return;

  const history = loadHistory();
  const recentSlugs = history.map(h => h.slug);

  // Build candidate list: registry related tools first, prioritizing ones NOT
  // already in history (fresh suggestions), then fill from same category.
  let candidates = [...meta.related];

  // Add same-category tools not already included
  Object.keys(CALC_REGISTRY).forEach(s => {
    if (s !== slug && CALC_REGISTRY[s].category === meta.category && !candidates.includes(s)) {
      candidates.push(s);
    }
  });

  // Deduplicate, remove self
  candidates = [...new Set(candidates)].filter(s => s !== slug);

  // Sort: tools recently used by the visitor bubble up slightly (continuity),
  // but cap at top 4 total for clean UI.
  candidates.sort((a, b) => {
    const aRecent = recentSlugs.includes(a) ? 1 : 0;
    const bRecent = recentSlugs.includes(b) ? 1 : 0;
    return bRecent - aRecent;
  });

  const finalList = candidates.slice(0, 4);
  if (!finalList.length) return;

  container.innerHTML = finalList.map(s => {
    const tool = CALC_REGISTRY[s];
    if (!tool) return '';
    const wasUsed = recentSlugs.includes(s);
    return `
      <a href="/pages/${s}" class="related-tool-card${wasUsed ? ' related-tool-used' : ''}">
        <div class="related-tool-icon" aria-hidden="true">${tool.icon}</div>
        <div class="related-tool-info">
          <h4>${tool.name}</h4>
          <span>${wasUsed ? '✓ Recently used' : capitalize(tool.category)}</span>
        </div>
      </a>`;
  }).join('');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─────────────────────────────────────────
   7. INJECT HISTORY WIDGET INTO SIDEBAR
   If page has a .calc-sidebar but no history
   widget markup yet, create one automatically.
───────────────────────────────────────── */
function injectHistoryWidget() {
  if (document.getElementById('calcHistoryWidget')) return;

  const sidebar = document.querySelector('.calc-sidebar');
  if (!sidebar) return;

  const widget = document.createElement('div');
  widget.className = 'sidebar-widget history-widget';
  widget.innerHTML = `
    <div class="sidebar-widget-header"><h3>🕐 Recent Calculations</h3></div>
    <div class="sidebar-widget-body" id="calcHistoryWidget"></div>
  `;

  // Insert as the FIRST widget in the sidebar
  sidebar.insertBefore(widget, sidebar.firstChild);
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectHistoryWidget();
  renderHistoryWidget();
  initHistoryWatcher();
  renderSmartRelatedTools();
});
