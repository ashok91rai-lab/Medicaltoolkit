(function() {
  'use strict';
  const unitMgdl = document.getElementById('unitMgdl');
  const unitMmol = document.getElementById('unitMmol');
  const a1cInput = document.getElementById('a1cValue');
  const glucoseInput = document.getElementById('glucoseValue');
  const glucoseUnit = document.getElementById('glucoseUnit');
  const convertBtn = document.getElementById('convertA1c');
  const resetBtn = document.getElementById('resetA1c');
  const resultBox = document.getElementById('resultBox');

  let currentUnit = 'mgdl';

  unitMgdl.addEventListener('click', () => {
    unitMgdl.classList.add('active');
    unitMmol.classList.remove('active');
    glucoseUnit.textContent = '(mg/dL)';
    currentUnit = 'mgdl';
  });

  unitMmol.addEventListener('click', () => {
    unitMmol.classList.add('active');
    unitMgdl.classList.remove('active');
    glucoseUnit.textContent = '(mmol/L)';
    currentUnit = 'mmol';
  });

  convertBtn.addEventListener('click', () => {
    const a1c = parseFloat(a1cInput.value);
    const glucose = parseFloat(glucoseInput.value);

    if (isNaN(a1c) && isNaN(glucose)) {
      alert('Please enter either A1C or glucose value');
      return;
    }

    if (!isNaN(a1c)) {
      convertFromA1C(a1c);
    } else if (!isNaN(glucose)) {
      convertFromGlucose(glucose);
    }

    resultBox.classList.add('show');
  });

  function convertFromA1C(a1c) {
    if (a1c < 4 || a1c > 15) {
      alert('Please enter A1C between 4 and 15');
      return;
    }
    const eagMg = (28.7 * a1c) - 46.7;
    const eagMmol = eagMg / 18.01;
    displayResult(a1c, eagMg, eagMmol);
  }

  function convertFromGlucose(glucose) {
    let glucoseMg = glucose;
    if (currentUnit === 'mmol') {
      glucoseMg = glucose * 18.01;
    }
    const a1c = (glucoseMg + 46.7) / 28.7;
    const eagMmol = glucoseMg / 18.01;
    displayResult(a1c, glucoseMg, eagMmol);
  }

  function displayResult(a1c, eagMg, eagMmol) {
    document.getElementById('resultA1c').textContent = a1c.toFixed(2) + '%';
    document.getElementById('resultEagMg').textContent = eagMg.toFixed(0);
    document.getElementById('resultEagMmol').textContent = eagMmol.toFixed(1);

    let category, description, categoryClass;
    if (a1c < 5.7) {
      category = 'Normal';
      categoryClass = 'green';
      description = 'Your A1C indicates normal blood sugar control. Continue healthy lifestyle habits.';
    } else if (a1c < 6.5) {
      category = 'Prediabetes';
      categoryClass = 'yellow';
      description = 'Your A1C indicates prediabetes range. Lifestyle changes can help prevent diabetes.';
    } else {
      category = 'Diabetes';
      categoryClass = 'red';
      description = 'Your A1C indicates diabetes range. Consult your healthcare provider for management.';
    }

    document.getElementById('resultValue').textContent = eagMg.toFixed(0);
    document.getElementById('resultUnit').textContent = currentUnit === 'mgdl' ? 'mg/dL' : 'mmol/L';
    document.getElementById('resultCategory').textContent = category;
    document.getElementById('resultCategory').className = 'result-category ' + categoryClass;
    document.getElementById('resultDescription').textContent = description;
    resultBox.className = 'calc-result-box show result-' + (categoryClass === 'green' ? 'normal' : categoryClass === 'yellow' ? 'warning' : 'danger');
  }

  resetBtn.addEventListener('click', () => {
    a1cInput.value = '';
    glucoseInput.value = '';
    resultBox.classList.remove('show');
  });
})();
