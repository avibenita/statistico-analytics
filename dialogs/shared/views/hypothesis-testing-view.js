/**
 * Hypothesis Testing View - Shared Analysis Component
 * 
 * Can be used by: Univariate, Regression, any module needing hypothesis tests
 * 
 * Requirements:
 * - Global variable: resultsData { rawData, descriptive, column, n }
 * - jStat library must be loaded
 * 
 * Exports:
 * - displayHypothesisTestingView() - Main display function
 * - Classical and Bootstrap hypothesis tests
 */

let currentTestMethod = 'classical';
let currentTestParameter = 'mean';
let currentTestOrientation = 'two-sided';
let currentH0Value = 0;
let bootstrapIterations = 2000;

/**
 * Display hypothesis testing view
 */
function displayHypothesisTestingView() {
  const { column, n } = resultsData;
  
  document.getElementById('variableName').textContent = column || 'Variable';
  document.getElementById('sampleSize').textContent = `(n=${n})`;
  
  document.getElementById('resultsContent').innerHTML = `
    <div class="hypothesis-container">
      <!-- Configuration Panel -->
      <div class="hyp-panel">
        <div class="panel-heading">
          <i class="fa-solid fa-flask"></i>
          Test Configuration
        </div>
        <div class="panel-body">
          <!-- Method Selection -->
          <div class="config-row">
            <label class="config-label">Method:</label>
            <div class="method-buttons">
              <button class="method-btn active" onclick="selectTestMethod('classical')" id="test-classical">
                Classical
              </button>
              <button class="method-btn" onclick="selectTestMethod('bootstrap')" id="test-bootstrap">
                Bootstrap
              </button>
            </div>
          </div>
          
          <!-- Parameter Selection -->
          <div class="config-row">
            <label class="config-label">Parameter:</label>
            <div class="param-buttons">
              <button class="param-btn active" onclick="selectTestParameter('mean')" id="test-param-mean">
                Mean
              </button>
              <button class="param-btn" onclick="selectTestParameter('median')" id="test-param-median">
                Median
              </button>
              <button class="param-btn" onclick="selectTestParameter('variance')" id="test-param-variance">
                Variance
              </button>
            </div>
          </div>
          
          <!-- H0 Value -->
          <div class="config-row">
            <label class="config-label">H₀ Value:</label>
            <input type="number" id="h0Input" value="0" step="any" onchange="updateH0Value(this.value)" 
                   style="padding: 8px 12px; font-size: 14px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface-0); color: var(--text-primary); width: 120px;">
          </div>
          
          <!-- Test Orientation -->
          <div class="config-row">
            <label class="config-label">Alternative (H₁):</label>
            <div class="orientation-buttons">
              <button class="orient-btn" onclick="selectOrientation('left')" id="orient-left">
                <span style="font-size: 16px;">&lt;</span> Less than
              </button>
              <button class="orient-btn active" onclick="selectOrientation('two-sided')" id="orient-two">
                <span style="font-size: 16px;">≠</span> Not equal
              </button>
              <button class="orient-btn" onclick="selectOrientation('right')" id="orient-right">
                <span style="font-size: 16px;">&gt;</span> Greater than
              </button>
            </div>
          </div>
          
          <!-- Run Button -->
          <button class="run-test-btn" onclick="runHypothesisTest()">
            <i class="fa-solid fa-play"></i>
            Run Test
          </button>
        </div>
      </div>
      
      <!-- Results Panel -->
      <div class="hyp-panel results-panel">
        <div class="panel-heading">
          <i class="fa-solid fa-chart-line"></i>
          Test Results
        </div>
        <div class="panel-body">
          <div id="hypothesisResults">
            <div class="loading" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <i class="fa-solid fa-flask" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
              <div>Configure test and click "Run Test"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Select test method
 */
function selectTestMethod(method) {
  currentTestMethod = method;
  document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`test-${method}`).classList.add('active');
}

/**
 * Select test parameter
 */
function selectTestParameter(param) {
  currentTestParameter = param;
  document.querySelectorAll('.param-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`test-param-${param}`).classList.add('active');
}

/**
 * Select orientation
 */
function selectOrientation(orientation) {
  currentTestOrientation = orientation;
  document.querySelectorAll('.orient-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`orient-${orientation}`).classList.add('active');
}

/**
 * Update H0 value
 */
function updateH0Value(value) {
  currentH0Value = parseFloat(value) || 0;
}

/**
 * Run hypothesis test
 */
function runHypothesisTest() {
  if (!resultsData || !resultsData.rawData) return;
  
  const results = currentTestMethod === 'classical' 
    ? runClassicalTest() 
    : runBootstrapTest();
  
  displayTestResults(results);
}

/**
 * Classical hypothesis test
 */
function runClassicalTest() {
  const data = resultsData.rawData;
  const n = data.length;
  let testStat, pValue, critValue, testName, df;
  
  if (currentTestParameter === 'mean') {
    // One-sample t-test
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stderr = Math.sqrt(variance / n);
    
    testStat = (mean - currentH0Value) / stderr;
    df = n - 1;
    
    if (currentTestOrientation === 'two-sided') {
      pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(testStat), df));
      critValue = jStat.studentt.inv(0.975, df);
    } else if (currentTestOrientation === 'left') {
      pValue = jStat.studentt.cdf(testStat, df);
      critValue = jStat.studentt.inv(0.05, df);
    } else {
      pValue = 1 - jStat.studentt.cdf(testStat, df);
      critValue = jStat.studentt.inv(0.95, df);
    }
    
    testName = `One-sample t-test (df=${df})`;
    
  } else if (currentTestParameter === 'variance') {
    // Chi-square test for variance
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const sampleVar = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    
    testStat = ((n - 1) * sampleVar) / currentH0Value;
    df = n - 1;
    
    if (currentTestOrientation === 'two-sided') {
      const pLower = jStat.chisquare.cdf(testStat, df);
      const pUpper = 1 - pLower;
      pValue = 2 * Math.min(pLower, pUpper);
      critValue = jStat.chisquare.inv(0.975, df);
    } else if (currentTestOrientation === 'left') {
      pValue = jStat.chisquare.cdf(testStat, df);
      critValue = jStat.chisquare.inv(0.05, df);
    } else {
      pValue = 1 - jStat.chisquare.cdf(testStat, df);
      critValue = jStat.chisquare.inv(0.95, df);
    }
    
    testName = `Chi-square test (df=${df})`;
    
  } else if (currentTestParameter === 'median') {
    // Sign test for median
    const sorted = [...data].sort((a, b) => a - b);
    const sampleMedian = sorted[Math.floor(n / 2)];
    
    const above = data.filter(x => x > currentH0Value).length;
    const below = data.filter(x => x < currentH0Value).length;
    const nTies = n - above - below;
    
    testStat = above;
    const nEff = above + below;
    
    if (currentTestOrientation === 'two-sided') {
      pValue = 2 * Math.min(
        jStat.binomial.cdf(Math.min(above, below), nEff, 0.5),
        1 - jStat.binomial.cdf(Math.min(above, below) - 1, nEff, 0.5)
      );
    } else if (currentTestOrientation === 'left') {
      pValue = jStat.binomial.cdf(below, nEff, 0.5);
    } else {
      pValue = 1 - jStat.binomial.cdf(above - 1, nEff, 0.5);
    }
    
    testName = `Sign test (n_eff=${nEff}, ties=${nTies})`;
    critValue = null;
    df = null;
  }
  
  return { testStat, pValue, critValue, testName, df };
}

/**
 * Bootstrap hypothesis test
 */
function runBootstrapTest() {
  const data = resultsData.rawData;
  const n = data.length;
  const B = bootstrapIterations;
  
  // Calculate observed statistic
  let observedStat;
  if (currentTestParameter === 'mean') {
    observedStat = data.reduce((a, b) => a + b, 0) / n;
  } else if (currentTestParameter === 'median') {
    const sorted = [...data].sort((a, b) => a - b);
    observedStat = sorted[Math.floor(n / 2)];
  } else if (currentTestParameter === 'variance') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    observedStat = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  }
  
  // Center data around H0
  const centered = data.map(x => x - (observedStat - currentH0Value));
  
  // Bootstrap resampling
  const bootstrapStats = [];
  for (let i = 0; i < B; i++) {
    const sample = [];
    for (let j = 0; j < n; j++) {
      sample.push(centered[Math.floor(Math.random() * n)]);
    }
    
    let stat;
    if (currentTestParameter === 'mean') {
      stat = sample.reduce((a, b) => a + b, 0) / n;
    } else if (currentTestParameter === 'median') {
      const sorted = [...sample].sort((a, b) => a - b);
      stat = sorted[Math.floor(n / 2)];
    } else if (currentTestParameter === 'variance') {
      const mean = sample.reduce((a, b) => a + b, 0) / n;
      stat = sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    }
    
    bootstrapStats.push(stat);
  }
  
  // Calculate p-value
  let pValue;
  if (currentTestOrientation === 'two-sided') {
    const extremeCount = bootstrapStats.filter(s => Math.abs(s - currentH0Value) >= Math.abs(observedStat - currentH0Value)).length;
    pValue = extremeCount / B;
  } else if (currentTestOrientation === 'left') {
    const extremeCount = bootstrapStats.filter(s => s <= observedStat).length;
    pValue = extremeCount / B;
  } else {
    const extremeCount = bootstrapStats.filter(s => s >= observedStat).length;
    pValue = extremeCount / B;
  }
  
  return {
    testStat: observedStat,
    pValue: pValue,
    critValue: null,
    testName: `Bootstrap test (${B} replicates)`,
    df: null
  };
}

/**
 * Display test results
 */
function displayTestResults(results) {
  const { testStat, pValue, critValue, testName, df } = results;
  const significance = pValue < 0.05 ? 'Reject H₀' : 'Fail to reject H₀';
  const significanceClass = pValue < 0.05 ? 'reject' : 'fail-reject';
  
  const orientationLabels = {
    'left': '<',
    'two-sided': '≠',
    'right': '>'
  };
  
  const paramLabels = {
    'mean': 'μ',
    'median': 'M',
    'variance': 'σ²'
  };
  
  document.getElementById('hypothesisResults').innerHTML = `
    <div class="test-result-display">
      <div class="hypothesis-statement">
        <div class="hypothesis-row">
          <strong>H₀:</strong> ${paramLabels[currentTestParameter]} = ${currentH0Value}
        </div>
        <div class="hypothesis-row">
          <strong>H₁:</strong> ${paramLabels[currentTestParameter]} ${orientationLabels[currentTestOrientation]} ${currentH0Value}
        </div>
      </div>
      
      <div class="test-decision ${significanceClass}">
        <div class="decision-label">${significance}</div>
        <div class="p-value-display">p-value: ${pValue.toFixed(6)}</div>
      </div>
      
      <table class="test-stats-table">
        <thead>
          <tr>
            <th>Statistic</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Test Statistic</td>
            <td>${testStat.toFixed(4)}</td>
          </tr>
          <tr>
            <td>p-value</td>
            <td>${pValue.toFixed(6)}</td>
          </tr>
          ${critValue ? `<tr><td>Critical Value (α=0.05)</td><td>±${critValue.toFixed(4)}</td></tr>` : ''}
          ${df ? `<tr><td>Degrees of Freedom</td><td>${df}</td></tr>` : ''}
          <tr>
            <td>Method</td>
            <td>${testName}</td>
          </tr>
          <tr>
            <td>Alternative</td>
            <td>${currentTestOrientation}</td>
          </tr>
          <tr>
            <td>Significance Level</td>
            <td>α = 0.05</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
