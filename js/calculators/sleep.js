/**
 * MedicalToolKit — Sleep Calculator
 * Calculates optimal bedtimes or wake times based on 90-minute sleep cycles.
 */

(function () {
  'use strict';

  /* ── Constants ── */
  const FALL_ASLEEP_MINUTES = 14;   // average sleep onset latency
  const CYCLE_MINUTES       = 90;   // duration of one sleep cycle
  const CYCLES_TO_SHOW      = [2, 3, 4, 5, 6]; // cycles to calculate

  /* ── Quality config ── */
  const QUALITY = {
    6: { label: 'Best',  cssClass: 'quality-best',  hours: 9 },
    5: { label: 'Best',  cssClass: 'quality-best',  hours: 7.5 },
    4: { label: 'Good',  cssClass: 'quality-good',  hours: 6 },
    3: { label: 'Good',  cssClass: 'quality-good',  hours: 4.5 },
    2: { label: 'OK',    cssClass: 'quality-ok',    hours: 3 }
  };

  /* ── DOM references ── */
  const modeWakeUpBtn  = document.getElementById('modeWakeUp');
  const modeBedTimeBtn = document.getElementById('modeBedTime');
  const wakeUpPanel    = document.getElementById('wakeUpPanel');
  const bedTimePanel   = document.getElementById('bedTimePanel');
  const wakeTimeInput  = document.getElementById('wakeTime');
  const sleepTimeInput = document.getElementById('sleepTime');
  const calcBtn        = document.getElementById('calcSleep');
  const sleepNowBtn    = document.getElementById('sleepNow');
  const resetBtn       = document.getElementById('resetSleep');
  const errorEl        = document.getElementById('sleepError');

  const resultBox          = document.getElementById('sleepResult');
  const sleepResultTitle   = document.getElementById('sleepResultTitle');
  const sleepResultSub     = document.getElementById('sleepResultSubtitle');
  const sleepTimesListEl   = document.getElementById('sleepTimesList');
  const sleepDescriptionEl = document.getElementById('sleepDescription');

  const shareWhatsapp  = document.getElementById('shareWhatsapp');
  const copyResultBtn  = document.getElementById('copyResult');
  const toastEl        = document.getElementById('toast');

  /* ── State ── */
  let activeMode = 'wakeup'; // 'wakeup' | 'bedtime'

  /* ── Helpers ── */
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  /**
   * Format a total-minutes value (0–1439) as a 12-hour AM/PM string.
   * Normalises negative and > 1439 values by wrapping around 24h.
   */
  function formatTime(totalMinutes) {
    // Normalise to 0–1439
    let mins = ((totalMinutes % 1440) + 1440) % 1440;
    const h24 = Math.floor(mins / 60);
    const m   = mins % 60;
    const period = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mm = m.toString().padStart(2, '0');
    return `${h12}:${mm} ${period}`;
  }

  /** Convert "HH:MM" string to total minutes since midnight. */
  function timeStringToMinutes(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  /** Get current time as total minutes since midnight. */
  function nowInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  /* ── Mode toggle ── */
  function setMode(mode) {
    activeMode = mode;
    if (mode === 'wakeup') {
      modeWakeUpBtn.classList.add('active');
      modeWakeUpBtn.setAttribute('aria-pressed', 'true');
      modeBedTimeBtn.classList.remove('active');
      modeBedTimeBtn.setAttribute('aria-pressed', 'false');
      wakeUpPanel.style.display = 'block';
      bedTimePanel.style.display = 'none';
    } else {
      modeBedTimeBtn.classList.add('active');
      modeBedTimeBtn.setAttribute('aria-pressed', 'true');
      modeWakeUpBtn.classList.remove('active');
      modeWakeUpBtn.setAttribute('aria-pressed', 'false');
      bedTimePanel.style.display = 'block';
      wakeUpPanel.style.display = 'none';
    }
    resultBox.classList.remove('show');
    clearError();
  }

  modeWakeUpBtn.addEventListener('click', () => setMode('wakeup'));
  modeBedTimeBtn.addEventListener('click', () => setMode('bedtime'));

  /* ── Main calculation ── */
  function calculate(overrideMinutes) {
    clearError();

    let anchorMinutes;

    if (typeof overrideMinutes === 'number') {
      anchorMinutes = overrideMinutes;
    } else if (activeMode === 'wakeup') {
      if (!wakeTimeInput.value) {
        showError('Please enter your desired wake-up time.');
        wakeTimeInput.focus();
        return;
      }
      anchorMinutes = timeStringToMinutes(wakeTimeInput.value);
    } else {
      if (!sleepTimeInput.value) {
        showError('Please enter your desired sleep time.');
        sleepTimeInput.focus();
        return;
      }
      anchorMinutes = timeStringToMinutes(sleepTimeInput.value);
    }

    const isSleepNow  = typeof overrideMinutes === 'number';
    const mode = isSleepNow ? 'bedtime' : activeMode;

    // Build result times
    const times = CYCLES_TO_SHOW.map(cycles => {
      const totalSleepMins = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
      let targetMinutes;

      if (mode === 'wakeup') {
        // Subtract total sleep from wake time to get bedtime
        targetMinutes = anchorMinutes - totalSleepMins;
      } else {
        // Add total sleep to sleep onset time to get wake time
        targetMinutes = anchorMinutes + totalSleepMins;
      }

      return {
        cycles,
        minutes: targetMinutes,
        quality: QUALITY[cycles]
      };
    });

    displayResult(times, mode, anchorMinutes, isSleepNow);
  }

  /* ── Sleep Now button ── */
  sleepNowBtn.addEventListener('click', function () {
    const nowMins = nowInMinutes() + FALL_ASLEEP_MINUTES;
    // Switch to display as bedtime mode from now
    calculate(nowMins);
  });

  /* ── Display ── */
  function displayResult(times, mode, anchorMinutes, isSleepNow) {
    const anchorStr = formatTime(anchorMinutes);

    if (mode === 'wakeup') {
      sleepResultTitle.textContent = `Bedtimes to wake up at ${anchorStr}`;
      sleepResultSub.textContent   = 'Go to bed at one of these times tonight';
    } else if (isSleepNow) {
      sleepResultTitle.textContent = 'If you fall asleep right now...';
      sleepResultSub.textContent   = 'You should wake up at one of these times';
    } else {
      sleepResultTitle.textContent = `Wake times if you sleep at ${anchorStr}`;
      sleepResultSub.textContent   = 'Set your alarm for one of these times';
    }

    // Clear previous list
    sleepTimesListEl.innerHTML = '';

    // Build time items (reversed for wake mode so best is at top with most cycles first)
    const displayTimes = mode === 'wakeup' ? [...times].reverse() : [...times].reverse();

    let shareLines = [];

    displayTimes.forEach(item => {
      const timeStr  = formatTime(item.minutes);
      const hoursStr = `${item.cycles * 1.5} hours sleep`;
      const q        = item.quality;

      const div = document.createElement('div');
      div.className = 'sleep-time-item';
      div.innerHTML = `
        <div>
          <div class="sleep-time-val">${timeStr}</div>
          <div class="sleep-time-cycles">${item.cycles} cycle${item.cycles !== 1 ? 's' : ''} &bull; ${hoursStr}</div>
        </div>
        <span class="sleep-time-quality ${q.cssClass}">${q.label}</span>
      `;
      sleepTimesListEl.appendChild(div);

      shareLines.push(`${timeStr} (${item.cycles} cycles, ${q.label})`);
    });

    // Description
    const desc = mode === 'wakeup'
      ? `To wake up at ${anchorStr} feeling refreshed, aim to fall asleep at one of the times marked "Best" above. These align with the end of a complete 90-minute sleep cycle, so your alarm will catch you in light sleep rather than deep sleep. The calculator already accounts for the 14 minutes it typically takes to fall asleep.`
      : isSleepNow
        ? `If you fall asleep right now, these are the best times to set your alarm. Waking at one of the "Best" times means you will complete 5 or 6 full sleep cycles (7.5–9 hours), which is ideal for most adults. Avoid the times marked "OK" unless you are planning a short nap.`
        : `Going to sleep at ${anchorStr}, these are your optimal wake times. Set your alarm for one of the "Best" times to complete 5 or 6 full sleep cycles. Remember: the calculator accounts for 14 minutes to fall asleep, so the actual sleep duration is slightly less than the cycle total.`;

    sleepDescriptionEl.textContent = desc;

    const shareText = (mode === 'wakeup' ? `To wake at ${anchorStr}, I should sleep at: ` : `Waking after sleeping at ${anchorStr}: `)
      + shareLines.join(' | ')
      + ' — via MedicalToolKit https://medicaltoolkit.pages.dev/pages/sleep-calculator.html';
    resultBox.dataset.shareText = shareText;

    // Show result
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Reset ── */
  function resetCalculator() {
    wakeTimeInput.value  = '07:00';
    sleepTimeInput.value = '22:30';
    clearError();
    resultBox.classList.remove('show');
    setMode('wakeup');
  }

  /* ── Share ── */
  shareWhatsapp && shareWhatsapp.addEventListener('click', function () {
    const text = encodeURIComponent(resultBox.dataset.shareText || 'Check out this sleep calculator: https://medicaltoolkit.pages.dev/pages/sleep-calculator.html');
    window.open('https://wa.me/?text=' + text, '_blank', 'noopener');
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

  wakeTimeInput && wakeTimeInput.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  sleepTimeInput && sleepTimeInput.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });

})();
