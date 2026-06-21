/**
 * MedicalToolKit — GFR Calculator
 * CKD-EPI 2021 equation (race-free)
 * Creatinine (mg/dL), Age, Gender → eGFR + CKD Stage
 */

(function () {
  'use strict';

  const creatInput  = document.getElementById('creatinine');
  const ageInput    = document.getElementById('ageGfr');
  const genderSel   = document.getElementById('genderGfr');
  const errorEl     = document.getElementById('gfrError');
  const calcBtn     = document.getElementById('calcGfr');
  const resetBtn    = document.getElementById('resetGfr');

  const resultBox   = document.getElementById('gfrResult');
  const resultIcon  = document.getElementById('gfrResultIcon');
  const gfrValueEl  = document.getElementById('gfrValue');
  const categoryEl  = document.getElementById('gfrCategory');
  const stageEl     = document.getElementById('gfrStage');
  const descEl      = document.getElementById('gfrDescription');
  const rangesEl    = document.getElementById('gfrRangeRows');

  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareTwitter  = document.getElementById('shareTwitter');
  const copyResultBtn = document.getElementById('copyResult');
  const toastEl       = document.getElementById('toast');

  const STAGES = [
    { min: 90,  max: Infinity, label: 'G1 — Normal or High',              cssClass: 'green',  boxClass: 'result-normal',  icon: '✅', description: 'Your eGFR of 90 or higher indicates normal or high kidney function (CKD G1). If you are in this category with no markers of kidney damage (no protein in urine, no structural changes), your kidneys are functioning well. Continue with routine health check-ups, stay hydrated, manage blood pressure and blood sugar, avoid NSAIDs and nephrotoxic substances, and maintain a kidney-friendly diet.' },
    { min: 60,  max: 90,  label: 'G2 — Mildly Decreased',                 cssClass: 'green',  boxClass: 'result-normal',  icon: '🟢', description: 'Your eGFR indicates mildly decreased kidney function (CKD G2, 60–89). This stage is generally not considered clinically significant on its own unless combined with markers of kidney damage such as proteinuria or hematuria. Your doctor will monitor your kidney function with periodic tests. Focus on controlling blood pressure, blood sugar (if diabetic), avoiding smoking, and maintaining healthy body weight.' },
    { min: 45,  max: 60,  label: 'G3a — Mild to Moderate Decrease',       cssClass: 'yellow', boxClass: 'result-warning', icon: '⚠️', description: 'Your eGFR indicates mild to moderately decreased kidney function (CKD G3a, 45–59). At this stage, complications such as anaemia, bone disease, and cardiovascular risk begin to increase. Your healthcare provider will likely schedule more frequent monitoring, review your medications for kidney toxicity, and may refer you to a nephrologist. Dietary adjustments (managing protein, sodium, phosphorus, and potassium) may be recommended.' },
    { min: 30,  max: 45,  label: 'G3b — Moderate to Severe Decrease',     cssClass: 'yellow', boxClass: 'result-warning', icon: '⚠️', description: 'Your eGFR indicates moderate to severely decreased kidney function (CKD G3b, 30–44). You are at significantly increased risk of cardiovascular disease and progression to kidney failure. A nephrologist referral is strongly recommended. Your care team will address complications of reduced kidney function including anaemia, secondary hyperparathyroidism, fluid and electrolyte imbalances, and cardiovascular risk factors.' },
    { min: 15,  max: 30,  label: 'G4 — Severely Decreased',               cssClass: 'red',    boxClass: 'result-danger',  icon: '🔴', description: 'Your eGFR indicates severely decreased kidney function (CKD G4, 15–29). At this stage, preparation for kidney replacement therapy (dialysis or transplant) should begin in discussion with your nephrologist. Strict dietary management, close monitoring of complications, and cardiovascular risk reduction are essential. Do not delay — consult a nephrologist promptly.' },
    { min: 0,   max: 15,  label: 'G5 — Kidney Failure',                   cssClass: 'red',    boxClass: 'result-danger',  icon: '🚨', description: 'Your eGFR indicates kidney failure (CKD G5, < 15). This is the most severe stage of chronic kidney disease. Kidney replacement therapy (dialysis or kidney transplant) is typically required. Urgent nephrologist consultation is necessary. Dialysis options include haemodialysis, peritoneal dialysis, or home dialysis. A kidney transplant may be appropriate depending on your overall health. Please seek immediate specialist care.' }
  ];

  function getStage(egfr) {
    return STAGES.find(s => egfr >= s.min && egfr < s.max) || STAGES[STAGES.length - 1];
  }

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
  function clearError()   { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  function hideResult()   { resultBox.classList.remove('show'); }

  function calculate() {
    clearError();
    const creat  = parseFloat(creatInput.value);
    const age    = parseInt(ageInput.value);
    const gender = genderSel.value;

    if (!creatInput.value || isNaN(creat) || creat <= 0 || creat > 30) {
      showError('Please enter a valid serum creatinine (0.1–30 mg/dL).'); creatInput.focus(); return;
    }
    if (!ageInput.value || isNaN(age) || age < 18 || age > 120) {
      showError('Please enter a valid age (18–120).'); ageInput.focus(); return;
    }

    /* CKD-EPI 2021 (race-free) */
    let egfr;
    if (gender === 'female') {
      const kappa = 0.7, alpha = -0.241;
      const ratio = creat / kappa;
      if (creat < kappa) {
        egfr = 142 * Math.pow(ratio, alpha) * Math.pow(0.9938, age) * 1.012;
      } else {
        egfr = 142 * Math.pow(ratio, -1.200) * Math.pow(0.9938, age) * 1.012;
      }
    } else {
      const kappa = 0.9, alpha = -0.302;
      const ratio = creat / kappa;
      if (creat < kappa) {
        egfr = 142 * Math.pow(ratio, alpha) * Math.pow(0.9938, age);
      } else {
        egfr = 142 * Math.pow(ratio, -1.200) * Math.pow(0.9938, age);
      }
    }

    const stage = getStage(Math.round(egfr));
    displayResult(egfr, stage);
  }

  function displayResult(egfr, stage) {
    const rounded = Math.round(egfr);
    resultIcon.textContent   = stage.icon;
    gfrValueEl.textContent   = rounded + ' mL/min/1.73m²';
    categoryEl.textContent   = stage.label;
    categoryEl.className     = 'result-category ' + stage.cssClass;
    if (stageEl) stageEl.textContent = stage.label;
    descEl.textContent       = stage.description;
    resultBox.className      = 'calc-result-box show ' + stage.boxClass;

    if (rangesEl) {
      rangesEl.innerHTML = [
        ['G1', '≥ 90', 'Normal or High', 'green'],
        ['G2', '60–89', 'Mildly Decreased', 'green'],
        ['G3a', '45–59', 'Mild-Moderate', 'yellow'],
        ['G3b', '30–44', 'Moderate-Severe', 'yellow'],
        ['G4', '15–29', 'Severely Decreased', 'red'],
        ['G5', '< 15', 'Kidney Failure', 'red']
      ].map(r => `<div class="bp-range-row ${r[3]}"><span>${r[0]}</span><span>${r[1]} mL/min/1.73m²</span><span>${r[2]}</span></div>`).join('');
    }

    resultBox.dataset.shareText = `My eGFR is ${rounded} mL/min/1.73m² — ${stage.label.split(' — ')[1]}. Calculate yours: https://medicaltoolkit.pages.dev/pages/gfr-calculator.html`;
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    creatInput.value = ''; ageInput.value = ''; genderSel.value = 'male';
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
  [creatInput, ageInput].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); }));
})();
