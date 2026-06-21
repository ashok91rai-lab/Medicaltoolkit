/**
 * MedicalToolKit — Pregnancy Week Calculator
 * LMP or conception date → current week, trimester, due date, baby size
 */

(function () {
  'use strict';

  const methodLmpBtn   = document.getElementById('methodLmp');
  const methodConBtn   = document.getElementById('methodConception');
  const lmpGroup       = document.getElementById('lmpGroup');
  const conceptionGroup= document.getElementById('conceptionGroup');
  const lmpInput       = document.getElementById('lmpDate');
  const conceptionInput= document.getElementById('conceptionDate');
  const errorEl        = document.getElementById('pwError');
  const calcBtn        = document.getElementById('calcPregWeek');
  const resetBtn       = document.getElementById('resetPregWeek');

  const resultBox      = document.getElementById('pwResult');
  const weekEl         = document.getElementById('pwWeek');
  const dayEl          = document.getElementById('pwDay');
  const trimesterEl    = document.getElementById('pwTrimester');
  const dueDateEl      = document.getElementById('pwDueDate');
  const countdownEl    = document.getElementById('pwCountdown');
  const babySizeEl     = document.getElementById('pwBabySize');
  const milestoneEl    = document.getElementById('pwMilestone');

  const shareWhatsapp  = document.getElementById('shareWhatsapp');
  const shareTwitter   = document.getElementById('shareTwitter');
  const copyResultBtn  = document.getElementById('copyResult');
  const toastEl        = document.getElementById('toast');

  let method = 'lmp';

  /* Baby size comparisons by week */
  const BABY_SIZES = {
    4:'poppy seed', 5:'sesame seed', 6:'sweet pea', 7:'blueberry', 8:'raspberry',
    9:'cherry', 10:'strawberry', 11:'fig', 12:'lime', 13:'lemon', 14:'peach',
    15:'apple', 16:'avocado', 17:'pear', 18:'bell pepper', 19:'mango', 20:'banana',
    21:'carrot', 22:'coconut', 23:'grapefruit', 24:'corn', 25:'cauliflower',
    26:'lettuce', 27:'rutabaga', 28:'eggplant', 29:'acorn squash', 30:'cucumber',
    31:'pineapple', 32:'jicama', 33:'durian', 34:'cantaloupe', 35:'honeydew melon',
    36:'crenshaw melon', 37:'winter melon', 38:'leek', 39:'mini watermelon', 40:'pumpkin'
  };

  const MILESTONES = {
    4: 'Embryo implants in the uterus. Missed period typically occurs.',
    5: 'Heart begins to beat. Neural tube forming.',
    6: 'Brain and spinal cord developing. Tiny arm and leg buds appear.',
    7: 'Face features forming. Eyelid folds developing.',
    8: 'All major organs are forming. Baby is now officially a fetus.',
    9: 'Fingers and toes distinguishable. Heartbeat audible by Doppler.',
    10: 'Vital organs complete. Fingernails forming.',
    11: 'Baby can open and close fists. Tooth buds forming.',
    12: 'End of first trimester. Reflexes developing.',
    13: 'Fingerprints forming. Baby can suck thumb.',
    14: 'Kidneys producing urine. Baby making facial expressions.',
    16: 'Possible to feel first movements (quickening). Eyes moving behind lids.',
    18: 'Baby can hear sounds. Sex visible on ultrasound.',
    20: 'Halfway point! Baby is around 10 inches long.',
    24: 'Baby viable outside womb with intensive care.',
    28: 'Third trimester begins. Brain growing rapidly.',
    32: 'Baby practicing breathing movements.',
    36: 'Lungs nearly mature. Baby settling head-down.',
    37: 'Baby considered early term.',
    38: 'Baby considered full term.',
    40: 'Due date! Average first-time birth is at 40–41 weeks.'
  };

  function getMilestone(week) {
    const keys = Object.keys(MILESTONES).map(Number).sort((a,b)=>a-b);
    for (let i = keys.length - 1; i >= 0; i--) {
      if (week >= keys[i]) return MILESTONES[keys[i]];
    }
    return 'Baby is developing rapidly.';
  }

  methodLmpBtn && methodLmpBtn.addEventListener('click', () => {
    method = 'lmp';
    methodLmpBtn.classList.add('active'); methodLmpBtn.setAttribute('aria-pressed', 'true');
    methodConBtn.classList.remove('active'); methodConBtn.setAttribute('aria-pressed', 'false');
    lmpGroup.style.display       = 'block';
    conceptionGroup.style.display = 'none';
    hideResult(); clearError();
  });
  methodConBtn && methodConBtn.addEventListener('click', () => {
    method = 'conception';
    methodConBtn.classList.add('active'); methodConBtn.setAttribute('aria-pressed', 'true');
    methodLmpBtn.classList.remove('active'); methodLmpBtn.setAttribute('aria-pressed', 'false');
    conceptionGroup.style.display = 'block';
    lmpGroup.style.display        = 'none';
    hideResult(); clearError();
  });

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
  function clearError()   { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  function hideResult()   { resultBox.classList.remove('show'); }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function calculate() {
    clearError();
    let lmpDate;

    if (method === 'lmp') {
      if (!lmpInput.value) { showError('Please select your last menstrual period date.'); return; }
      lmpDate = new Date(lmpInput.value);
    } else {
      if (!conceptionInput.value) { showError('Please select your conception date.'); return; }
      lmpDate = new Date(conceptionInput.value);
      lmpDate.setDate(lmpDate.getDate() - 14); // LMP is ~14 days before conception
    }

    if (isNaN(lmpDate.getTime())) { showError('Please enter a valid date.'); return; }

    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    lmpDate.setHours(0, 0, 0, 0);

    const diffMs   = today - lmpDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) { showError('Date cannot be in the future.'); return; }
    if (diffDays > 287) { showError('Pregnancy cannot exceed 41 weeks. Please check the date.'); return; }

    const totalWeeks = Math.floor(diffDays / 7);
    const extraDays  = diffDays % 7;

    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);

    const daysLeft = Math.max(0, Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)));

    let trimester;
    if (totalWeeks <= 12) trimester = '1st Trimester (Weeks 1–12)';
    else if (totalWeeks <= 26) trimester = '2nd Trimester (Weeks 13–26)';
    else trimester = '3rd Trimester (Weeks 27–40)';

    const babySize  = BABY_SIZES[totalWeeks] || BABY_SIZES[Math.min(totalWeeks, 40)] || 'developing rapidly';
    const milestone = getMilestone(totalWeeks);

    weekEl.textContent       = `Week ${totalWeeks}`;
    dayEl.textContent        = `Day ${extraDays} of the week`;
    trimesterEl.textContent  = trimester;
    dueDateEl.textContent    = formatDate(dueDate);
    countdownEl.textContent  = daysLeft > 0 ? `${daysLeft} days until due date` : 'Due date reached!';
    babySizeEl.textContent   = `🍎 About the size of a ${babySize}`;
    milestoneEl.textContent  = milestone;

    resultBox.className = 'calc-result-box show result-normal';
    resultBox.dataset.shareText = `I'm ${totalWeeks} weeks pregnant! My due date is ${formatDate(dueDate)}. Calculate yours: https://medicaltoolkit.pages.dev/pages/pregnancy-week-calculator.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    if (lmpInput)       lmpInput.value = '';
    if (conceptionInput) conceptionInput.value = '';
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
})();
