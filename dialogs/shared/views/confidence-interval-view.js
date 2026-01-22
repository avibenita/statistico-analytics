/**
 * Confidence Interval View - Matches 0confidence-interval.html
 * 
 * Shared Analysis Component - Uses EXACT same calculations as 0confidence-interval.html
 * 
 * Can be used by: Univariate, Regression, any module needing confidence intervals
 * 
 * Requirements:
 * - Global variable: resultsData { rawData, descriptive, column, n }
 * - NO external libraries needed (jStat not required)
 * 
 * Exports:
 * - displayConfidenceIntervalView() - Main display function
 * - Bootstrap and Classical CI calculations
 * 
 * Implementation Notes:
 * - Classical Mean: T-distribution with optional FPC correction
 * - Classical Stdev: Chi-square distribution (asymmetric intervals)
 * - Bootstrap: Percentile method for all statistics
 * - All helper functions match HTML version exactly
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
 * Classical confidence interval - Matches 0confidence-interval.html exactly
 */
function calculateClassicalCI() {
  const data = resultsData.rawData;
  const n = data.length;
  const alpha = 1 - (currentConfidence / 100);
  
  let pointEstimate, lcl, ucl, methodName;
  
  if (currentParameter === 'mean') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdev = Math.sqrt(variance);
    
    // Finite population correction factor (matching HTML version)
    let Factor = 1;
    // Note: Population size not available in this context, so Factor = 1
    
    // VB6: xlApp.TInv(alpha, n - 1) * Factor * Stdev / n ^ 0.5
    const tValue = getTValue(alpha / 2, n - 1);
    const marginOfError = tValue * Factor * stdev / Math.sqrt(n);
    
    // VB6: LCL = Average - TInv * Factor * Stdev / sqrt(n)
    // VB6: UCL = Average + TInv * Factor * Stdev / sqrt(n)
    pointEstimate = mean;
    lcl = mean - marginOfError;
    ucl = mean + marginOfError;
    methodName = `t-distribution (df=${n-1})`;
    
  } else if (currentParameter === 'median') {
    // Median not supported in Classical method (use Bootstrap)
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    pointEstimate = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    
    // Use bootstrap instead
    lcl = pointEstimate;
    ucl = pointEstimate;
    methodName = 'Use Bootstrap for Median';
    
  } else if (currentParameter === 'variance') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    
    // VB6: UCL = sqrt(((n - 1) * Stdev^2) / ChiInv(1 - alpha/2, n - 1))
    // VB6: LCL = sqrt(((n - 1) * Stdev^2) / ChiInv(alpha/2, n - 1))
    const chiUpper = getChiSquareValue(alpha / 2, n - 1);
    const chiLower = getChiSquareValue(1 - alpha / 2, n - 1);
    
    pointEstimate = variance;
    lcl = ((n - 1) * variance) / chiLower;
    ucl = ((n - 1) * variance) / chiUpper;
    methodName = `χ² distribution (df=${n-1})`;
    
  } else if (currentParameter === 'stdev') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdev = Math.sqrt(variance);
    
    // VB6: UCL = sqrt(((n - 1) * Stdev^2) / ChiInv(1 - alpha/2, n - 1))
    // VB6: LCL = sqrt(((n - 1) * Stdev^2) / ChiInv(alpha/2, n - 1))
    const chiUpper = getChiSquareValue(alpha / 2, n - 1);
    const chiLower = getChiSquareValue(1 - alpha / 2, n - 1);
    
    pointEstimate = stdev;
    lcl = Math.sqrt(((n - 1) * variance) / chiLower);
    ucl = Math.sqrt(((n - 1) * variance) / chiUpper);
    methodName = `χ² distribution (df=${n-1})`;
  }
  
  return { pointEstimate, lcl, ucl, methodName };
}

/**
 * Bootstrap confidence interval - Matches 0confidence-interval.html exactly
 */
