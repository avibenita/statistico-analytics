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
 * Display confidence interval view - Matches 0confidence-interval.html UI exactly
 */
function displayConfidenceIntervalView() {
  const { column, n } = resultsData;
  
  document.getElementById('variableName').textContent = column || 'Variable';
  document.getElementById('sampleSize').textContent = `(n=${n})`;
  
  // Match HTML version UI exactly (dark theme with radio buttons)
  document.getElementById('resultsContent').innerHTML = `
    <style>
      /* Dark theme matching 0confidence-interval.html */
      .ci-config-panel {
        background: #1a1f2e;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
        border: 1px solid #2d3748;
      }
      
      .ci-section-title {
        color: rgba(255,255,255,0.6);
        font-size: 0.85em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        font-weight: bold;
      }
      
      .ci-inline-radio {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        align-items: center;
      }
      
      .ci-radio-option {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        color: rgba(255,255,255,0.8);
        font-size: 14px;
      }
      
      .ci-radio-option input[type="radio"] {
        cursor: pointer;
        width: 18px;
        height: 18px;
        accent-color: rgb(255,165,120);
      }
      
      .ci-alpha-control {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .ci-alpha-control select {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        color: white;
        padding: 6px 10px;
      }
      
      .ci-alpha-control input[type="range"] {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: rgba(255,255,255,0.2);
        outline: none;
        -webkit-appearance: none;
      }
      
      .ci-alpha-control input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgb(255,165,120);
        cursor: pointer;
        box-shadow: 0 0 8px rgba(255,165,120,0.5);
      }
      
      .ci-alpha-display {
        font-size: 15px;
        font-weight: 600;
        color: rgb(255,165,120);
        min-width: 60px;
        text-align: center;
      }
      
      .ci-results-panel {
        background: #1a1f2e;
        border-radius: 10px;
        padding: 20px;
        border: 2px solid rgba(255,255,255,0.25);
      }
      
      .ci-result-large {
        text-align: center;
        font-size: 28px;
        font-weight: 600;
        color: rgb(255,165,120);
        margin: 15px 0;
        letter-spacing: 0.5px;
      }
      
      .ci-plus-minus {
        font-size: 24px;
        color: rgba(255,255,255,0.8);
        margin: 0 8px;
      }
      
      .ci-confidence-bar-container {
        position: relative;
        height: 60px;
        margin: 20px 0;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .ci-confidence-bar {
        position: absolute;
        height: 100%;
        background: linear-gradient(90deg, rgba(120,200,255,0.2), rgba(120,200,255,0.4), rgba(120,200,255,0.2));
        border: 2px solid rgb(120,200,255);
        border-radius: 4px;
        transition: all 0.5s ease;
      }
      
      .ci-confidence-marker {
        position: absolute;
        width: 3px;
        height: 100%;
        background: rgb(255,165,120);
        box-shadow: 0 0 10px rgb(255,165,120);
        left: 50%;
        transform: translateX(-50%);
      }
      
      .ci-delta-label {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 13px;
        font-weight: 700;
        color: white;
        background: rgba(0,0,0,0.8);
        padding: 5px 10px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.3);
      }
      
      .ci-delta-label.left { left: 8px; }
      .ci-delta-label.right { right: 8px; }
      
      .ci-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 20px 0;
      }
      
      .ci-stat-box {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        padding: 12px;
        text-align: center;
      }
      
      .ci-stat-label {
        font-size: 10px;
        color: rgba(255,255,255,0.6);
        text-transform: uppercase;
        margin-bottom: 6px;
        letter-spacing: 0.5px;
      }
      
      .ci-stat-value {
        font-size: 17px;
        font-weight: 600;
        color: white;
      }
      
      .ci-interpretation {
        margin-top: 15px;
        padding: 12px;
        background: rgba(255,255,255,0.03);
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.8);
        font-size: 12px;
        line-height: 1.6;
      }
    </style>
    
    <div class="ci-container">
      <!-- Configuration Panel -->
      <div class="ci-config-panel">
        <div style="display: flex; gap: 30px; margin-bottom: 15px;">
          <!-- Method -->
          <div style="flex: 1;">
            <div class="ci-section-title">METHOD:</div>
            <div class="ci-inline-radio">
              <label class="ci-radio-option">
                <input type="radio" name="ci-method" value="classical" checked onchange="selectMethod('classical')">
                <span>Classical</span>
              </label>
              <label class="ci-radio-option">
                <input type="radio" name="ci-method" value="bootstrap" onchange="selectMethod('bootstrap')">
                <span>Bootstrap</span>
              </label>
            </div>
          </div>
          
          <!-- Parameter -->
          <div style="flex: 1;">
            <div class="ci-section-title">PARAMETER:</div>
            <div class="ci-inline-radio">
              <label class="ci-radio-option">
                <input type="radio" name="ci-parameter" value="mean" checked onchange="selectParameter('mean')">
                <span>Mean</span>
              </label>
              <label class="ci-radio-option">
                <input type="radio" name="ci-parameter" value="stdev" onchange="selectParameter('stdev')">
                <span>Stdev</span>
              </label>
              <label class="ci-radio-option" style="opacity: 0.4;">
                <input type="radio" name="ci-parameter" value="median" disabled>
                <span>Median</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Alpha Control -->
        <div>
          <div class="ci-alpha-control">
            <label style="color: rgba(255,255,255,0.6); font-size: 0.95em; font-weight: bold; min-width: 30px;">α =</label>
            <select id="ci-alpha-preset" onchange="setAlphaPreset()">
              <option value="0.01">0.01 (99%)</option>
              <option value="0.02">0.02 (98%)</option>
              <option value="0.05" selected>0.05 (95%)</option>
              <option value="0.10">0.10 (90%)</option>
            </select>
            <input type="range" id="ci-alpha-slider" min="0.01" max="0.15" step="0.001" value="0.05" oninput="updateAlphaSlider()">
            <span class="ci-alpha-display" id="ci-alpha-display">0.050</span>
          </div>
        </div>
      </div>
      
      <!-- Results Panel -->
      <div class="ci-results-panel">
        <h3 style="margin: 0 0 15px 0; color: rgb(255,165,120); font-size: 1.1em; font-weight: 600;">Margin of Errors</h3>
        
        <div class="ci-result-large">
          <span id="ci-mean-value">—</span>
          <span class="ci-plus-minus" id="ci-plus-minus">±</span>
          <span id="ci-margin-value">—</span>
        </div>
        
        <div class="ci-confidence-bar-container">
          <div class="ci-confidence-bar" id="ci-confidence-bar">
            <div class="ci-delta-label left" id="ci-delta-left">—</div>
            <div class="ci-delta-label right" id="ci-delta-right">—</div>
          </div>
          <div class="ci-confidence-marker"></div>
        </div>
        
        <div class="ci-stats-grid">
          <div class="ci-stat-box">
            <div class="ci-stat-label">Lower Limit (LCL)</div>
            <div class="ci-stat-value" id="ci-lcl-value">—</div>
          </div>
          <div class="ci-stat-box">
            <div class="ci-stat-label">Point Estimate</div>
            <div class="ci-stat-value" id="ci-center-value">—</div>
          </div>
          <div class="ci-stat-box">
            <div class="ci-stat-label">Upper Limit (UCL)</div>
            <div class="ci-stat-value" id="ci-ucl-value">—</div>
          </div>
          <div class="ci-stat-box">
            <div class="ci-stat-label">Sample Size (n)</div>
            <div class="ci-stat-value" id="ci-sample-size">${n}</div>
          </div>
          <div class="ci-stat-box">
            <div class="ci-stat-label">Confidence Level</div>
            <div class="ci-stat-value" id="ci-confidence-level">95%</div>
          </div>
          <div class="ci-stat-box">
            <div class="ci-stat-label">Decimals</div>
            <div class="ci-stat-value">
              <select id="ci-decimals" onchange="calculateCI()" style="background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 4px; width: 60px;">
                <option value="2" selected>2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="ci-interpretation" id="ci-interpretation">
          <i class="fa-solid fa-info-circle" style="color: rgb(120,200,255); margin-right: 6px;"></i>
          Configure parameters to see confidence interval.
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
 * Update alpha from slider
 */
function updateAlphaSlider() {
  const slider = document.getElementById('ci-alpha-slider');
  const alpha = parseFloat(slider.value);
  currentConfidence = ((1 - alpha) * 100).toFixed(0);
  document.getElementById('ci-alpha-display').textContent = alpha.toFixed(3);
  document.getElementById('ci-confidence-level').textContent = currentConfidence + '%';
  calculateCI();
}

/**
 * Set alpha from preset dropdown
 */
function setAlphaPreset() {
  const select = document.getElementById('ci-alpha-preset');
  const alpha = parseFloat(select.value);
  currentConfidence = ((1 - alpha) * 100).toFixed(0);
  document.getElementById('ci-alpha-slider').value = alpha;
  document.getElementById('ci-alpha-display').textContent = alpha.toFixed(3);
  document.getElementById('ci-confidence-level').textContent = currentConfidence + '%';
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
  
  let pointEstimate, lcl, ucl, margin, methodName;
  
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
    margin = marginOfError;
    methodName = `t-distribution (df=${n-1})`;
    
  } else if (currentParameter === 'median') {
    // Median not supported in Classical method (use Bootstrap)
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    pointEstimate = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    
    // Use bootstrap instead
    lcl = pointEstimate;
    ucl = pointEstimate;
    margin = null;
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
    margin = null; // Asymmetric interval
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
    margin = null; // Asymmetric interval
    methodName = `χ² distribution (df=${n-1})`;
  }
  
  return { pointEstimate, lcl, ucl, margin, methodName };
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
    margin: null, // Bootstrap uses asymmetric intervals
    methodName: `Bootstrap (${intIteration} replicates)`
  };
}

/**
 * Display CI results - Matches 0confidence-interval.html display exactly
 */
function displayCIResults(results) {
  const { pointEstimate, lcl, ucl, methodName, margin } = results;
  const decimals = parseInt(document.getElementById('ci-decimals')?.value || 2);
  
  // Update main display
  document.getElementById('ci-center-value').textContent = pointEstimate.toFixed(decimals);
  document.getElementById('ci-mean-value').textContent = pointEstimate.toFixed(decimals);
  
  // Show/hide ± symbol based on whether margin is available
  const plusMinus = document.getElementById('ci-plus-minus');
  const marginValue = document.getElementById('ci-margin-value');
  
  if (margin !== null && margin !== undefined) {
    plusMinus.style.display = 'inline';
    marginValue.style.display = 'inline';
    marginValue.textContent = margin.toFixed(decimals);
  } else {
    plusMinus.style.display = 'none';
    marginValue.style.display = 'none';
  }
  
  // Update LCL/UCL
  document.getElementById('ci-lcl-value').textContent = lcl.toFixed(decimals);
  document.getElementById('ci-ucl-value').textContent = ucl.toFixed(decimals);
  
  // Update confidence bar (dynamic positioning)
  const range = ucl - lcl;
  const center = pointEstimate;
  const visualHalfRange = range * 1.5;
  const visualMin = center - visualHalfRange;
  const visualMax = center + visualHalfRange;
  const totalVisualRange = visualMax - visualMin;
  
  const lclPercent = ((lcl - visualMin) / totalVisualRange) * 100;
  const uclPercent = ((ucl - visualMin) / totalVisualRange) * 100;
  const width = Math.max(0, Math.min(100, uclPercent - lclPercent));
  
  const bar = document.getElementById('ci-confidence-bar');
  bar.style.left = Math.max(0, Math.min(100 - width, lclPercent)) + '%';
  bar.style.width = width + '%';
  
  // Update delta labels
  const deltaLeft = Math.abs(pointEstimate - lcl);
  const deltaRight = Math.abs(ucl - pointEstimate);
  document.getElementById('ci-delta-left').textContent = '−' + deltaLeft.toFixed(decimals);
  document.getElementById('ci-delta-right').textContent = '+' + deltaRight.toFixed(decimals);
  
  // Update interpretation
  updateInterpretation(pointEstimate, lcl, ucl, margin, decimals);
}

/**
 * Update interpretation text
 */
function updateInterpretation(pointEstimate, lcl, ucl, margin, decimals) {
  const confidenceLevel = currentConfidence;
  const paramLabels = {
    mean: 'mean',
    stdev: 'standard deviation',
    median: 'median',
    variance: 'variance'
  };
  const paramName = paramLabels[currentParameter] || currentParameter;
  
  let interpretation = '';
  
  if (currentMethod === 'classical') {
    interpretation = `
      <i class="fa-solid fa-check-circle" style="color: rgb(120,200,255); margin-right: 6px;"></i>
      We are <strong style="color: rgb(255,165,120);">${confidenceLevel}% confident</strong> that the true population ${paramName} 
      lies between <strong style="color: rgb(120,200,255);">${lcl.toFixed(decimals)}</strong> and 
      <strong style="color: rgb(120,200,255);">${ucl.toFixed(decimals)}</strong>.
      ${margin ? ` Margin of error: <strong style="color: rgb(255,165,120);">±${margin.toFixed(decimals)}</strong>.` : ''}
    `;
  } else {
    interpretation = `
      <i class="fa-solid fa-check-circle" style="color: rgb(120,200,255); margin-right: 6px;"></i>
      Based on <strong style="color: rgb(255,165,120);">bootstrap resampling</strong>, 
      we are <strong style="color: rgb(255,165,120);">${confidenceLevel}% confident</strong> that the true population ${paramName} 
      lies between <strong style="color: rgb(120,200,255);">${lcl.toFixed(decimals)}</strong> and 
      <strong style="color: rgb(120,200,255);">${ucl.toFixed(decimals)}</strong>.
    `;
  }
  
  document.getElementById('ci-interpretation').innerHTML = interpretation;
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
