/**
 * MedicalToolKit — Body Fat Calculator
 * US Navy Method: measurements in cm or inches
 * Shows healthy ranges by age and gender
 */

(function () {
  'use strict';

  const unitMetricBtn   = document.getElementById('unitMetric');
  const unitImperialBtn = document.getElementById('unitImperial');
  const metricInputs    = document.getElementById('metricInputs');
  const imperialInputs  = document.getElementById('imperialInputs');

  // Metric inputs
  const heightCmInput   = document.getElementById('heightCm');
  const waistCmInput    = document.getElementById('waistCm');
  const neckCmInput     = document.getElementById('neckCm');
  const hipCmInput      = document.getElementById('hipCm');
  const hipCmGroup      = document.getElementById('hipCmGroup');

  // Imperial inputs
  const heightInTotalInput = document.getElementById('heightInTotal');
  const waistInInput       = document.getElementById('waistIn');
  const neckInInput        = document.getElementById('neckIn');
  const hipInInput         = document.getElementById('hipIn');
  const hipInGroup         = document.getElementById('hipInGroup');

  const genderSelect    = document.getElementById('genderBf');
  const ageInput        = document.getElementById('ageBf');
  const errorEl         = document.getElementById('bfError');
  const calcBtn         = document.getElementById('calcBodyFat');
  const resetBtn        = document.getElementById('resetBodyFat');

  const resultBox       = document.getElementById('bfResult');
  const resultIcon      = document.getElementById('bfResultIcon');
  const bfValueEl       = document.getElementById('bfValue');
  const categoryEl      = document.getElementById('bfCategory');
  const descEl          = document.getElementById('bfDescription');
  const rangesEl        = document.getElementById('bfRangeRows');

  const shareWhatsapp   = document.getElementById('shareWhatsapp');
  const shareTwitter    = document.getElementById('shareTwitter');
  const copyResultBtn   = document.getElementById('copyResult');
  const toastEl         = document.getElementById('toast');

  let currentUnit = 'metric';

  /* Toggle gender-dependent hip input */
  function updateHipVisibility() {
    const isFemale = genderSelect.value === 'female';
    if (hipCmGroup)  hipCmGroup.style.display  = isFemale ? 'block' : 'none';
    if (hipInGroup)  hipInGroup.style.display   = isFemale ? 'block' : 'none';
    if (hipCmInput)  hipCmInput.required  = isFemale;
    if (hipInInput)  hipInInput.required  = isFemale;
    hideResult(); clearError();
  }

  genderSelect && genderSelect.addEventListener('change', updateHipVisibility);

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
    const age    = parseInt(ageInput.value);

    if (!ageInput.value || isNaN(age) || age < 10 || age > 100) {
      showError('Please enter a valid age (10–100).'); ageInput.focus(); return;
    }

    let heightCm, waistCm, neckCm, hipCm;

    if (currentUnit === 'metric') {
      heightCm = parseFloat(heightCmInput.value);
      waistCm  = parseFloat(waistCmInput.value);
      neckCm   = parseFloat(neckCmInput.value);
      hipCm    = gender === 'female' ? parseFloat(hipCmInput.value) : 0;

      if (isNaN(heightCm) || heightCm < 100 || heightCm > 280) { showError('Please enter a valid height (100–280 cm).'); return; }
      if (isNaN(waistCm)  || waistCm  < 40  || waistCm  > 200) { showError('Please enter a valid waist circumference.'); return; }
      if (isNaN(neckCm)   || neckCm   < 20  || neckCm   > 80)  { showError('Please enter a valid neck circumference.'); return; }
      if (gender === 'female' && (isNaN(hipCm) || hipCm < 50 || hipCm > 200)) { showError('Please enter a valid hip circumference.'); return; }
    } else {
      const hIn    = parseFloat(heightInTotalInput.value);
      const wIn    = parseFloat(waistInInput.value);
      const nIn    = parseFloat(neckInInput.value);
      const hipIn  = gender === 'female' ? parseFloat(hipInInput.value) : 0;

      if (isNaN(hIn)  || hIn  < 40  || hIn  > 110) { showError('Please enter a valid height in inches.'); return; }
      if (isNaN(wIn)  || wIn  < 15  || wIn  > 80)  { showError('Please enter a valid waist measurement.'); return; }
      if (isNaN(nIn)  || nIn  < 8   || nIn  > 32)  { showError('Please enter a valid neck measurement.'); return; }
      if (gender === 'female' && (isNaN(hipIn) || hipIn < 20 || hipIn > 80)) { showError('Please enter a valid hip measurement.'); return; }

      heightCm = hIn  * 2.54;
      waistCm  = wIn  * 2.54;
      neckCm   = nIn  * 2.54;
      hipCm    = hipIn * 2.54;
    }

    /* US Navy Method */
    let bodyFat;
    if (gender === 'male') {
      if (waistCm <= neckCm) { showError('Waist must be larger than neck circumference.'); return; }
      bodyFat = 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
    } else {
      if (waistCm + hipCm <= neckCm) { showError('Waist + hip must be greater than neck circumference.'); return; }
      bodyFat = 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
    }

    bodyFat = Math.max(2, Math.min(70, bodyFat));
    displayResult(bodyFat, gender, age);
  }

  /* Health ranges by gender and age (ACE guidelines) */
  function getCategory(bf, gender, age) {
    const isMale = gender === 'male';
    // Returns {label, cssClass, boxClass, icon}
    if (isMale) {
      if (bf < 6)  return { label: 'Essential Fat',  cssClass: 'blue',   boxClass: 'result-info',    icon: '📊' };
      if (bf < 14) return { label: 'Athletes',        cssClass: 'green',  boxClass: 'result-normal',  icon: '🏅' };
      if (bf < 18) return { label: 'Fitness',         cssClass: 'green',  boxClass: 'result-normal',  icon: '✅' };
      if (bf < 25) return { label: 'Average',         cssClass: 'yellow', boxClass: 'result-warning', icon: '⚠️' };
      return               { label: 'Obese',          cssClass: 'red',    boxClass: 'result-danger',  icon: '🔴' };
    } else {
      if (bf < 14) return { label: 'Essential Fat',  cssClass: 'blue',   boxClass: 'result-info',    icon: '📊' };
      if (bf < 21) return { label: 'Athletes',        cssClass: 'green',  boxClass: 'result-normal',  icon: '🏅' };
      if (bf < 25) return { label: 'Fitness',         cssClass: 'green',  boxClass: 'result-normal',  icon: '✅' };
      if (bf < 32) return { label: 'Average',         cssClass: 'yellow', boxClass: 'result-warning', icon: '⚠️' };
      return               { label: 'Obese',          cssClass: 'red',    boxClass: 'result-danger',  icon: '🔴' };
    }
  }

  const CATEGORY_DESCS = {
    'Essential Fat': 'Your body fat is at the essential fat level — the minimum required for basic physiological functions. This level is typically only seen in competitive athletes and may be difficult to maintain long-term. Monitor your health closely and consult a healthcare provider or sports dietitian.',
    'Athletes':      'Your body fat percentage is in the athletic range. This indicates a lean, well-conditioned physique typically seen in competitive athletes. Ensure you are consuming enough calories and nutrients to support your training and recovery needs.',
    'Fitness':       'Your body fat percentage is in the fitness range — an excellent result associated with good health and reduced risk of chronic disease. You have sufficient body fat to support hormonal function and energy reserves while maintaining a lean physique.',
    'Average':       'Your body fat percentage is in the average range. While not immediately concerning, moving toward the fitness range through regular exercise and a balanced diet would improve your health, energy levels, and reduce your risk of metabolic diseases.',
    'Obese':         'Your body fat percentage is in the obese range, which is associated with increased risk of type 2 diabetes, cardiovascular disease, joint problems, and metabolic syndrome. Consult a healthcare provider to develop a safe, sustainable plan to reduce body fat through exercise and dietary changes.'
  };

  function displayResult(bf, gender, age) {
    const cat = getCategory(bf, gender, age);
    resultIcon.textContent   = cat.icon;
    bfValueEl.textContent    = bf.toFixed(1) + '%';
    categoryEl.textContent   = cat.label;
    categoryEl.className     = 'result-category ' + cat.cssClass;
    descEl.textContent       = CATEGORY_DESCS[cat.label] || '';
    resultBox.className      = 'calc-result-box show ' + cat.boxClass;

    if (rangesEl) {
      const isMale = gender === 'male';
      const rows = isMale ? [
        ['Essential Fat', '2–5%', 'green'], ['Athletes', '6–13%', 'green'], ['Fitness', '14–17%', 'green'],
        ['Average', '18–24%', 'yellow'], ['Obese', '≥ 25%', 'red']
      ] : [
        ['Essential Fat', '10–13%', 'green'], ['Athletes', '14–20%', 'green'], ['Fitness', '21–24%', 'green'],
        ['Average', '25–31%', 'yellow'], ['Obese', '≥ 32%', 'red']
      ];
      rangesEl.innerHTML = rows.map(r => `<div class="bp-range-row ${r[2]}"><span>${r[0]}</span><span>${r[1]} body fat</span></div>`).join('');
    }

    resultBox.dataset.shareText = `My body fat is ${bf.toFixed(1)}% (${cat.label}). Calculate yours free: https://medicaltoolkit.pages.dev/pages/body-fat-calculator.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    [heightCmInput, waistCmInput, neckCmInput, hipCmInput, heightInTotalInput, waistInInput, neckInInput, hipInInput, ageInput].forEach(el => { if (el) el.value = ''; });
    clearError(); hideResult(); setUnit('metric'); updateHipVisibility();
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

  // Init
  updateHipVisibility();
})();
