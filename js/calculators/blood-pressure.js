/**
 * MedicalToolKit — Blood Pressure Checker
 * AHA 2017 categories: Normal, Elevated, Stage 1 & 2 Hypertension, Crisis
 */

(function () {
  'use strict';

  const systolicInput  = document.getElementById('systolicValue');
  const diastolicInput = document.getElementById('diastolicValue');
  const pulseInput     = document.getElementById('pulseValue');
  const errorEl        = document.getElementById('bpError');
  const calcBtn        = document.getElementById('calcBP');
  const resetBtn       = document.getElementById('resetBP');

  const resultBox      = document.getElementById('bpResult');
  const resultIcon     = document.getElementById('bpResultIcon');
  const categoryEl     = document.getElementById('bpCategory');
  const systolicDisp   = document.getElementById('bpSystolic');
  const diastolicDisp  = document.getElementById('bpDiastolic');
  const pulsePressDisp = document.getElementById('bpPulsePressure');
  const descEl         = document.getElementById('bpDescription');
  const rangesEl       = document.getElementById('bpRangeRows');

  const shareWhatsapp  = document.getElementById('shareWhatsapp');
  const shareTwitter   = document.getElementById('shareTwitter');
  const copyResultBtn  = document.getElementById('copyResult');
  const toastEl        = document.getElementById('toast');

  const CATEGORIES = [
    {
      id: 'normal',
      label: 'Normal',
      cssClass: 'green',
      boxClass: 'result-normal',
      icon: '✅',
      systMax: 120, diastMax: 80,
      description: 'Your blood pressure is in the normal range. Blood pressure below 120/80 mmHg is considered healthy. To maintain these levels, continue with a heart-healthy lifestyle: eat a diet rich in fruits, vegetables, and low-fat dairy (DASH diet), limit sodium to under 2,300 mg/day, stay physically active, maintain a healthy weight, avoid smoking, and limit alcohol. Schedule regular check-ups with your healthcare provider.'
    },
    {
      id: 'elevated',
      label: 'Elevated',
      cssClass: 'yellow',
      boxClass: 'result-warning',
      icon: '⚠️',
      systMax: 130, diastMax: 80,
      description: 'Your blood pressure is in the elevated range (systolic 120–129 and diastolic less than 80 mmHg). Elevated blood pressure is not yet hypertension but is likely to develop into it without lifestyle changes. The AHA recommends addressing elevated BP with lifestyle modifications: reduce sodium intake, increase physical activity, lose weight if overweight, and reduce alcohol consumption. No medication is typically required at this stage.'
    },
    {
      id: 'stage1',
      label: 'High Blood Pressure — Stage 1',
      cssClass: 'orange',
      boxClass: 'result-warning',
      icon: '🟠',
      systMax: 140, diastMax: 90,
      description: 'Your blood pressure is in the Stage 1 hypertension range (130–139/80–89 mmHg). At this stage, your doctor will likely recommend lifestyle changes and may consider medication depending on your cardiovascular disease risk. Lifestyle changes such as the DASH diet, reducing sodium, exercising regularly (at least 150 minutes per week), limiting alcohol, and quitting smoking are critical first steps. Schedule an appointment with your healthcare provider.'
    },
    {
      id: 'stage2',
      label: 'High Blood Pressure — Stage 2',
      cssClass: 'red',
      boxClass: 'result-danger',
      icon: '🔴',
      systMax: 180, diastMax: 120,
      description: 'Your blood pressure is in the Stage 2 hypertension range (≥140/≥90 mmHg). Stage 2 hypertension significantly increases your risk of heart attack, stroke, heart failure, and kidney disease. Your doctor will likely prescribe one or more blood pressure medications in addition to lifestyle changes. Do not delay — make an appointment with your healthcare provider as soon as possible to discuss a treatment plan tailored to your needs.'
    },
    {
      id: 'crisis',
      label: '⚠️ Hypertensive Crisis — Seek Emergency Care',
      cssClass: 'red',
      boxClass: 'result-danger',
      icon: '🚨',
      systMax: Infinity, diastMax: Infinity,
      description: 'HYPERTENSIVE CRISIS: A blood pressure reading of 180/120 mmHg or higher is a hypertensive crisis and requires immediate medical attention. If you are experiencing symptoms such as severe headache, chest pain, shortness of breath, back pain, numbness, weakness, or vision changes, call emergency services (911 in the US) immediately. Even without symptoms, blood pressure this high needs same-day evaluation. Do not wait — go to the nearest emergency room or call your doctor immediately.'
    }
  ];

  function getCategoryForReading(sys, dia) {
    if (sys >= 180 || dia >= 120) return CATEGORIES[4];
    if (sys >= 140 || dia >= 90)  return CATEGORIES[3];
    if (sys >= 130 || dia >= 80)  return CATEGORIES[2];
    if (sys >= 120 && dia < 80)   return CATEGORIES[1];
    return CATEGORIES[0];
  }

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
  function clearError()   { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  function hideResult()   { resultBox.classList.remove('show'); }

  function calculate() {
    clearError();
    const sys  = parseInt(systolicInput.value);
    const dia  = parseInt(diastolicInput.value);
    const pulse= parseInt(pulseInput.value) || 0;

    if (!systolicInput.value || isNaN(sys) || sys < 60 || sys > 300) {
      showError('Please enter a valid systolic pressure (60–300 mmHg).'); systolicInput.focus(); return;
    }
    if (!diastolicInput.value || isNaN(dia) || dia < 30 || dia > 200) {
      showError('Please enter a valid diastolic pressure (30–200 mmHg).'); diastolicInput.focus(); return;
    }
    if (dia >= sys) {
      showError('Diastolic pressure must be lower than systolic pressure.'); diastolicInput.focus(); return;
    }

    const cat = getCategoryForReading(sys, dia);
    const pp  = sys - dia;

    resultIcon.textContent   = cat.icon;
    categoryEl.textContent   = cat.label;
    categoryEl.className     = 'result-category ' + cat.cssClass;
    systolicDisp.textContent = sys + ' mmHg';
    diastolicDisp.textContent= dia + ' mmHg';
    if (pulsePressDisp) pulsePressDisp.textContent = pp + ' mmHg';
    descEl.textContent       = cat.description;
    resultBox.className      = 'calc-result-box show ' + cat.boxClass;

    if (rangesEl) {
      const rows = [
        ['Normal',         '< 120',     '< 80',    'green'],
        ['Elevated',       '120–129',   '< 80',    'yellow'],
        ['Stage 1 Hypert.','130–139',   '80–89',   'orange'],
        ['Stage 2 Hypert.','≥ 140',     '≥ 90',    'red'],
        ['Crisis',         '≥ 180',     '≥ 120',   'red']
      ];
      rangesEl.innerHTML = rows.map(r => `
        <div class="bp-range-row ${r[3]}">
          <span>${r[0]}</span><span>Systolic: ${r[1]}</span><span>Diastolic: ${r[2]}</span>
        </div>`).join('');
    }

    resultBox.dataset.shareText = `My blood pressure is ${sys}/${dia} mmHg (${cat.label.replace('⚠️ ','').split(' —')[0]}). Check yours free: https://medicaltoolkit.pages.dev/pages/blood-pressure-checker.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    systolicInput.value  = '';
    diastolicInput.value = '';
    if (pulseInput) pulseInput.value = '';
    clearError();
    hideResult();
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  shareWhatsapp && shareWhatsapp.addEventListener('click', () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(resultBox.dataset.shareText || ''), '_blank', 'noopener');
  });
  shareTwitter && shareTwitter.addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(resultBox.dataset.shareText || '')}&url=${encodeURIComponent('https://medicaltoolkit.pages.dev/pages/blood-pressure-checker.html')}`, '_blank', 'noopener');
  });
  copyResultBtn && copyResultBtn.addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(resultBox.dataset.shareText || '').then(() => showToast('Result copied! ✅')).catch(() => showToast('Could not copy.'));
  });

  calcBtn  && calcBtn.addEventListener('click', calculate);
  resetBtn && resetBtn.addEventListener('click', reset);
  [systolicInput, diastolicInput].forEach(el => {
    el && el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  });
})();
