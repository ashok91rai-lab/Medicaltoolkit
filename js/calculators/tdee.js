/**
 * MedicalToolKit — TDEE Calculator
 * Mifflin-St Jeor BMR × activity multiplier
 * Shows goal-based calorie targets + macros for each goal
 */

(function () {
  'use strict';

  const unitMetricBtn   = document.getElementById('unitMetric');
  const unitImperialBtn = document.getElementById('unitImperial');
  const metricInputs    = document.getElementById('metricInputs');
  const imperialInputs  = document.getElementById('imperialInputs');

  const weightKgInput   = document.getElementById('weightKg');
  const heightCmInput   = document.getElementById('heightCm');
  const weightLbsInput  = document.getElementById('weightLbs');
  const heightFtInput   = document.getElementById('heightFt');
  const heightInInput   = document.getElementById('heightIn');
  const ageInput        = document.getElementById('tdeeAge');
  const genderSelect    = document.getElementById('tdeeGender');
  const activitySelect  = document.getElementById('tdeeActivity');
  const errorEl         = document.getElementById('tdeeError');
  const calcBtn         = document.getElementById('calcTdee');
  const resetBtn        = document.getElementById('resetTdee');

  const resultBox       = document.getElementById('tdeeResult');
  const bmrEl           = document.getElementById('tdeeBmr');
  const tdeeEl          = document.getElementById('tdeeMaintain');
  const loseEl          = document.getElementById('tdeeLose');
  const loseFastEl      = document.getElementById('tdeeLoseFast');
  const gainEl          = document.getElementById('tdeeGain');
  const macrosTdeeEl    = document.getElementById('macrosMaintain');
  const macrosLoseEl    = document.getElementById('macrosLose');
  const macrosGainEl    = document.getElementById('macrosGain');

  const shareWhatsapp   = document.getElementById('shareWhatsapp');
  const shareTwitter    = document.getElementById('shareTwitter');
  const copyResultBtn   = document.getElementById('copyResult');
  const toastEl         = document.getElementById('toast');

  let currentUnit = 'metric';

  const ACTIVITY = {
    sedentary: { label: 'Sedentary (desk job, no exercise)', multiplier: 1.2 },
    light:     { label: 'Lightly Active (1–3 days/week)',    multiplier: 1.375 },
    moderate:  { label: 'Moderately Active (3–5 days/week)', multiplier: 1.55 },
    very:      { label: 'Very Active (6–7 days/week)',        multiplier: 1.725 },
    extra:     { label: 'Extra Active (physical job + gym)',  multiplier: 1.9 }
  };

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

    const age    = parseInt(ageInput.value);
    const gender = genderSelect.value;
    const actKey = activitySelect.value;

    if (!age || isNaN(age) || age < 15 || age > 100) {
      showError('Please enter a valid age (15–100).'); ageInput.focus(); return;
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
        showError('Please enter a valid weight.'); weightLbsInput.focus(); return;
      }
      if (totalIn < 40 || totalIn > 110) {
        showError('Please enter a valid height.'); heightFtInput.focus(); return;
      }
      weightKg = lbs * 0.453592;
      heightCm = totalIn * 2.54;
    }

    /* Mifflin-St Jeor BMR */
    let bmr = gender === 'male'
      ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
      : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;

    const actInfo = ACTIVITY[actKey] || ACTIVITY.sedentary;
    const tdee    = bmr * actInfo.multiplier;

    displayResult(bmr, tdee);
  }

  function macroString(cal) {
    const p = Math.round(cal * 0.30 / 4);
    const c = Math.round(cal * 0.40 / 4);
    const f = Math.round(cal * 0.30 / 9);
    return `Protein: ${p}g • Carbs: ${c}g • Fat: ${f}g`;
  }

  function displayResult(bmr, tdee) {
    const lose     = Math.round(tdee - 500);
    const loseFast = Math.round(tdee - 1000);
    const gain     = Math.round(tdee + 300);

    bmrEl.textContent        = Math.round(bmr) + ' cal/day';
    tdeeEl.textContent       = Math.round(tdee) + ' cal/day';
    loseEl.textContent       = `${lose} cal/day  (−0.5 kg/week)`;
    loseFastEl.textContent   = `${loseFast} cal/day  (−1 kg/week)`;
    gainEl.textContent       = `${gain} cal/day  (+0.3 kg/week)`;

    if (macrosTdeeEl) macrosTdeeEl.textContent = macroString(tdee);
    if (macrosLoseEl) macrosLoseEl.textContent = macroString(lose);
    if (macrosGainEl) macrosGainEl.textContent = macroString(gain);

    resultBox.className = 'calc-result-box show result-normal';
    resultBox.dataset.shareText = `My TDEE is ${Math.round(tdee)} calories/day. Calculate yours free: https://medicaltoolkit.pages.dev/pages/tdee-calculator.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    [weightKgInput, heightCmInput, weightLbsInput, heightFtInput, heightInInput, ageInput].forEach(el => { if (el) el.value = ''; });
    if (genderSelect)   genderSelect.value   = 'male';
    if (activitySelect) activitySelect.value = 'sedentary';
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
  [weightKgInput, heightCmInput, ageInput].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); }));
})();