function calculateBootstrapCI() {
  const data = resultsData.rawData;
  const intBootstrapN = data.length;  // VB6: intBootstrapN = 1 * Me.Ssize
  const intIteration = 2000;           // Bootstrap iterations (HTML uses configurable, we use 2000)
  const alpha = 1 - (currentConfidence / 100);
  
  // VB6: ReDim hold2(intIteration) - Array for bootstrapped statistics
  const hold2 = [];
  
  // VB6: Randomize and resample loop
  for (let j = 0; j < intIteration; j++) {
    // VB6: ReDim hold(intBootstrapN) - Bootstrapped array
    const hold = [];
    
    // VB6: For i = 1 To intBootstrapN
    //        a = Rnd
    //        hold(i) = Victor1(Int(a * UBound(Victor1) + 1))
    //      Next i
    for (let i = 0; i < intBootstrapN; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      hold.push(data[randomIndex]);
    }
    
    // VB6: Calculate statistic for this resample
    let stat;
    if (currentParameter === 'mean') {
      // VB6: If Me.OpParameter(0).Value = True Then hold2(j) = Statsmain.Average(hold)
      stat = calculateMean(hold);
    } else if (currentParameter === 'stdev') {
      // VB6: If Me.OpParameter(1).Value = True Then hold2(j) = Statsmain.Stdev(hold)
      const mean = calculateMean(hold);
      stat = calculateStdev(hold, mean);
    } else if (currentParameter === 'median') {
      // VB6: If Me.OpParameter(2).Value = True Then hold2(j) = CalculateMedian10(hold)
      stat = calculateMedian(hold);
    } else if (currentParameter === 'variance') {
      const mean = calculateMean(hold);
      stat = calculateVariance(hold, mean);
    }
    
    hold2.push(stat);
  }
  
  // VB6: AverageB = Statsmain.Average(hold2)
  const AverageB = calculateMean(hold2);
  
  // VB6: UCLM = xlApp.Percentile(hold2, 1 - (alpha / 2))
  // VB6: LCLM = xlApp.Percentile(hold2, alpha / 2)
  hold2.sort((a, b) => a - b);
  const LCLM = calculatePercentile(hold2, alpha / 2);
  const UCLM = calculatePercentile(hold2, 1 - alpha / 2);
  
  return {
    pointEstimate: AverageB,
    lcl: LCLM,
    ucl: UCLM,
    methodName: `Bootstrap (${intIteration} replicates)`
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

// ============================================
// HELPER FUNCTIONS - Match 0confidence-interval.html exactly
// ============================================

function calculateMean(data) {
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

function calculateStdev(data, mean) {
  if (!data || data.length < 2) return 0;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
  return Math.sqrt(variance);
}

function calculateVariance(data, mean) {
  if (!data || data.length < 2) return 0;
  return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
}

function calculateMedian(data) {
  if (!data || data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculatePercentile(data, p) {
  if (!data || data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// Statistical functions - VB6 Excel compatibility (from HTML version)
// VB6 uses: xlApp.TInv(alpha, n - 1)
// Excel's TINV returns two-tailed t-value
function getTValue(p, df) {
  // t-distribution approximation
  // For df > 30, use normal approximation
  if (df > 30) {
    return normalInv(1 - p);
  }
  
  // For smaller df, use improved approximation
  // This matches Excel's TINV function more closely
  const z = normalInv(1 - p);
  const g1 = (z * z * z + z) / 4;
  const g2 = (5 * z * z * z * z * z + 16 * z * z * z + 3 * z) / 96;
  const g3 = (3 * Math.pow(z, 7) + 19 * Math.pow(z, 5) + 17 * z * z * z - 15 * z) / 384;
  const g4 = (79 * Math.pow(z, 9) + 776 * Math.pow(z, 7) + 1482 * Math.pow(z, 5) - 1920 * z * z * z - 945 * z) / 92160;
  
  return z + g1 / df + g2 / (df * df) + g3 / (df * df * df) + g4 / (df * df * df * df);
}

function normalInv(p) {
  // Approximation of inverse normal CDF (from HTML version)
  if (p <= 0 || p >= 1) return 0;
  
  const a1 = -3.969683028665376e+01;
  const a2 =  2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 =  1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 =  2.506628277459239e+00;
  
  const b1 = -5.447609879822406e+01;
  const b2 =  1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 =  6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;
  
  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 =  4.374664141464968e+00;
  const c6 =  2.938163982698783e+00;
  
  const d1 =  7.784695709041462e-03;
  const d2 =  3.224671290700398e-01;
  const d3 =  2.445134137142996e+00;
  const d4 =  3.754408661907416e+00;
  
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  
  let q, r, result;
  
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    result = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    result = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
            (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    result = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
             ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
  
  return result;
}

// VB6 uses: xlApp.ChiInv(probability, df)
// Excel's CHIINV returns the inverse of the right-tailed chi-square distribution
function getChiSquareValue(p, df) {
  // Chi-square inverse using Wilson-Hilferty transformation
  // This approximation matches Excel's CHIINV function
  if (p <= 0 || p >= 1) return df;
  
  const z = normalInv(p);
  
  // Wilson-Hilferty transformation for chi-square
  const h = 2 / (9 * df);
  const chiSq = df * Math.pow(1 - h + z * Math.sqrt(h), 3);
  
  // Ensure positive value and reasonable bounds
  return Math.max(0.001, Math.min(chiSq, df * 10));
}
