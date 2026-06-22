/**
 * MedicalToolKit — Ideal Weight Calculator
 * Three formulas: Devine, Robinson, Miller
 * Shows all 3 results + average
 */

(function () {
  'use strict';

  const unitMetricBtn   = document.getElementById('unitMetric');
  const unitImperialBtn = document.getElementById('unitImperial');
  const metricInputs    = document.getElementById('metricInputs');
  const imperialInputs  = document.getElementById('imperialInputs');

  const heightCmInput   = document.getElementById('heightCm');
  const heightFtInput   = document.getElementById('heightFt');
  const heightInInput   = document.getElementById('heightIn');
  const genderSelect    = document.getElementById('genderIw');
  const errorEl         = document.getElementById('iwError');
  const calcBtn         = document.getElementById('calcIdealWeight');
  const resetBtn        = document.getElementById('resetIdealWeight');

  const resultBox       = document.getElementById('iwResult');
  const devineEl        = document.getElementById('iwDevine');
  const robinsonEl      = document.getElementById('iwRobinson');
  const millerEl        = document.getElementById('iwMiller');
  const averageEl       = document.getElementById('iwAverage');
  const rangeEl         = document.getElementById('iwRange');
  const descEl          = document.getElementById('iwDescription');

  const shareWhatsapp   = document.getElementById('shareWhatsapp');
  const shareTwitter    = document.getElementById('shareTwitter');
  const copyResultBtn   = document.getElementById('copyResult');
  const toastEl         = document.getElementById('toast');

  let currentUnit = 'metric';

  function setUnit(unit) {
    currentUnit = unit;
    if (unit === 'metric') {
      unitMetricBtn.classList.add('active'); unitMetricBtn.setAttribute('aria-pressed', 'true');
      unitImperialBtn.classList.remove('active'); unitImperialBtn.setAttribute('aria-pressed', 'false');
      metricInputs.style.display   = 'block';
      imperialInputs.style.display = 'none';
    } else {
      unitImperialBtn.classList.add('active'); unitImperialBtn.setAttribute('aria-pressed', 'true');
      unitMetricBtn.classList.remove('active'); unitMetricBtn.setAttribute('aria-pressed', 'false');
      imperialInputs.style.display = 'block';
      metricInputs.style.display   = 'none';
    }
    hideResult(); clearError();
  }

  unitMetricBtn   && unitMetricBtn.addEventListener('click',   () => setUnit('metric'));
  unitImperialBtn && unitImperialBtn.addEventListener('click', () => setUnit('imperial'));

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
  function clearError()   { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  function hideResult()   { resultBox.classList.remove('show'); }

  function calculate() {
    clearError();
    const gender = genderSelect.value;

    let totalInches;
    if (currentUnit === 'metric') {
      const hCm = parseFloat(heightCmInput.value);
      if (!heightCmInput.value || isNaN(hCm) || hCm < 100 || hCm > 280) {
        showError('Please enter a valid height (100–280 cm).'); heightCmInput.focus(); return;
      }
      totalInches = hCm / 2.54;
    } else {
      const ft  = parseFloat(heightFtInput.value) || 0;
      const ins = parseFloat(heightInInput.value) || 0;
      totalInches = ft * 12 + ins;
      if (totalInches < 40 || totalInches > 110) {
        showError('Please enter a valid height.'); heightFtInput.focus(); return;
      }
    }

    const inchesOver5ft = totalInches - 60; // over 5 feet

    /* Three ideal weight formulas (result in kg) */
    let devine, robinson, miller;

    if (gender === 'male') {
      devine   = 50   + 2.3   * inchesOver5ft;
      robinson = 52   + 1.9   * inchesOver5ft;
      miller   = 56.2 + 1.41  * inchesOver5ft;
    } else {
      devine   = 45.5 + 2.3   * inchesOver5ft;
      robinson = 49   + 1.7   * inchesOver5ft;
      miller   = 53.1 + 1.36  * inchesOver5ft;
    }

    const avg = (devine + robinson + miller) / 3;

    displayResult(devine, robinson, miller, avg, gender);
  }

  function kgLbs(kg) { return (kg * 2.20462).toFixed(0); }

  function fmt(kg) {
    if (currentUnit === 'metric') return `${kg.toFixed(1)} kg`;
    return `${kgLbs(kg)} lbs (${kg.toFixed(1)} kg)`;
  }

  function displayResult(devine, robinson, miller, avg, gender) {
    devineEl.textContent    = fmt(devine);
    robinsonEl.textContent  = fmt(robinson);
    millerEl.textContent    = fmt(miller);
    averageEl.textContent   = fmt(avg);

    const minKg = Math.min(devine, robinson, miller);
    const maxKg = Math.max(devine, robinson, miller);
    rangeEl.textContent     = currentUnit === 'metric'
      ? `${minKg.toFixed(1)} – ${maxKg.toFixed(1)} kg`
      : `${kgLbs(minKg)} – ${kgLbs(maxKg)} lbs`;

    descEl.textContent = `Based on three clinically validated formulas, your ideal body weight range is approximately ${fmt(minKg)} to ${fmt(maxKg)}. The average across all three formulas is ${fmt(avg)}. These are mathematical estimates based solely on your height and sex — they do not account for muscle mass, bone density, age, or body composition. Use this as a general reference alongside your BMI and body fat percentage for a more complete picture of your healthy weight range.`;

    resultBox.className = 'calc-result-box show result-normal';
    resultBox.dataset.shareText = `My ideal weight is around ${fmt(avg)} according to clinical formulas. Calculate yours: https://medicaltoolkit.pages.dev/pages/ideal-weight-calculator.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    if (heightCmInput) heightCmInput.value = '';
    if (heightFtInput) heightFtInput.value = '';
    if (heightInInput) heightInInput.value = '';
    if (genderSelect) genderSelect.value = 'male';
    clearError(); hideResult(); setUnit('metric');
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
  [heightCmInput, heightFtInput, heightInInput].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); }));
})();
