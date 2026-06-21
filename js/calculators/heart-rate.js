/**
 * MedicalToolKit — Heart Rate Calculator
 * Max HR = 220 - age
 * 5 training zones with visual bar
 */

(function () {
  'use strict';

  const ageInput      = document.getElementById('ageHr');
  const restingInput  = document.getElementById('restingHr');
  const errorEl       = document.getElementById('hrError');
  const calcBtn       = document.getElementById('calcHeartRate');
  const resetBtn      = document.getElementById('resetHeartRate');

  const resultBox     = document.getElementById('hrResult');
  const maxHrEl       = document.getElementById('hrMax');
  const restHrEl      = document.getElementById('hrResting');
  const zonesEl       = document.getElementById('hrZones');

  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareTwitter  = document.getElementById('shareTwitter');
  const copyResultBtn = document.getElementById('copyResult');
  const toastEl       = document.getElementById('toast');

  const ZONES = [
    { id: 1, label: 'Zone 1 — Very Light',  pctMin: 50, pctMax: 60, color: '#10B981', bg: '#D1FAE5', desc: 'Warm-up, recovery. Very comfortable pace. Good for beginners and active recovery days.' },
    { id: 2, label: 'Zone 2 — Light',        pctMin: 60, pctMax: 70, color: '#3B82F6', bg: '#DBEAFE', desc: 'Fat burning zone. Comfortable conversation possible. Ideal for long, slow endurance training.' },
    { id: 3, label: 'Zone 3 — Aerobic',      pctMin: 70, pctMax: 80, color: '#F59E0B', bg: '#FEF3C7', desc: 'Cardio zone. Improves aerobic capacity and cardiovascular efficiency. Moderate effort.' },
    { id: 4, label: 'Zone 4 — Threshold',    pctMin: 80, pctMax: 90, color: '#EF4444', bg: '#FEE2E2', desc: 'High intensity. Improves speed and lactate threshold. Breathing is hard. Short sentences only.' },
    { id: 5, label: 'Zone 5 — Maximum',      pctMin: 90, pctMax: 100, color: '#7C3AED', bg: '#EDE9FE', desc: 'Max effort. Only sustainable for seconds to a few minutes. Sprint training. Not for beginners.' }
  ];

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
  function clearError()   { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  function hideResult()   { resultBox.classList.remove('show'); }

  function calculate() {
    clearError();
    const age     = parseInt(ageInput.value);
    const resting = parseInt(restingInput.value) || 0;

    if (!ageInput.value || isNaN(age) || age < 10 || age > 100) {
      showError('Please enter a valid age (10–100).'); ageInput.focus(); return;
    }
    if (restingInput.value && (isNaN(resting) || resting < 30 || resting > 120)) {
      showError('Resting heart rate should be between 30 and 120 bpm.'); restingInput.focus(); return;
    }

    const maxHR = 220 - age;
    displayResult(maxHR, resting || null);
  }

  function displayResult(maxHR, resting) {
    maxHrEl.textContent    = maxHR + ' bpm';
    restHrEl.textContent   = resting ? resting + ' bpm' : 'Not entered';

    if (zonesEl) {
      zonesEl.innerHTML = ZONES.map(z => {
        const minBpm = Math.round(maxHR * z.pctMin / 100);
        const maxBpm = Math.round(maxHR * z.pctMax / 100);
        const width  = z.pctMax - z.pctMin; // width as % of max HR range

        // Karvonen reserve zones (if resting HR entered)
        let reserveNote = '';
        if (resting) {
          const hrr    = maxHR - resting;
          const kMin   = Math.round(resting + hrr * z.pctMin / 100);
          const kMax   = Math.round(resting + hrr * z.pctMax / 100);
          reserveNote = `<span class="zone-reserve">(Reserve: ${kMin}–${kMax} bpm)</span>`;
        }

        return `
          <div class="hr-zone-row" style="--zone-color:${z.color};--zone-bg:${z.bg}">
            <div class="zone-label">${z.label}</div>
            <div class="zone-bar-wrap">
              <div class="zone-bar" style="left:${z.pctMin - 50}%;width:${width * 2}%;background:${z.color};"></div>
            </div>
            <div class="zone-range">${z.pctMin}–${z.pctMax}% &nbsp;|&nbsp; ${minBpm}–${maxBpm} bpm ${reserveNote}</div>
            <div class="zone-desc">${z.desc}</div>
          </div>`;
      }).join('');
    }

    resultBox.className = 'calc-result-box show result-normal';
    resultBox.dataset.shareText = `My max heart rate is ${maxHR} bpm. Calculate your training zones free: https://medicaltoolkit.pages.dev/pages/heart-rate-calculator.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    ageInput.value = '';
    if (restingInput) restingInput.value = '';
    clearError(); hideResult();
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  shareWhatsapp && shareWhatsapp.addEventListener('click', () => window.open('https://wa.me/?text=' + encodeURIComponent(resultBox.dataset.shareText || ''), '_blank', 'noopener'));
  shareTwitter  && shareTwitter.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(resultBox.dataset.shareText || '')}`, '_blank', 'noopener'));
  copyResultBtn && copyResultBtn.addEventListener('click', () => { if (navigator.clipboard) navigator.clipboard.writeText(resultBox.dataset.shareText || '').then(() => showToast('Result copied! ✅')); });

  calcBtn  && calcBtn.addEventListener('click', calculate);
  resetBtn && resetBtn.addEventListener('click', reset);
  [ageInput, restingInput].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); }));
})();
