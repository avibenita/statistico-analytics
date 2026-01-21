/**
 * Confidence Interval View - Shared Analysis Component
 * 
 * Can be used by: Univariate, Regression, any module needing confidence intervals
 * 
 * Requirements:
 * - Global variable: resultsData { rawData, descriptive, column, n }
 * - jStat library must be loaded
 * 
 * Exports:
 * - displayConfidenceIntervalView() - Main display function
 * - Bootstrap and Classical CI calculations
 */

let currentMethod = 'classical';
let currentParameter = 'mean';
let currentConfidence = 95;

/**
 * Display confidence interval view
 */
function displayConfidenceIntervalView() {
  const { column, n } = resultsData;
  
  document.getElementById('variableName').textContent = column || 'Variable';
  document.getElementById('sampleSize').textContent = `(n=${n})`;
  
  document.getElementById('resultsContent').innerHTML = `
    <div class="ci-container">
      <!-- Method Selection -->
      <div class="ci-panel">
        <div class="panel-heading">
          <i class="fa-solid fa-chart-line"></i>
          Method Selection
        </div>
        <div class="panel-body">
          <div class="method-buttons">
            <button class="method-btn active" onclick="selectMethod('classical')" id="btn-classical">
              <i class="fa-solid fa-calculator"></i>
              <span>Classical</span>
            </button>
            <button class="method-btn" onclick="selectMethod('bootstrap')" id="btn-bootstrap">
              <i class="fa-solid fa-shuffle"></i>
              <span>Bootstrap</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Parameter Selection -->
      <div class="ci-panel">
        <div class="panel-heading">
          <i class="fa-solid fa-sliders"></i>
          Parameter
        </div>
        <div class="panel-body">
          <div class="parameter-grid">
            <button class="param-btn active" onclick="selectParameter('mean')" id="param-mean">
              <i class="fa-solid fa-chart-bar"></i>
              <span>Mean</span>
            </button>
            <button class="param-btn" onclick="selectParameter('median')" id="param-median">
              <i class="fa-solid fa-chart-line"></i>
              <span>Median</span>
            </button>
            <button class="param-btn" onclick="selectParameter('variance')" id="param-variance">
              <i class="fa-solid fa-chart-area"></i>
              <span>Variance</span>
            </button>
            <button class="param-btn" onclick="selectParameter('stdev')" id="param-stdev">
              <i class="fa-solid fa-chart-scatter"></i>
              <span>Std Dev</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Confidence Level -->
      <div class="ci-panel">
        <div class="panel-heading">
          <i class="fa-solid fa-percent"></i>
          Confidence Level
        </div>
        <div class="panel-body">
          <div class="confidence-control">
            <input type="range" id="confidenceSlider" min="80" max="99" value="95" step="1" oninput="updateConfidence(this.value)">
            <div class="confidence-display">
              <span id="confidenceValue">95</span>%
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="ci-panel results-panel">
        <div class="panel-heading">
          <i class="fa-solid fa-chart-simple"></i>
          Results
        </div>
        <div class="panel-body">
          <div id="ciResults">
            <div class="loading" style="text-align: center; padding: 20px; color: var(--text-muted);">
              <i class="fa-solid fa-info-circle" style="font-size: 32px; margin-bottom: 12px;"></i>
              <div>Select method and parameter</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    calculateCI();
  }, 100);
}

/**
 * Select method (classical or bootstrap)
 */
function selectMethod(method) {
  currentMethod = method;
  document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${method}`).classList.add('active');
  calculateCI();
}

/**
 * Select parameter
 */
function selectParameter(param) {
  currentParameter = param;
  document.querySelectorAll('.param-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`param-${param}`).classList.add('active');
  calculateCI();
}

/**
 * Update confidence level
 */
function updateConfidence(value) {
  currentConfidence = parseInt(value);
  document.getElementById('confidenceValue').textContent = value;
  calculateCI();
}

/**
 * Calculate confidence interval
 */
function calculateCI() {
  if (!resultsData || !resultsData.rawData) return;
  
  const results = currentMethod === 'classical' 
    ? calculateClassicalCI() 
    : calculateBootstrapCI();
  
  displayCIResults(results);
}

/**
 * Classical confidence interval
 */
function calculateClassicalCI() {
  const data = resultsData.rawData;
  const n = data.length;
  const alpha = 1 - (currentConfidence / 100);
  
  let pointEstimate, lcl, ucl, methodName;
  
  if (currentParameter === 'mean') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stderr = Math.sqrt(variance / n);
    const tCrit = jStat.studentt.inv(1 - alpha / 2, n - 1);
    
    pointEstimate = mean;
    lcl = mean - tCrit * stderr;
    ucl = mean + tCrit * stderr;
    methodName = `t-distribution (df=${n-1})`;
    
  } else if (currentParameter === 'median') {
    const sorted = [...data].sort((a, b) => a - b);
    pointEstimate = sorted[Math.floor(n / 2)];
    
    // Binomial CI for median
    const stderr = 1.253 * Math.sqrt(n) / n;
    const zCrit = jStat.normal.inv(1 - alpha / 2, 0, 1);
    const delta = zCrit * stderr * (sorted[n-1] - sorted[0]);
    
    lcl = pointEstimate - delta;
    ucl = pointEstimate + delta;
    methodName = 'Binomial approximation';
    
  } else if (currentParameter === 'variance') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    
    const chiLower = jStat.chisquare.inv(alpha / 2, n - 1);
    const chiUpper = jStat.chisquare.inv(1 - alpha / 2, n - 1);
    
    pointEstimate = variance;
    lcl = ((n - 1) * variance) / chiUpper;
    ucl = ((n - 1) * variance) / chiLower;
    methodName = `χ² distribution (df=${n-1})`;
    
  } else if (currentParameter === 'stdev') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdev = Math.sqrt(variance);
    
    const chiLower = jStat.chisquare.inv(alpha / 2, n - 1);
    const chiUpper = jStat.chisquare.inv(1 - alpha / 2, n - 1);
    
    pointEstimate = stdev;
    lcl = Math.sqrt(((n - 1) * variance) / chiUpper);
    ucl = Math.sqrt(((n - 1) * variance) / chiLower);
    methodName = `χ² distribution (df=${n-1})`;
  }
  
  return { pointEstimate, lcl, ucl, methodName };
}

