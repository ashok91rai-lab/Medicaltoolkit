/**
 * MedicalToolKit — BMI Calculator
 * Handles metric/imperial toggle, BMI computation, result display, share actions.
 */

(function () {
  'use strict';

  /* ── DOM references ── */
  const unitMetricBtn   = document.getElementById('unitMetric');
  const unitImperialBtn = document.getElementById('unitImperial');
  const metricInputs    = document.getElementById('metricInputs');
  const imperialInputs  = document.getElementById('imperialInputs');

  const weightKgInput   = document.getElementById('weightKg');
  const heightCmInput   = document.getElementById('heightCm');
  const weightLbsInput  = document.getElementById('weightLbs');
  const heightFtInput   = document.getElementById('heightFt');
  const heightInInput   = document.getElementById('heightIn');

  const calcBtn         = document.getElementById('calcBmi');
  const resetBtn        = document.getElementById('resetBmi');
  const errorEl         = document.getElementById('bmiError');

  const resultBox       = document.getElementById('bmiResult');
  const bmiValueEl      = document.getElementById('bmiValue');
  const bmiCategoryEl   = document.getElementById('bmiCategory');
  const bmiCategoryDetailEl = document.getElementById('bmiCategoryDetail');
  const bmiHealthyRangeEl   = document.getElementById('bmiHealthyRange');
  const bmiWeightDiffEl     = document.getElementById('bmiWeightDiff');
  const bmiDescriptionEl    = document.getElementById('bmiDescription');
  const bmiNeedle       = document.getElementById('bmiNeedle');
  const bmiResultIcon   = document.getElementById('bmiResultIcon');

  const shareWhatsapp   = document.getElementById('shareWhatsapp');
  const shareTwitter    = document.getElementById('shareTwitter');
  const copyResultBtn   = document.getElementById('copyResult');
  const printResultBtn  = document.getElementById('printResult');
  const toastEl         = document.getElementById('toast');

  /* ── State ── */
  let currentUnit = 'metric'; // 'metric' | 'imperial'

  /* ── Category config ── */
  const CATEGORIES = [
    {
      max: 18.5,
      label: 'Underweight',
      cssClass: 'blue',
      boxClass: 'result-info',
      icon: '📉',
      description: 'Your BMI indicates that you may be underweight. Being underweight can be associated with nutritional deficiencies, a weakened immune system, and bone loss. It may also be a sign of an underlying medical condition. We recommend speaking with a healthcare provider to discuss your weight and overall nutritional health. A registered dietitian can help you develop a plan to reach a healthy weight safely.'
    },
    {
      max: 25.0,
      label: 'Normal Weight',
      cssClass: 'green',
      boxClass: 'result-normal',
      icon: '✅',
      description: 'Excellent! Your BMI falls within the healthy weight range. This is associated with the lowest risk for weight-related diseases such as type 2 diabetes, hypertension, and cardiovascular disease. To maintain your healthy weight, continue with regular physical activity (at least 150 minutes of moderate exercise per week) and a balanced diet rich in whole foods, fruits, vegetables, lean proteins, and healthy fats.'
    },
    {
      max: 30.0,
      label: 'Overweight',
      cssClass: 'yellow',
      boxClass: 'result-warning',
      icon: '⚠️',
      description: 'Your BMI indicates you are in the overweight range. At this level, you have a moderately increased risk of developing type 2 diabetes, high blood pressure, and cardiovascular disease. Even a modest weight reduction of 5–10% of your body weight can significantly improve your health markers. Consider increasing physical activity and reviewing your diet with a healthcare professional or registered dietitian.'
    },
    {
      max: Infinity,
      label: 'Obese',
      cssClass: 'red',
      boxClass: 'result-danger',
      icon: '🔴',
      description: 'Your BMI falls in the obese range, which is associated with a substantially increased risk of serious health conditions including type 2 diabetes, heart disease, stroke, sleep apnea, osteoarthritis, and certain cancers. It is important to consult a healthcare provider for a comprehensive evaluation and personalised weight management plan. Lifestyle changes, medical support, and in some cases, specialist interventions can be highly effective.'
    }
  ];

  /* ── Unit toggle ── */
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

  unitMetricBtn.addEventListener('click', () => setUnit('metric'));
  unitImperialBtn.addEventListener('click', () => setUnit('imperial'));

  /* ── Validation helpers ── */
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

  /* ── BMI calculation ── */
  function computeBMI() {
    clearError();

    let bmi, heightM, weightKg;

    if (currentUnit === 'metric') {
      const wKg = parseFloat(weightKgInput.value);
      const hCm = parseFloat(heightCmInput.value);

      if (!weightKgInput.value || isNaN(wKg) || wKg <= 0 || wKg > 500) {
        showError('Please enter a valid weight between 1 and 500 kg.');
        weightKgInput.focus();
        return;
      }
      if (!heightCmInput.value || isNaN(hCm) || hCm < 50 || hCm > 300) {
        showError('Please enter a valid height between 50 and 300 cm.');
        heightCmInput.focus();
        return;
      }

      heightM  = hCm / 100;
      weightKg = wKg;
      bmi = wKg / (heightM * heightM);

    } else {
      const wLbs = parseFloat(weightLbsInput.value);
      const hFt  = parseFloat(heightFtInput.value) || 0;
      const hIn  = parseFloat(heightInInput.value) || 0;
      const totalInches = hFt * 12 + hIn;

      if (!weightLbsInput.value || isNaN(wLbs) || wLbs <= 0 || wLbs > 1100) {
        showError('Please enter a valid weight between 1 and 1100 lbs.');
        weightLbsInput.focus();
        return;
      }
      if (totalInches < 20 || totalInches > 120) {
        showError('Please enter a valid height (e.g., 5 ft 9 in).');
        heightFtInput.focus();
        return;
      }

      bmi = (703 * wLbs) / (totalInches * totalInches);
      heightM  = totalInches * 0.0254;
      weightKg = wLbs * 0.453592;
    }

    displayResult(bmi, heightM, weightKg);
  }

  /* ── Display result ── */
  function displayResult(bmi, heightM, weightKg) {
    const rounded = Math.round(bmi * 10) / 10;

    // Determine category
    const cat = CATEGORIES.find(c => bmi < c.max);

    // BMI value display
    bmiValueEl.textContent = rounded.toFixed(1);

    // Category badge
    bmiCategoryEl.textContent = cat.label;
    bmiCategoryEl.className = 'result-category ' + cat.cssClass;

    // Result box color
    resultBox.className = 'calc-result-box show ' + cat.boxClass;

    // Icon
    bmiResultIcon.textContent = cat.icon;

    // Category detail
    bmiCategoryDetailEl.textContent = cat.label;

    // Healthy weight range (BMI 18.5–24.9)
    const minHealthyKg = 18.5 * heightM * heightM;
    const maxHealthyKg = 24.9 * heightM * heightM;

    let rangeStr, diffStr;
    if (currentUnit === 'metric') {
      rangeStr = `${minHealthyKg.toFixed(1)} – ${maxHealthyKg.toFixed(1)} kg`;
      const diff = weightKg - maxHealthyKg;
      if (Math.abs(diff) < 0.5) {
        diffStr = 'You are at your healthy weight!';
      } else if (diff > 0) {
        diffStr = `Lose ${diff.toFixed(1)} kg to reach healthy range`;
      } else {
        const gainDiff = minHealthyKg - weightKg;
        diffStr = gainDiff > 0 ? `Gain ${gainDiff.toFixed(1)} kg to reach healthy range` : 'You are at your healthy weight!';
      }
    } else {
      const minHealthyLbs = minHealthyKg / 0.453592;
      const maxHealthyLbs = maxHealthyKg / 0.453592;
      rangeStr = `${minHealthyLbs.toFixed(0)} – ${maxHealthyLbs.toFixed(0)} lbs`;
      const weightLbs = weightKg / 0.453592;
      const diff = weightLbs - maxHealthyLbs;
      if (Math.abs(diff) < 1) {
        diffStr = 'You are at your healthy weight!';
      } else if (diff > 0) {
        diffStr = `Lose ${diff.toFixed(0)} lbs to reach healthy range`;
      } else {
        const gainDiff = (minHealthyKg - weightKg) / 0.453592;
        diffStr = gainDiff > 0.5 ? `Gain ${gainDiff.toFixed(0)} lbs to reach healthy range` : 'You are at your healthy weight!';
      }
    }

    bmiHealthyRangeEl.textContent = rangeStr;
    bmiWeightDiffEl.textContent = diffStr;

    // Description
    bmiDescriptionEl.textContent = cat.description;

    // Animate needle: map BMI 10–50 → 0%–100%
    const pct = Math.min(100, Math.max(0, ((bmi - 10) / 40) * 100));
    bmiNeedle.style.left = pct.toFixed(1) + '%';

    // Show result
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Cache result text for sharing
    resultBox.dataset.shareText = `My BMI is ${rounded.toFixed(1)} (${cat.label}). Calculate yours at MedicalToolKit: https://medicaltoolkit.pages.dev/pages/bmi-calculator.html`;
  }

  /* ── Reset ── */
  function resetCalculator() {
    weightKgInput.value  = '';
    heightCmInput.value  = '';
    weightLbsInput.value = '';
    heightFtInput.value  = '';
    heightInInput.value  = '';
    clearError();
    hideResult();
    setUnit('metric');
  }

  /* ── Share actions ── */
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  shareWhatsapp && shareWhatsapp.addEventListener('click', function () {
    const text = encodeURIComponent(resultBox.dataset.shareText || 'Check out this BMI calculator: https://medicaltoolkit.pages.dev/pages/bmi-calculator.html');
    window.open('https://wa.me/?text=' + text, '_blank', 'noopener');
  });

  shareTwitter && shareTwitter.addEventListener('click', function () {
    const text = encodeURIComponent(resultBox.dataset.shareText || 'Check out this BMI calculator!');
    const url  = encodeURIComponent('https://medicaltoolkit.pages.dev/pages/bmi-calculator.html');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
  });

  copyResultBtn && copyResultBtn.addEventListener('click', function () {
    const text = resultBox.dataset.shareText || '';
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text).then(() => showToast('Result copied to clipboard!')).catch(() => showToast('Could not copy. Please copy manually.'));
    } else {
      showToast('Copy not supported on this browser.');
    }
  });

  printResultBtn && printResultBtn.addEventListener('click', function () {
    window.print();
  });

  /* ── Event listeners ── */
  calcBtn.addEventListener('click', computeBMI);
  resetBtn.addEventListener('click', resetCalculator);

  // Allow Enter key to trigger calculation
  [weightKgInput, heightCmInput, weightLbsInput, heightFtInput, heightInInput].forEach(el => {
    el && el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') computeBMI();
    });
  });

})();
