/**
 * MedicalToolKit — Ovulation Calculator
 * LMP + cycle length → fertile window, ovulation day, next period
 */

(function () {
  'use strict';

  const lmpInput      = document.getElementById('ovLmpDate');
  const cycleInput    = document.getElementById('ovCycleLength');
  const lutealInput   = document.getElementById('ovLutealPhase');
  const errorEl       = document.getElementById('ovError');
  const calcBtn       = document.getElementById('calcOvulation');
  const resetBtn      = document.getElementById('resetOvulation');

  const resultBox     = document.getElementById('ovResult');
  const ovDayEl       = document.getElementById('ovDay');
  const fertileStartEl= document.getElementById('ovFertileStart');
  const fertileEndEl  = document.getElementById('ovFertileEnd');
  const nextPeriodEl  = document.getElementById('ovNextPeriod');
  const bestDaysEl    = document.getElementById('ovBestDays');
  const calendarEl    = document.getElementById('ovCalendar');

  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareTwitter  = document.getElementById('shareTwitter');
  const copyResultBtn = document.getElementById('copyResult');
  const toastEl       = document.getElementById('toast');

  function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
  function clearError()   { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  function hideResult()   { resultBox.classList.remove('show'); }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatShort(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function calculate() {
    clearError();

    if (!lmpInput.value) { showError('Please select the first day of your last period.'); return; }

    const lmp         = new Date(lmpInput.value);
    const cycleLen    = parseInt(cycleInput.value) || 28;
    const lutealPhase = parseInt(lutealInput.value) || 14;

    if (isNaN(lmp.getTime())) { showError('Please enter a valid date.'); return; }
    if (cycleLen < 21 || cycleLen > 45) { showError('Cycle length should be between 21 and 45 days.'); return; }
    if (lutealPhase < 10 || lutealPhase > 16) { showError('Luteal phase should be between 10 and 16 days.'); return; }

    // Ovulation = cycle length - luteal phase days from LMP
    const ovulationDay = addDays(lmp, cycleLen - lutealPhase);

    // Fertile window = 5 days before ovulation + ovulation day
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd   = addDays(ovulationDay, 1); // day after ovulation

    // Peak fertility (2 days before + ovulation day)
    const peakStart    = addDays(ovulationDay, -2);
    const nextPeriod   = addDays(lmp, cycleLen);

    ovDayEl.textContent       = formatDate(ovulationDay);
    fertileStartEl.textContent= formatDate(fertileStart);
    fertileEndEl.textContent  = formatDate(fertileEnd);
    nextPeriodEl.textContent  = formatDate(nextPeriod);

    if (bestDaysEl) {
      bestDaysEl.textContent = `${formatShort(peakStart)}, ${formatShort(addDays(peakStart, 1))}, and ${formatShort(ovulationDay)}`;
    }

    // Build mini calendar strip
    if (calendarEl) {
      const days = [];
      for (let i = -6; i <= 7; i++) {
        const d      = addDays(ovulationDay, i);
        const isOv   = i === 0;
        const isFert = i >= -5 && i <= 1;
        const isPeak = i >= -2 && i <= 0;
        const label  = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let cls = 'ov-cal-day';
        if (isOv)   cls += ' ov-cal-ovulation';
        else if (isPeak) cls += ' ov-cal-peak';
        else if (isFert) cls += ' ov-cal-fertile';
        const tooltip = isOv ? 'Ovulation Day' : isPeak ? 'Peak Fertile' : isFert ? 'Fertile Window' : '';
        days.push(`<div class="${cls}" title="${tooltip}"><span>${label}</span>${tooltip ? `<small>${tooltip}</small>` : ''}</div>`);
      }
      calendarEl.innerHTML = days.join('');
    }

    resultBox.className = 'calc-result-box show result-normal';
    resultBox.dataset.shareText = `My ovulation day is ${formatDate(ovulationDay)}. Calculate your fertile window free: https://medicaltoolkit.pages.dev/pages/ovulation-calculator.html`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    if (lmpInput)    lmpInput.value    = '';
    if (cycleInput)  cycleInput.value  = '28';
    if (lutealInput) lutealInput.value = '14';
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
