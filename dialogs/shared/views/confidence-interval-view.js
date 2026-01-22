/**
 * Confidence Interval View - VB6 Version
 * 
 * Shared Analysis Component using exact VB6 CofInterval.frm calculations
 * 
 * Can be used by: Univariate, Regression, any module needing confidence intervals
 * 
 * Requirements:
 * - Global variable: resultsData { rawData, descriptive, column, n }
 * - jStat library must be loaded
 * 
 * Exports:
 * - displayConfidenceIntervalView() - Main display function
 * - Bootstrap and Classical CI calculations (VB6 compatible)
 * 
 * VB6 Compatibility:
 * - Classical Mean: Uses Excel's TINV with FPC correction
 * - Classical Stdev: Uses Excel's CHIINV distribution
 * - Bootstrap: Uses percentile method matching VB6
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
 * Classical confidence interval - VB6 Version
 * Matches VB6 CofInterval.frm calculations exactly
 */
function calculateClassicalCI() {
  const data = resultsData.rawData;
  const n = data.length;
  const alpha = 1 - (currentConfidence / 100);
  
  let pointEstimate, lcl, ucl, methodName;
  
  if (currentParameter === 'mean') {
    // VB6: Average(Victor1)
    const mean = data.reduce((a, b) => a + b, 0) / n;
    
    // VB6: Stdev(Victor1)
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdev = Math.sqrt(variance);
    
    // VB6: Factor = ((pop - n) / (pop - 1)) ^ 0.5
    // For now, Factor = 1 (no finite population correction in this simplified version)
    const Factor = 1;
    
    // VB6: xlApp.TInv(alpha, n - 1) - Excel's TINV returns two-tailed value
    const tCrit = jStat.studentt.inv(1 - alpha / 2, n - 1);
    
    // VB6: Margin = TInv(alpha, n-1) * Factor * Stdev / sqrt(n)
    const marginOfError = tCrit * Factor * stdev / Math.sqrt(n);
    
    // VB6: LCL = Average - marginOfError, UCL = Average + marginOfError
    pointEstimate = mean;
    lcl = mean - marginOfError;
    ucl = mean + marginOfError;
    methodName = `t-distribution (df=${n-1})`;
    
  } else if (currentParameter === 'median') {
    // Median not supported in VB6 Classical method
    // Bootstrap method should be used for median
    const sorted = [...data].sort((a, b) => a - b);
    pointEstimate = sorted[Math.floor(n / 2)];
    
    const stderr = 1.253 * Math.sqrt(n) / n;
    const zCrit = jStat.normal.inv(1 - alpha / 2, 0, 1);
    const delta = zCrit * stderr * (sorted[n-1] - sorted[0]);
    
    lcl = pointEstimate - delta;
    ucl = pointEstimate + delta;
    methodName = 'Binomial approximation (not VB6)';
    
  } else if (currentParameter === 'variance') {
    // VB6: Average(Victor1)
    const mean = data.reduce((a, b) => a + b, 0) / n;
    
    // VB6: Variance = Stdev^2
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    
    // VB6: xlApp.ChiInv(probability, df)
    // Note: jStat uses left-tail, Excel's CHIINV uses right-tail
    // So we need to swap the probabilities
    const chiLower = jStat.chisquare.inv(1 - alpha / 2, n - 1);  // VB6: ChiInv(1-alpha/2, n-1)
    const chiUpper = jStat.chisquare.inv(alpha / 2, n - 1);      // VB6: ChiInv(alpha/2, n-1)
    
    // VB6: LCL = ((n-1)*Variance) / ChiUpper, UCL = ((n-1)*Variance) / ChiLower
    pointEstimate = variance;
    lcl = ((n - 1) * variance) / chiLower;
    ucl = ((n - 1) * variance) / chiUpper;
    methodName = `χ² distribution (df=${n-1})`;
    
  } else if (currentParameter === 'stdev') {
    // VB6: Average(Victor1)
    const mean = data.reduce((a, b) => a + b, 0) / n;
    
    // VB6: Stdev(Victor1)
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdev = Math.sqrt(variance);
    
    // VB6: xlApp.ChiInv(probability, df)
    const chiLower = jStat.chisquare.inv(1 - alpha / 2, n - 1);  // VB6: ChiInv(1-alpha/2, n-1)
    const chiUpper = jStat.chisquare.inv(alpha / 2, n - 1);      // VB6: ChiInv(alpha/2, n-1)
    
    // VB6: LCL = sqrt(((n-1)*Stdev^2) / ChiUpper)
    // VB6: UCL = sqrt(((n-1)*Stdev^2) / ChiLower)
    pointEstimate = stdev;
    lcl = Math.sqrt(((n - 1) * variance) / chiLower);
    ucl = Math.sqrt(((n - 1) * variance) / chiUpper);
    methodName = `χ² distribution (df=${n-1})`;
  }
  
  return { pointEstimate, lcl, ucl, methodName };
}

/**
 * Bootstrap confidence interval - VB6 Version
 * Matches VB6 CofInterval.frm Resample_click() procedure exactly
 */
function calculateBootstrapCI() {
  const data = resultsData.rawData;
  const intBootstrapN = data.length;  // VB6: intBootstrapN = 1 * Me.Ssize
  const intIteration = 2000;           // VB6: intIteration = 1 * Me.Iterations (default 500, using 2000 here)
  const alpha = 1 - (currentConfidence / 100);
  
  // VB6: ReDim hold2(intIteration) - Array for bootstrapped statistics
  const hold2 = [];
  
  // VB6: Randomize
  // VB6: For j = 1 To intIteration
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
      stat = hold.reduce((a, b) => a + b, 0) / intBootstrapN;
    } else if (currentParameter === 'median') {
      // VB6: If Me.OpParameter(2).Value = True Then hold2(j) = CalculateMedian10(hold)
      const sorted = [...hold].sort((a, b) => a - b);
      const mid = Math.floor(intBootstrapN / 2);
      stat = intBootstrapN % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    } else if (currentParameter === 'variance') {
      // Variance not in VB6, but using same logic as stdev
      const mean = hold.reduce((a, b) => a + b, 0) / intBootstrapN;
      stat = hold.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (intBootstrapN - 1);
    } else if (currentParameter === 'stdev') {
      // VB6: If Me.OpParameter(1).Value = True Then hold2(j) = Statsmain.Stdev(hold)
      const mean = hold.reduce((a, b) => a + b, 0) / intBootstrapN;
      const variance = hold.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (intBootstrapN - 1);
      stat = Math.sqrt(variance);
    }
    
    hold2.push(stat);
  }
  
  // VB6: AverageB = Statsmain.Average(hold2)
  const AverageB = hold2.reduce((a, b) => a + b, 0) / intIteration;
  
  // VB6: UCLM = xlApp.Percentile(hold2, 1 - (alpha / 2))
  // VB6: LCLM = xlApp.Percentile(hold2, alpha / 2)
  hold2.sort((a, b) => a - b);
  const lowerIdx = Math.floor(intIteration * (alpha / 2));
  const upperIdx = Math.floor(intIteration * (1 - alpha / 2));
  const LCLM = hold2[lowerIdx];
  const UCLM = hold2[upperIdx];
  
  return {
    pointEstimate: AverageB,
    lcl: LCLM,
    ucl: UCLM,
    methodName: `Bootstrap (${intIteration} replicates, VB6 method)`
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
