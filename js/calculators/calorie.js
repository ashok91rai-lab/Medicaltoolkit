/**
 * MedicalToolKit — Calorie Calculator
 * Mifflin-St Jeor BMR + activity multipliers
 * Shows maintenance calories, deficit/surplus, and macro breakdown
 */

(function () {
  'use strict';

  const unitMetricBtn   = document.getElementById('unitMetric');
  const unitImperialBtn = document.getElementById('unitImperial');
  const metricInputs    = document.getElementById('metricInputs');
  const imperialInputs  = document.getElementById('imperialInputs');

  const weightKgInput  = document.getElementById('weightKg');
  const heightCmInput  = document.getElementById('heightCm');
  const weightLbsInput = document.getElementById('weightLbs');
  const heightFtInput  = document.getElementById('heightFt');
  const heightInInput  = document.getElementById('heightIn');
  const ageInput       = document.getElementById('ageInput');
  const genderSelect   = document.getElementById('genderSelect');
  const activitySelect = document.getElementById('activityLevel');

  const calcBtn        = document.getElementById('calcCalories');
  const resetBtn       = document.getElementById('resetCalories');
  const errorEl        = document.getElementById('calorieError');

  const resultBox      = document.getElementById('calorieResult');
  const bmrEl          = document.getElementById('resultBmr');
  const tdeeEl         = document.getElementById('resultTdee');
  const deficitEl      = document.getElementById('resultDeficit');
  const surplusEl      = document.getElementById('resultSurplus');
  const proteinEl      = document.getElementById('resultProtein');
  const carbsEl        = document.getElementById('resultCarbs');
  const fatEl          = document.getElementById('resultFat');
  const activityLabelEl= document.getElementById('resultActivityLabel');

  const shareWhatsapp  = document.getElementById('shareWhatsapp');
  const shareTwitter   = document.getElementById('shareTwitter');
  const copyResultBtn  = document.getElementById('copyResult');
  const toastEl        = document.getElementById('toast');

  let currentUnit = 'metric';

  const ACTIVITY_LABELS = {
    sedentary:    { label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
    light:        { label: 'Lightly Active (1–3 days/week)',    multiplier: 1.375 },
    moderate:     { label: 'Moderately Active (3–5 days/week)', multiplier: 1.55 },
    very:         { label: 'Very Active (6–7 days/week)',        multiplier: 1.725 },
    extra:        { label: 'Extra Active (physical job + training)', multiplier: 1.9 }
  };

  function setUnit(unit) {
    currentUnit = unit;
    if (unit === 'metric') {
      unitMetricBtn.classList.add('active');
      unitMetricBtn.setAttribute('aria-pressed', 'true');
      unitImperialBtn.classList.remove('active');
      unitImperialBtn.setAttribute('aria-pressed', 'false');
      metricInputs.style.display = 'block';
      imperialInputs.style.display = 'none';
    } else {
      unitImperialBtn.classList.add('active');
      unitImperialBtn.setAttribute('aria-pressed', 'true');
      unitMetricBtn.classList.remove('active');
      unitMetricBtn.setAttribute('aria-pressed', 'false');
      imperialInputs.style.display = 'block';
      metricInputs.style.display = 'none';
    }
    hideResult();
    clearError();
  }

  unitMetricBtn && unitMetricBtn.addEventListener('click', () => setUnit('metric'));
  unitImperialBtn && unitImperialBtn.addEventListener('click', () => setUnit('imperial'));

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
  function clearError()   { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  function hideResult()   { resultBox.classList.remove('show'); }

  function calculate() {
    clearError();

    const age    = parseInt(ageInput.value);
    const gender = genderSelect.value;
    const actKey = activitySelect.value;

    if (!age || isNaN(age) || age < 15 || age > 100) {
      showError('Please enter a valid age between 15 and 100.'); ageInput.focus(); return;
    }

    let weightKg, heightCm;

    if (currentUnit === 'metric') {
      weightKg = parseFloat(weightKgInput.value);
      heightCm = parseFloat(heightCmInput.value);
      if (!weightKgInput.value || isNaN(weightKg) || weightKg < 20 || weightKg > 500) {
        showError('Please enter a valid weight (20–500 kg).'); weightKgInput.focus(); return;
      }
      if (!heightCmInput.value || isNaN(heightCm) || heightCm < 100 || heightCm > 280) {
        showError('Please enter a valid height (100–280 cm).'); heightCmInput.focus(); return;
      }
    } else {
      const lbs = parseFloat(weightLbsInput.value);
      const ft  = parseFloat(heightFtInput.value) || 0;
      const ins = parseFloat(heightInInput.value) || 0;
      const totalIn = ft * 12 + ins;
      if (!weightLbsInput.value || isNaN(lbs) || lbs < 44 || lbs > 1100) {
        showError('Please enter a valid weight (44–1100 lbs).'); weightLbsInput.focus(); return;
      }
      if (totalIn < 40 || totalIn > 110) {
        showError('Please enter a valid height.'); heightFtInput.focus(); return;
      }
      weightKg = lbs * 0.453592;
      heightCm = totalIn * 2.54;
    }

    /* Mifflin-St Jeor BMR */
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }

    const actInfo = ACTIVITY_LABELS[actKey] || ACTIVITY_LABELS.sedentary;
    const tdee    = bmr * actInfo.multiplier;
    const deficit = tdee - 500;
    const surplus = tdee + 300;

    /* Macros (40% carbs, 30% protein, 30% fat of TDEE) */
    const proteinCal = tdee * 0.30;
    const carbsCal   = tdee * 0.40;
    const fatCal     = tdee * 0.30;
    const proteinG   = proteinCal / 4;
    const carbsG     = carbsCal / 4;
    const fatG       = fatCal / 9;

    displayResult(bmr, tdee, deficit, surplus, proteinG, carbsG, fatG, actInfo.label);
  }

  function displayResult(bmr, tdee, deficit, surplus, protein, carbs, fat, actLabel) {
    bmrEl.textContent          = Math.round(bmr) + ' cal/day';
    tdeeEl.textContent         = Math.round(tdee) + ' cal/day';
    deficitEl.textContent      = Math.round(deficit) + ' cal/day';
    surplusEl.textContent      = Math.round(surplus) + ' cal/day';
    proteinEl.textContent      = Math.round(protein) + 'g';
    carbsEl.textContent        = Math.round(carbs) + 'g';
    fatEl.textContent          = Math.round(fat) + 'g';
    if (activityLabelEl) activityLabelEl.textContent = actLabel;

    resultBox.dataset.shareText = `My daily calorie need is ${Math.round(tdee)} calories (TDEE). Calculate yours free: https://medicaltoolkit.pages.dev/pages/calorie-calculator.html`;
    resultBox.className = 'calc-result-box show result-normal';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    [weightKgInput, heightCmInput, weightLbsInput, heightFtInput, heightInInput, ageInput].forEach(el => { if (el) el.value = ''; });
    if (genderSelect)   genderSelect.value   = 'male';
    if (activitySelect) activitySelect.value = 'sedentary';
    clearError();
    hideResult();
    setUnit('metric');
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  shareWhatsapp && shareWhatsapp.addEventListener('click', () => {
    const text = encodeURIComponent(resultBox.dataset.shareText || '');
    window.open('https://wa.me/?text=' + text, '_blank', 'noopener');
  });
  shareTwitter && shareTwitter.addEventListener('click', () => {
    const text = encodeURIComponent(resultBox.dataset.shareText || '');
    const url  = encodeURIComponent('https://medicaltoolkit.pages.dev/pages/calorie-calculator.html');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
  });
  copyResultBtn && copyResultBtn.addEventListener('click', () => {
    const text = resultBox.dataset.shareText || '';
    if (navigator.clipboard && text) navigator.clipboard.writeText(text).then(() => showToast('Result copied! ✅')).catch(() => showToast('Could not copy.'));
  });

  calcBtn  && calcBtn.addEventListener('click', calculate);
  resetBtn && resetBtn.addEventListener('click', reset);
  [weightKgInput, heightCmInput, weightLbsInput, ageInput].forEach(el => {
    el && el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  });
})();
