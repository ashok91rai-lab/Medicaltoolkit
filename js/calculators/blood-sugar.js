/**
 * MedicalToolKit — Blood Sugar Calculator
 * ADA-guideline ranges for fasting, post-meal, and random tests.
 * Converts between mg/dL and mmol/L.
 */

(function () {
  'use strict';

  const unitMgdlBtn   = document.getElementById('unitMgdl');
  const unitMmolBtn   = document.getElementById('unitMmol');
  const glucoseInput  = document.getElementById('glucoseValue');
  const glucoseSuffix = document.getElementById('glucoseSuffix');
  const glucoseUnitLbl= document.getElementById('glucoseUnit');
  const testTypeSelect= document.getElementById('testType');
  const errorEl       = document.getElementById('glucoseError');
  const calcBtn       = document.getElementById('calcBloodSugar');
  const resetBtn      = document.getElementById('resetBloodSugar');

  const resultBox     = document.getElementById('bsResult');
  const resultIcon    = document.getElementById('bsResultIcon');
  const valueDisplay  = document.getElementById('bsValueDisplay');
  const categoryEl    = document.getElementById('bsCategory');
  const mgdlEl        = document.getElementById('bsMgdl');
  const mmolEl        = document.getElementById('bsMmol');
  const descEl        = document.getElementById('bsDescription');
  const rangeRowsEl   = document.getElementById('bsRangeRows');

  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareTwitter  = document.getElementById('shareTwitter');
  const copyResultBtn = document.getElementById('copyResult');
  const toastEl       = document.getElementById('toast');

  let currentUnit = 'mgdl';

  /* ── ADA Reference Ranges ── */
  const RANGES = {
    fasting: [
      { label: 'Normal',      max: 100,  cssClass: 'green',  boxClass: 'result-normal',  icon: '✅', description: 'Your fasting blood sugar is within the normal range according to ADA guidelines. This is a great sign of healthy glucose metabolism. To maintain these levels, continue with a balanced diet, regular physical activity, and routine check-ups with your healthcare provider.' },
      { label: 'Prediabetes', max: 126,  cssClass: 'yellow', boxClass: 'result-warning', icon: '⚠️', description: 'Your fasting blood glucose falls in the prediabetes range (100–125 mg/dL). This means your blood sugar is elevated but not yet high enough for a diabetes diagnosis. Prediabetes is largely reversible — research shows that losing 5–7% of body weight and getting 150 minutes of moderate exercise weekly can reduce progression to diabetes by 58%. Please consult your healthcare provider.' },
      { label: 'Diabetes',    max: Infinity, cssClass: 'red', boxClass: 'result-danger', icon: '🔴', description: 'Your fasting blood glucose is at or above the diabetes diagnostic threshold (≥126 mg/dL). This result alone does not diagnose diabetes — a repeat test on a separate day is required for diagnosis. Please speak with your doctor as soon as possible. Early intervention and proper management can prevent or delay serious complications.' }
    ],
    postmeal: [
      { label: 'Normal',      max: 140,  cssClass: 'green',  boxClass: 'result-normal',  icon: '✅', description: 'Your 2-hour post-meal blood sugar is within the normal range. A level below 140 mg/dL two hours after eating indicates that your body is effectively processing glucose. Keep up your healthy eating habits and regular physical activity to maintain this excellent glucose response.' },
      { label: 'Prediabetes', max: 200,  cssClass: 'yellow', boxClass: 'result-warning', icon: '⚠️', description: 'Your 2-hour post-meal glucose (140–199 mg/dL) falls in the prediabetes range, also called impaired glucose tolerance. This suggests your body has some difficulty clearing glucose from the bloodstream after meals. Reducing refined carbohydrates, increasing fibre intake, and adding physical activity after meals can significantly improve post-meal glucose response.' },
      { label: 'Diabetes',    max: Infinity, cssClass: 'red', boxClass: 'result-danger', icon: '🔴', description: 'Your 2-hour post-meal blood glucose is at or above 200 mg/dL, which is consistent with a diabetes diagnosis. Do not rely on a single reading — always confirm with your doctor. If you have classic diabetes symptoms (increased thirst, frequent urination, unexplained weight loss) alongside this result, seek medical attention promptly.' }
    ],
    random: [
      { label: 'Normal',      max: 140,  cssClass: 'green',  boxClass: 'result-normal',  icon: '✅', description: 'Your random blood glucose reading appears to be within a healthy range. Note that random readings vary significantly depending on when you last ate and your recent activity level, so this reading should be interpreted alongside fasting or post-meal tests for a complete picture.' },
      { label: 'Elevated',    max: 200,  cssClass: 'yellow', boxClass: 'result-warning', icon: '⚠️', description: 'Your random blood glucose is elevated. Random readings of 140–199 mg/dL may be normal shortly after a meal but could indicate impaired glucose tolerance if the reading is taken in a fasted state. Follow up with a fasting glucose test or HbA1c to get a clearer picture of your glucose control.' },
      { label: 'Diabetes',    max: Infinity, cssClass: 'red', boxClass: 'result-danger', icon: '🔴', description: 'A random blood glucose of 200 mg/dL or higher, especially if accompanied by symptoms such as excessive thirst, frequent urination, or unexplained fatigue, is considered diagnostic of diabetes. Please consult your healthcare provider for confirmation and a comprehensive management plan.' }
    ]
  };

  const ADA_LABELS = {
    fasting:  [['Normal', '< 100 mg/dL'], ['Prediabetes', '100–125 mg/dL'], ['Diabetes', '≥ 126 mg/dL']],
    postmeal: [['Normal', '< 140 mg/dL'], ['Prediabetes', '140–199 mg/dL'], ['Diabetes', '≥ 200 mg/dL']],
    random:   [['Normal', '< 140 mg/dL'], ['Elevated', '140–199 mg/dL'], ['Diabetes', '≥ 200 mg/dL']]
  };

  /* ── Unit toggle ── */
  function setUnit(unit) {
    currentUnit = unit;
    if (unit === 'mgdl') {
      unitMgdlBtn.classList.add('active');
      unitMgdlBtn.setAttribute('aria-pressed', 'true');
      unitMmolBtn.classList.remove('active');
      unitMmolBtn.setAttribute('aria-pressed', 'false');
      if (glucoseSuffix) glucoseSuffix.textContent = 'mg/dL';
      if (glucoseUnitLbl) glucoseUnitLbl.textContent = '(mg/dL)';
      glucoseInput.placeholder = 'e.g. 95';
      glucoseInput.max = 1000;
    } else {
      unitMmolBtn.classList.add('active');
      unitMmolBtn.setAttribute('aria-pressed', 'true');
      unitMgdlBtn.classList.remove('active');
      unitMgdlBtn.setAttribute('aria-pressed', 'false');
      if (glucoseSuffix) glucoseSuffix.textContent = 'mmol/L';
      if (glucoseUnitLbl) glucoseUnitLbl.textContent = '(mmol/L)';
      glucoseInput.placeholder = 'e.g. 5.3';
      glucoseInput.max = 56;
    }
    hideResult();
    clearError();
  }

  unitMgdlBtn && unitMgdlBtn.addEventListener('click', () => setUnit('mgdl'));
  unitMmolBtn && unitMmolBtn.addEventListener('click', () => setUnit('mmol'));

  /* ── Error helpers ── */
  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }
  function clearError() {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }
  function hideResult() {
    resultBox.classList.remove('show');
  }

  /* ── Calculate ── */
  function calculate() {
    clearError();
    const rawVal = parseFloat(glucoseInput.value);
    if (!glucoseInput.value || isNaN(rawVal) || rawVal <= 0) {
      showError('Please enter a valid blood glucose value.');
      glucoseInput.focus();
      return;
    }

    let mgdl, mmol;
    if (currentUnit === 'mgdl') {
      if (rawVal < 10 || rawVal > 1000) {
        showError('Please enter a value between 10 and 1000 mg/dL.');
        return;
      }
      mgdl = rawVal;
      mmol = rawVal / 18.0182;
    } else {
      if (rawVal < 0.5 || rawVal > 55) {
        showError('Please enter a value between 0.5 and 55 mmol/L.');
        return;
      }
      mmol = rawVal;
      mgdl = rawVal * 18.0182;
    }

    const testType = testTypeSelect.value;
    const ranges   = RANGES[testType];
    const cat      = ranges.find(r => mgdl < r.max);

    displayResult(mgdl, mmol, cat, testType);
  }

  /* ── Display ── */
  function displayResult(mgdl, mmol, cat, testType) {
    const displayVal = currentUnit === 'mgdl'
      ? mgdl.toFixed(0) + ' mg/dL'
      : mmol.toFixed(1) + ' mmol/L';

    resultIcon.textContent      = cat.icon;
    valueDisplay.textContent    = displayVal;
    categoryEl.textContent      = cat.label;
    categoryEl.className        = 'result-category ' + cat.cssClass;
    mgdlEl.textContent          = mgdl.toFixed(0) + ' mg/dL';
    mmolEl.textContent          = mmol.toFixed(1) + ' mmol/L';
    descEl.textContent          = cat.description;
    resultBox.className         = 'calc-result-box show ' + cat.boxClass;

    /* Build ADA reference rows */
    if (rangeRowsEl) {
      const colors = ['green','yellow','red'];
      rangeRowsEl.innerHTML = ADA_LABELS[testType].map((row, i) => `
        <div class="bp-range-row ${colors[i]}">
          <span>${row[0]}</span>
          <span>${row[1]}</span>
        </div>`).join('');
    }

    resultBox.dataset.shareText = `My blood sugar is ${mgdl.toFixed(0)} mg/dL (${cat.label}). Check yours free: https://medicaltoolkit.pages.dev/pages/blood-sugar-calculator.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Reset ── */
  function reset() {
    glucoseInput.value = '';
    testTypeSelect.value = 'fasting';
    clearError();
    hideResult();
    setUnit('mgdl');
  }

  /* ── Share ── */
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  shareWhatsapp && shareWhatsapp.addEventListener('click', () => {
    const text = encodeURIComponent(resultBox.dataset.shareText || 'Check my blood sugar: https://medicaltoolkit.pages.dev/pages/blood-sugar-calculator.html');
    window.open('https://wa.me/?text=' + text, '_blank', 'noopener');
  });

  shareTwitter && shareTwitter.addEventListener('click', () => {
    const text = encodeURIComponent(resultBox.dataset.shareText || '');
    const url  = encodeURIComponent('https://medicaltoolkit.pages.dev/pages/blood-sugar-calculator.html');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
  });

  copyResultBtn && copyResultBtn.addEventListener('click', () => {
    const text = resultBox.dataset.shareText || '';
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text).then(() => showToast('Result copied! ✅')).catch(() => showToast('Could not copy.'));
    }
  });

  calcBtn.addEventListener('click', calculate);
  resetBtn.addEventListener('click', reset);
  glucoseInput.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
})();
