/**
 * MedicalToolKit — Anxiety Test (GAD-7)
 * Generalised Anxiety Disorder 7-item scale
 * Validated clinical screening tool
 */

(function () {
  'use strict';

  const QUESTIONS = [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it\'s hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid, as if something awful might happen'
  ];

  const OPTIONS = [
    { label: 'Not at all',        value: 0 },
    { label: 'Several days',      value: 1 },
    { label: 'More than half the days', value: 2 },
    { label: 'Nearly every day',  value: 3 }
  ];

  const formEl    = document.getElementById('gadForm');
  const submitBtn = document.getElementById('submitGad');
  const resetBtn  = document.getElementById('resetGad');
  const errorEl   = document.getElementById('gadError');

  const resultBox     = document.getElementById('gadResult');
  const scoreEl       = document.getElementById('gadScore');
  const categoryEl    = document.getElementById('gadCategory');
  const descEl        = document.getElementById('gadDescription');
  const breakdownEl   = document.getElementById('gadBreakdown');
  const severityBar   = document.getElementById('gadSeverityBar');

  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareTwitter  = document.getElementById('shareTwitter');
  const copyResultBtn = document.getElementById('copyResult');
  const toastEl       = document.getElementById('toast');

  /* ── Build question form ── */
  function buildForm() {
    if (!formEl) return;
    formEl.innerHTML = '';

    QUESTIONS.forEach((q, idx) => {
      const qNum = idx + 1;
      const block = document.createElement('div');
      block.className = 'gad-question';
      block.innerHTML = `
        <p class="gad-q-text"><strong>Q${qNum}.</strong> Over the last 2 weeks, how often have you been bothered by: <em>${q}</em>?</p>
        <div class="gad-options" role="radiogroup" aria-label="Question ${qNum}">
          ${OPTIONS.map(opt => `
            <label class="gad-option">
              <input type="radio" name="gad_q${qNum}" value="${opt.value}" aria-label="${opt.label}">
              <span class="gad-option-label">${opt.value} — ${opt.label}</span>
            </label>`).join('')}
        </div>`;
      formEl.appendChild(block);
    });
  }

  /* ── Score interpretation ── */
  const LEVELS = [
    { max: 4,  label: 'Minimal Anxiety',  cssClass: 'green',  boxClass: 'result-normal',  icon: '😌',
      desc: 'Your GAD-7 score suggests minimal anxiety. Some degree of worry is completely normal and does not necessarily indicate a clinical condition. Continue maintaining healthy sleep, regular exercise, social connections, and stress-management practices. If your score fluctuates upward over time, consider speaking with a healthcare provider.' },
    { max: 9,  label: 'Mild Anxiety',     cssClass: 'yellow', boxClass: 'result-warning', icon: '😟',
      desc: 'Your GAD-7 score falls in the mild anxiety range. While this level does not usually require immediate clinical intervention, it can impact your daily functioning and quality of life. Evidence-based strategies such as mindfulness meditation, regular aerobic exercise, limiting caffeine and alcohol, and good sleep hygiene can be very effective. Consider talking to your GP if symptoms persist for more than two weeks.' },
    { max: 14, label: 'Moderate Anxiety', cssClass: 'orange', boxClass: 'result-warning', icon: '😰',
      desc: 'Your GAD-7 score indicates moderate anxiety. At this level, anxiety is likely having a noticeable impact on your daily life, relationships, or work. It is recommended that you speak with a healthcare provider. Effective treatments include cognitive-behavioural therapy (CBT), which has the strongest evidence base for generalised anxiety disorder, and medications (SSRIs or SNRIs) if appropriate. You do not have to manage this alone.' },
    { max: 21, label: 'Severe Anxiety',   cssClass: 'red',    boxClass: 'result-danger',  icon: '😱',
      desc: 'Your GAD-7 score indicates severe anxiety. At this level, anxiety is likely significantly interfering with your daily life. Please speak with a mental health professional or your GP as soon as possible. Effective treatments are available, including CBT, medication, and structured support programmes. If you are experiencing thoughts of self-harm, please contact a crisis helpline or emergency services immediately. You are not alone, and help is available.' }
  ];

  function getLevel(score) {
    return LEVELS.find(l => score <= l.max) || LEVELS[LEVELS.length - 1];
  }

  /* ── Calculate ── */
  function calculate() {
    errorEl.textContent = ''; errorEl.classList.remove('show');

    const answers = [];
    for (let i = 1; i <= 7; i++) {
      const selected = document.querySelector(`input[name="gad_q${i}"]:checked`);
      if (!selected) {
        errorEl.textContent = `Please answer question ${i} before submitting.`;
        errorEl.classList.add('show');
        document.querySelector(`[name="gad_q${i}"]`).closest('.gad-question').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      answers.push(parseInt(selected.value));
    }

    const total = answers.reduce((a, b) => a + b, 0);
    const level = getLevel(total);

    scoreEl.textContent     = total + ' / 21';
    categoryEl.textContent  = level.label;
    categoryEl.className    = 'result-category ' + level.cssClass;
    descEl.textContent      = level.desc;
    resultBox.className     = 'calc-result-box show ' + level.boxClass;

    // Severity bar
    if (severityBar) {
      const pct = (total / 21) * 100;
      severityBar.style.width = pct.toFixed(0) + '%';
      severityBar.style.background = total <= 4 ? '#10B981' : total <= 9 ? '#F59E0B' : total <= 14 ? '#F97316' : '#EF4444';
    }

    // Answer breakdown
    if (breakdownEl) {
      breakdownEl.innerHTML = answers.map((a, i) => {
        const optLabel = OPTIONS.find(o => o.value === a)?.label || '';
        return `<div class="gad-breakdown-row">
          <span class="gad-q-mini">Q${i+1}: ${QUESTIONS[i].substring(0,40)}…</span>
          <span class="gad-a-badge score-${a}">${a} — ${optLabel}</span>
        </div>`;
      }).join('');
    }

    resultBox.dataset.shareText = `I took the GAD-7 anxiety screening test — score: ${total}/21 (${level.label}). Take the free test: https://medicaltoolkit.pages.dev/pages/anxiety-test.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Reset ── */
  function reset() {
    document.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = false; });
    resultBox.classList.remove('show');
    errorEl.textContent = ''; errorEl.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  shareWhatsapp && shareWhatsapp.addEventListener('click', () => window.open('https://wa.me/?text=' + encodeURIComponent(resultBox.dataset.shareText || ''), '_blank', 'noopener'));
  shareTwitter  && shareTwitter.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(resultBox.dataset.shareText || '')}`, '_blank', 'noopener'));
  copyResultBtn && copyResultBtn.addEventListener('click', () => { if (navigator.clipboard) navigator.clipboard.writeText(resultBox.dataset.shareText || '').then(() => showToast('Result copied! ✅')); });

  submitBtn && submitBtn.addEventListener('click', calculate);
  resetBtn  && resetBtn.addEventListener('click', reset);

  buildForm();
})();
