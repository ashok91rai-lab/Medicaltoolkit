/**
 * MedicalToolKit — Due Date Calculator
 * Supports LMP (Naegele's Rule with cycle length adjustment) and Conception Date methods.
 */

(function () {
  'use strict';

  /* ── DOM references ── */
  const tabLmp          = document.getElementById('tabLmp');
  const tabConception   = document.getElementById('tabConception');
  const panelLmp        = document.getElementById('panelLmp');
  const panelConception = document.getElementById('panelConception');

  const lmpDateInput    = document.getElementById('lmpDate');
  const cycleLengthSel  = document.getElementById('cycleLength');
  const conceptionInput = document.getElementById('conceptionDate');

  const calcBtn         = document.getElementById('calcDueDate');
  const resetBtn        = document.getElementById('resetDueDate');
  const errorEl         = document.getElementById('dueDateError');

  const resultBox           = document.getElementById('dueDateResult');
  const dueDateValueEl      = document.getElementById('dueDateValue');
  const trimesterBadgeEl    = document.getElementById('trimesterBadge');
  const pregnancyWeekEl     = document.getElementById('pregnancyWeek');
  const daysRemainingEl     = document.getElementById('daysRemaining');
  const trimesterValueEl    = document.getElementById('trimesterValue');
  const babySizeEl          = document.getElementById('babySize');
  const dueDateDescEl       = document.getElementById('dueDateDescription');

  const shareWhatsapp   = document.getElementById('shareWhatsapp');
  const shareTwitter    = document.getElementById('shareTwitter');
  const copyResultBtn   = document.getElementById('copyResult');
  const toastEl         = document.getElementById('toast');

  /* ── State ── */
  let activeTab = 'lmp'; // 'lmp' | 'conception'

  /* ── Baby size comparison map (week → description) ── */
  const BABY_SIZES = {
    4: 'Poppy seed',
    5: 'Apple seed',
    6: 'Sweet pea',
    7: 'Blueberry',
    8: 'Raspberry',
    9: 'Grape',
    10: 'Kumquat',
    11: 'Fig',
    12: 'Lime',
    13: 'Lemon',
    14: 'Peach',
    15: 'Apple',
    16: 'Avocado',
    17: 'Pear',
    18: 'Bell pepper',
    19: 'Mango',
    20: 'Banana',
    21: 'Carrot',
    22: 'Papaya',
    23: 'Large mango',
    24: 'Corn cob',
    25: 'Cauliflower',
    26: 'Scallion',
    27: 'Head of cabbage',
    28: 'Eggplant',
    29: 'Butternut squash',
    30: 'Cabbage',
    31: 'Coconut',
    32: 'Jicama',
    33: 'Pineapple',
    34: 'Cantaloupe',
    35: 'Honeydew melon',
    36: 'Head of romaine',
    37: 'Swiss chard',
    38: 'Leek',
    39: 'Mini watermelon',
    40: 'Small pumpkin'
  };

  /* ── Week milestones ── */
  const WEEK_MILESTONES = {
    4:  'Implantation complete; tiny heart begins forming.',
    5:  'Neural tube (brain and spine) starts developing.',
    6:  'Heartbeat may be visible on ultrasound.',
    7:  'Hands and feet are forming; facial features developing.',
    8:  'All major organs have begun to form.',
    9:  'Fetus can move, though you cannot feel it yet.',
    10: 'Vital organs functional; entering the fetal period.',
    11: 'Nuchal translucency scan window opens this week.',
    12: 'Risk of miscarriage drops significantly.',
    13: 'End of first trimester; fetus is fully formed.',
    14: 'Second trimester begins; energy levels often improve.',
    16: 'Some mothers begin to feel gentle flutters (quickening).',
    18: 'Anomaly ultrasound scan typically scheduled around now.',
    20: 'Halfway point! Baby is about 25 cm from crown to heel.',
    24: 'Baby reaches viability (can survive with intensive care).',
    28: 'Third trimester begins; baby sleeps and wakes in cycles.',
    32: 'Baby is practising breathing movements.',
    36: 'Baby is considered "early term"; head may engage.',
    37: 'Pregnancy is now considered full-term.',
    38: 'Group B strep test typically done by now.',
    40: 'Estimated due date — meet your baby soon!'
  };

  /* ── Month names ── */
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  /* ── Helpers ── */
  function formatDate(d) {
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function diffDays(a, b) {
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  /* ── Tab switching ── */
  function setTab(tab) {
    activeTab = tab;
    if (tab === 'lmp') {
      tabLmp.classList.add('active');
      tabLmp.setAttribute('aria-selected', 'true');
      tabConception.classList.remove('active');
      tabConception.setAttribute('aria-selected', 'false');
      panelLmp.style.display = 'block';
      panelConception.style.display = 'none';
    } else {
      tabConception.classList.add('active');
      tabConception.setAttribute('aria-selected', 'true');
      tabLmp.classList.remove('active');
      tabLmp.setAttribute('aria-selected', 'false');
      panelConception.style.display = 'block';
      panelLmp.style.display = 'none';
    }
    resultBox.classList.remove('show');
    clearError();
  }

  tabLmp.addEventListener('click', () => setTab('lmp'));
  tabConception.addEventListener('click', () => setTab('conception'));

  /* ── Main calculation ── */
  function calculate() {
    clearError();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dueDate, lmpDate;

    if (activeTab === 'lmp') {
      if (!lmpDateInput.value) {
        showError('Please enter the first day of your last menstrual period.');
        lmpDateInput.focus();
        return;
      }

      lmpDate = new Date(lmpDateInput.value + 'T00:00:00');

      if (isNaN(lmpDate.getTime())) {
        showError('Invalid date. Please enter a valid LMP date.');
        return;
      }

      if (lmpDate > today) {
        showError('The LMP date cannot be in the future. Please enter a past date.');
        return;
      }

      // Max 42 weeks ago
      const maxPast = addDays(today, -294); // 42 weeks
      if (lmpDate < maxPast) {
        showError('The LMP date appears too far in the past (more than 42 weeks). Please check your entry.');
        return;
      }

      const cycleLen = parseInt(cycleLengthSel.value, 10) || 28;
      const adjustment = cycleLen - 28;
      dueDate = addDays(lmpDate, 280 + adjustment);

    } else {
      if (!conceptionInput.value) {
        showError('Please enter your conception date.');
        conceptionInput.focus();
        return;
      }

      const conceptionDate = new Date(conceptionInput.value + 'T00:00:00');

      if (isNaN(conceptionDate.getTime())) {
        showError('Invalid date. Please enter a valid conception date.');
        return;
      }

      if (conceptionDate > today) {
        showError('The conception date cannot be in the future.');
        return;
      }

      const maxPast = addDays(today, -280); // ~40 weeks
      if (conceptionDate < maxPast) {
        showError('The conception date appears too far in the past. Please check your entry.');
        return;
      }

      dueDate = addDays(conceptionDate, 266);
      // Estimate LMP from conception date
      lmpDate = addDays(conceptionDate, -14);
    }

    displayResult(dueDate, lmpDate, today);
  }

  /* ── Display ── */
  function displayResult(dueDate, lmpDate, today) {
    // Days since LMP
    const daysSinceLmp = diffDays(lmpDate, today);
    const totalWeeks   = Math.floor(daysSinceLmp / 7);
    const extraDays    = daysSinceLmp % 7;

    // Days remaining
    const daysLeft = diffDays(today, dueDate);

    // Trimester
    let trimester, trimesterLabel;
    if (totalWeeks <= 13) {
      trimester = 1;
      trimesterLabel = '1st Trimester';
    } else if (totalWeeks <= 27) {
      trimester = 2;
      trimesterLabel = '2nd Trimester';
    } else {
      trimester = 3;
      trimesterLabel = '3rd Trimester';
    }

    // Baby size — clamp to 4–40
    const sizeWeek = Math.min(40, Math.max(4, totalWeeks));
    const babySize = BABY_SIZES[sizeWeek] || 'Baby is growing!';

    // Milestone
    const closestMilestoneWeek = Object.keys(WEEK_MILESTONES)
      .map(Number)
      .filter(w => w <= totalWeeks)
      .sort((a, b) => b - a)[0];
    const milestone = closestMilestoneWeek ? WEEK_MILESTONES[closestMilestoneWeek] : 'Your pregnancy journey has begun!';

    // Due date display
    dueDateValueEl.textContent = formatDate(dueDate);

    // Trimester badge
    trimesterBadgeEl.textContent = trimesterLabel;

    // Mini cards
    pregnancyWeekEl.textContent = totalWeeks > 0 ? `${totalWeeks} wk ${extraDays} day${extraDays !== 1 ? 's' : ''}` : 'Less than 1 week';
    daysRemainingEl.textContent = daysLeft > 0 ? `${daysLeft} days` : daysLeft === 0 ? 'Today!' : 'Overdue';
    trimesterValueEl.textContent = `Trimester ${trimester}`;
    babySizeEl.textContent = babySize;

    // Description
    let desc = '';
    if (daysLeft < 0) {
      desc = `Your estimated due date was ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago. Post-term pregnancies (beyond 42 weeks) require close medical monitoring. Please contact your healthcare provider immediately if you have not already done so.`;
    } else if (daysLeft === 0) {
      desc = 'Today is your estimated due date! Remember that only about 5% of babies arrive on their due date. Your baby could arrive any day now — make sure your hospital bag is packed and your birth team is on call!';
    } else if (totalWeeks < 4) {
      desc = `You are in the very early stages of pregnancy (${totalWeeks} week${totalWeeks !== 1 ? 's' : ''} along). The embryo is forming essential structures including the neural tube, heart, and digestive system. ${milestone}`;
    } else {
      desc = `You are ${totalWeeks} weeks and ${extraDays} day${extraDays !== 1 ? 's' : ''} pregnant, in your ${trimesterLabel}. Your baby is approximately the size of a ${babySize}. ${milestone} Your due date is ${formatDate(dueDate)}, which is ${daysLeft} days away.`;
    }
    dueDateDescEl.textContent = desc;

    // Cache for sharing
    const shareText = `I'm ${totalWeeks} weeks pregnant! My baby's due date is ${formatDate(dueDate)}. Calculate yours at https://medicaltoolkit.pages.dev/pages/due-date-calculator.html`;
    resultBox.dataset.shareText = shareText;

    // Show result
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Reset ── */
  function resetCalculator() {
    lmpDateInput.value    = '';
    conceptionInput.value = '';
    cycleLengthSel.value  = '28';
    clearError();
    resultBox.classList.remove('show');
    setTab('lmp');
  }

  /* ── Share ── */
  shareWhatsapp && shareWhatsapp.addEventListener('click', function () {
    const text = encodeURIComponent(resultBox.dataset.shareText || 'Check out this due date calculator: https://medicaltoolkit.pages.dev/pages/due-date-calculator.html');
    window.open('https://wa.me/?text=' + text, '_blank', 'noopener');
  });

  shareTwitter && shareTwitter.addEventListener('click', function () {
    const text = encodeURIComponent(resultBox.dataset.shareText || 'Check out this due date calculator!');
    const url  = encodeURIComponent('https://medicaltoolkit.pages.dev/pages/due-date-calculator.html');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
  });

  copyResultBtn && copyResultBtn.addEventListener('click', function () {
    const text = resultBox.dataset.shareText || '';
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text).then(() => showToast('Result copied to clipboard!')).catch(() => showToast('Could not copy.'));
    }
  });

  /* ── Event listeners ── */
  calcBtn.addEventListener('click', calculate);
  resetBtn.addEventListener('click', resetCalculator);

  lmpDateInput && lmpDateInput.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  conceptionInput && conceptionInput.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });

  /* ── Set max date for inputs to today ── */
  (function setMaxDate() {
    const todayStr = new Date().toISOString().split('T')[0];
    lmpDateInput && (lmpDateInput.max = todayStr);
    conceptionInput && (conceptionInput.max = todayStr);
  })();

})();