/**
 * Bootstrap confidence interval
 */
function calculateBootstrapCI() {
  const data = resultsData.rawData;
  const n = data.length;
  const B = 2000; // Bootstrap replicates
  const bootstrapStats = [];
  
  // Generate bootstrap samples
  for (let i = 0; i < B; i++) {
    const sample = [];
    for (let j = 0; j < n; j++) {
      sample.push(data[Math.floor(Math.random() * n)]);
    }
    
    // Calculate statistic
    let stat;
    if (currentParameter === 'mean') {
      stat = sample.reduce((a, b) => a + b, 0) / n;
    } else if (currentParameter === 'median') {
      const sorted = [...sample].sort((a, b) => a - b);
      stat = sorted[Math.floor(n / 2)];
    } else if (currentParameter === 'variance') {
      const mean = sample.reduce((a, b) => a + b, 0) / n;
      stat = sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    } else if (currentParameter === 'stdev') {
      const mean = sample.reduce((a, b) => a + b, 0) / n;
      const variance = sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
      stat = Math.sqrt(variance);
    }
    
    bootstrapStats.push(stat);
  }
  
  // Sort and find percentiles
  bootstrapStats.sort((a, b) => a - b);
  const alpha = 1 - (currentConfidence / 100);
  const lowerIdx = Math.floor(B * (alpha / 2));
  const upperIdx = Math.floor(B * (1 - alpha / 2));
  
  // Original statistic
  let pointEstimate;
  if (currentParameter === 'mean') {
    pointEstimate = data.reduce((a, b) => a + b, 0) / n;
  } else if (currentParameter === 'median') {
    const sorted = [...data].sort((a, b) => a - b);
    pointEstimate = sorted[Math.floor(n / 2)];
  } else if (currentParameter === 'variance') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    pointEstimate = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  } else if (currentParameter === 'stdev') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    pointEstimate = Math.sqrt(variance);
  }
  
  return {
    pointEstimate,
    lcl: bootstrapStats[lowerIdx],
    ucl: bootstrapStats[upperIdx],
    methodName: `Bootstrap (${B} replicates)`
  };
}

/**
 * Display CI results
 */
function displayCIResults(results) {
  const { pointEstimate, lcl, ucl, methodName } = results;
  const marginOfError = (ucl - lcl) / 2;
  
  const paramLabels = {
    mean: 'Mean',
    median: 'Median',
    variance: 'Variance',
    stdev: 'Standard Deviation'
  };
  
  document.getElementById('ciResults').innerHTML = `
    <div class="ci-result-display">
      <div class="result-header">
        <strong>${paramLabels[currentParameter]}</strong>
        <span style="font-size: 11px; color: var(--text-muted);">${methodName}</span>
      </div>
      
      <div class="result-value-large">
        ${pointEstimate.toFixed(4)}
        <span class="plus-minus">±</span>
        ${marginOfError.toFixed(4)}
      </div>
      
      <div class="confidence-bar-container">
        <div class="confidence-bar" style="left: 25%; width: 50%;"></div>
        <div class="confidence-marker"></div>
        <div class="confidence-label lcl">${lcl.toFixed(4)}</div>
        <div class="confidence-label mean">Point Estimate</div>
        <div class="confidence-label ucl">${ucl.toFixed(4)}</div>
      </div>
      
      <table class="ci-stats-table">
        <thead>
          <tr>
            <th>Statistic</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Point Estimate</td>
            <td>${pointEstimate.toFixed(4)}</td>
          </tr>
          <tr>
            <td>Lower Confidence Limit</td>
            <td>${lcl.toFixed(4)}</td>
          </tr>
          <tr>
            <td>Upper Confidence Limit</td>
            <td>${ucl.toFixed(4)}</td>
          </tr>
          <tr>
            <td>Margin of Error</td>
            <td>${marginOfError.toFixed(4)}</td>
          </tr>
          <tr>
            <td>Confidence Level</td>
            <td>${currentConfidence}%</td>
          </tr>
          <tr>
            <td>Method</td>
            <td>${methodName}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
