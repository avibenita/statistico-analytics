/**
 * Hypothesis Testing View - Shared Analysis Component
 * 
 * Matches 0H0testHypothesis.html L&F exactly
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
let currentTestParameter = 'Mean';
let currentTestOrientation = 'two-sided';
let currentH0Value = 0;
let bootstrapIterations = 500;
let currentAlpha = 0.05;

/**
 * Display hypothesis testing view matching 0H0testHypothesis.html
 */
function displayHypothesisTestingView() {
  const { column, n } = resultsData;
  
  document.getElementById('variableName').textContent = column || 'Variable';
  document.getElementById('sampleSize').textContent = `(n=${n})`;
  
  document.getElementById('resultsContent').innerHTML = `
    <style>
      /* Reset any inherited Office Add-in styles */
      #resultsContent * {
        box-sizing: border-box;
      }
      
      #resultsContent input[type="radio"] {
        appearance: auto !important;
        -webkit-appearance: radio !important;
        -moz-appearance: radio !important;
        width: 18px !important;
        height: 18px !important;
      }
      
      #resultsContent label {
        background: none !important;
        border: none !important;
        padding: 0 !important;
      }
      
      /* Matching 0H0testHypothesis.html styles */
      .panel {
        background: #1a1f2e;
        border-radius: 10px;
        box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.4);
        border: 1px solid #2d3748;
        margin-bottom: 20px;
      }
      
      .panel-heading {
        background: transparent;
        color: rgb(255,165,120);
        padding: 12px 16px;
        font-weight: 600;
        font-size: 1.2rem;
        letter-spacing: 0.3px;
      }
      
      .panel-body {
        padding: 12px 16px;
      }
      
      .input-section {
        background: #242938 !important;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid #2d3748;
      }
      
      .input-section * {
        box-sizing: border-box;
      }
      
      .section-label {
        color: rgba(255,255,255,0.6);
        font-size: 0.85em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
        font-weight: bold;
      }
      
      .radio-option {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
      }
      
      .radio-option input[type="radio"] {
        cursor: pointer;
        width: 18px;
        height: 18px;
        accent-color: #007bff;
        background: transparent !important;
        margin: 0 !important;
      }
      
      .radio-option label {
        cursor: pointer;
        font-size: 14px;
        color: white !important;
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .radio-option.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      .radio-option.disabled input[type="radio"],
      .radio-option.disabled label {
        cursor: not-allowed;
      }
      
      .input-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .iterations-container {
        display: none;
      }
      
      .iterations-container.visible {
        display: flex;
      }
      
      .percentile-container {
        display: none;
      }
      
      .percentile-container.visible {
        display: flex;
      }
      
      input[type="number"], input[type="text"] {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        color: white;
        padding: 6px 10px;
        font-size: 13px;
      }
      
      input[type="number"]:focus, input[type="text"]:focus {
        outline: none;
        border-color: rgb(255,165,120);
        box-shadow: 0 0 5px rgba(255,165,120,0.3);
      }
      
      .run-button {
        width: 100%;
        padding: 12px 24px;
        background: linear-gradient(135deg, rgb(255,165,120), rgb(255,140,90));
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255,165,120,0.4);
      }
      
      .run-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255,165,120,0.6);
      }
      
      .run-button:active {
        transform: translateY(0);
      }
      
      .test-params-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .test-param-card {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
      }
      
      .param-label {
        font-size: 12px;
        color: rgba(255,255,255,0.6);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .param-icon {
        color: rgb(120,200,255);
        margin-right: 6px;
      }
      
      .param-value {
        font-size: 18px;
        font-weight: 600;
        color: white;
      }
      
      .stat-row {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 32px;
        margin-bottom: 20px;
      }
      
      .stat-box {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px;
        padding: 16px 24px;
        font-size: 14px;
        color: rgba(255,255,255,0.8);
      }
      
      .stat-box span {
        font-size: 20px;
        font-weight: 700;
        color: rgb(120,200,255);
        margin-left: 8px;
      }
      
      .diagnosis-container {
        text-align: center;
      }
      
      .diagnosis-title {
        font-size: 13px;
        color: rgba(255,255,255,0.6);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .diagnosis-icon {
        color: rgb(255,165,120);
        margin-right: 6px;
      }
      
      .decision-display {
        font-size: 20px;
        font-weight: 700;
        padding: 12px 24px;
        border-radius: 8px;
        border: 2px solid transparent;
      }
      
      .decision-display.awaiting {
        background: rgba(255,255,255,0.05);
        color: rgba(255,255,255,0.5);
        border-color: rgba(255,255,255,0.1);
      }
      
      .decision-display.reject {
        background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1));
        color: rgb(252,165,165);
        border-color: rgb(239,68,68);
        animation: pulse-reject 2s ease-in-out;
      }
      
      .decision-display.fail-reject {
        background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.1));
        color: rgb(134,239,172);
        border-color: rgb(34,197,94);
        animation: pulse-accept 2s ease-in-out;
      }
      
      @keyframes pulse-reject {
        0%, 100% { box-shadow: 0 0 0 rgba(239,68,68,0); }
        50% { box-shadow: 0 0 20px rgba(239,68,68,0.4); }
      }
      
      @keyframes pulse-accept {
        0%, 100% { box-shadow: 0 0 0 rgba(34,197,94,0); }
        50% { box-shadow: 0 0 20px rgba(34,197,94,0.4); }
      }
      
      .toggle-buttons {
        display: flex;
        gap: 10px;
      }
      
      .toggle-buttons button {
        background: linear-gradient(135deg, rgb(120,200,255), rgb(100,180,235));
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .toggle-buttons button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(120,200,255,0.4);
      }
    </style>
    
    <!-- INPUT PANEL -->
    <div class="panel" id="inputPanel">
      <div class="panel-heading">
        Hypothesis Test Configuration
      </div>
      <div class="panel-body">
        
        <!-- Row 1: Method and Parameter -->
        <div style="display: flex; gap: 12px; margin-bottom: 10px; flex-wrap: wrap;">
          <!-- Method Sub-Panel -->
          <div class="input-section" style="flex: 1; min-width: 300px; margin: 0;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span class="section-label" style="margin: 0;">Method:</span>
              <div class="radio-option">
                <input type="radio" id="methodClassical" name="method" value="classical" checked onchange="selectMethod('classical')">
                <label for="methodClassical">Classical</label>
              </div>
              <div class="radio-option">
                <input type="radio" id="methodBootstrap" name="method" value="bootstrap" onchange="selectMethod('bootstrap')">
                <label for="methodBootstrap">Bootstrap</label>
              </div>
              <div class="input-group iterations-container" id="iterationsContainer" style="margin: 0;">
                <label for="iterations" style="font-size: 14px; color: rgba(255,255,255,0.8);">Iterations:</label>
                <input type="number" id="iterations" value="500" min="100" max="10000" step="100" style="width: 80px;" onchange="updateIterations()">
              </div>
            </div>
          </div>
          
          <!-- Parameter Sub-Panel -->
          <div class="input-section" style="flex: 2; min-width: 400px; margin: 0;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span class="section-label" style="margin: 0;">Parameter:</span>
              <div class="radio-option">
                <input type="radio" id="paramMean" name="parameter" value="Mean" checked onchange="selectParameter('Mean')">
                <label for="paramMean">Mean</label>
              </div>
              <div class="radio-option">
                <input type="radio" id="paramVariance" name="parameter" value="Variance" onchange="selectParameter('Variance')">
                <label for="paramVariance">Variance</label>
              </div>
              <div class="radio-option" id="paramMedianContainer">
                <input type="radio" id="paramMedian" name="parameter" value="Median" onchange="selectParameter('Median')">
                <label for="paramMedian">Median</label>
              </div>
              
              <!-- Percentile with input box -->
              <div id="paramPercentileContainer" style="display: inline-flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 8px; border: 1px solid rgba(120,200,255,0.3); border-radius: 6px; background: rgba(120,200,255,0.05);">
                <div class="radio-option" style="margin: 0;">
                  <input type="radio" id="paramPercentile" name="parameter" value="Percentile" onchange="selectParameter('Percentile')">
                  <label for="paramPercentile">Percentile</label>
                </div>
                <div class="percentile-container" id="percentileContainer" style="margin: 0; position: relative; display: inline-block;">
                  <input type="number" id="percentileValue" min="1" max="99" step="1" value="50" onchange="updatePercentile()" style="width: 60px; padding-right: 20px; text-align: center;">
                  <span style="position: absolute; right: 6px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.6); font-size: 0.9em; pointer-events: none;">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Hypothesis (H₀ and H₁ on same row) -->
        <div style="display: flex; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; justify-content: center;">
          <!-- H0 Box -->
          <div style="display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(255,165,120,0.15), rgba(255,165,120,0.05)); border: 2px solid rgb(255,165,120); border-radius: 6px; padding: 6px 10px; box-shadow: 0 2px 8px rgba(255,165,120,0.3);">
            <label for="h0Value" style="font-weight: bold; white-space: nowrap; color: rgb(255,165,120); font-size: 1.05em;">
              H₀: <span id="h0ParamName">mean</span> =
            </label>
            <input type="text" id="h0Value" value="0" placeholder="0" onchange="updateH0Value()" style="width: 100px; font-size: 1.1em; font-weight: bold; border: 2px solid rgb(255,165,120); background: rgba(0,0,0,0.3); color: rgb(255,165,120); text-align: center;">
          </div>
          
          <!-- H1 Box -->
          <div style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, rgba(120,200,255,0.15), rgba(120,200,255,0.05)); border: 2px solid rgb(120,200,255); border-radius: 6px; padding: 6px 10px;">
            <label style="font-weight: bold; white-space: nowrap; color: rgb(120,200,255); font-size: 1.05em;">
              H₁: <span id="h1ParamName">mean</span>
            </label>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="radio-option" style="display: flex; align-items: center; gap: 5px;">
                <input type="radio" id="orientLeft" name="orientation" value="left" onchange="selectOrientation('left')">
                <label for="orientLeft" style="font-size: 1.1em; font-weight: bold; color: rgb(120,200,255);">
                  &lt; <span id="h1ValueLeft" style="color: rgb(255,165,120);">0</span>
                </label>
              </div>
              <div class="radio-option" style="display: flex; align-items: center; gap: 5px;">
                <input type="radio" id="orientTwo" name="orientation" value="two-sided" checked onchange="selectOrientation('two-sided')">
                <label for="orientTwo" style="font-size: 1.1em; font-weight: bold; color: rgb(120,200,255);">
                  ≠ <span id="h1ValueTwo" style="color: rgb(255,165,120);">0</span>
                </label>
              </div>
              <div class="radio-option" style="display: flex; align-items: center; gap: 5px;">
                <input type="radio" id="orientRight" name="orientation" value="right" onchange="selectOrientation('right')">
                <label for="orientRight" style="font-size: 1.1em; font-weight: bold; color: rgb(120,200,255);">
                  &gt; <span id="h1ValueRight" style="color: rgb(255,165,120);">0</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Run Button -->
        <button class="run-button" id="runTestButton" onclick="runHypothesisTest()">
          <i class="fa-solid fa-play" style="margin-right: 8px;"></i>Run the Test
        </button>

      </div>
    </div>

    <!-- RESULTS PANEL -->
    <div class="panel" id="resultsPanel" style="display: none;">
      <div class="panel-heading" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <span>Hypothesis Test Results</span>
        <div class="toggle-buttons">
          <button id="toggleVisualBtn" onclick="openVisualizationModal()" title="Display interactive chart showing the test distribution, critical values, rejection regions, and where your test statistic falls.">
            <i class="fa-solid fa-chart-line" style="margin-right: 5px;"></i>Visualize Test
          </button>
        </div>
      </div>
      <div class="panel-body" id="resultsPanelBody">
        <div class="test-params-container">
          <div class="test-param-card">
            <div class="param-label">
              <i class="fa-solid fa-flask param-icon"></i>Test Parameter
            </div>
            <div class="param-value" id="testParameter">--</div>
          </div>
          <div class="test-param-card">
            <div class="param-label">
              <i class="fa-solid fa-vial param-icon"></i>Test Type
            </div>
            <div class="param-value" id="testName">--</div>
          </div>
          <div class="test-param-card">
            <div class="param-label">
              <i class="fa-solid fa-random param-icon"></i>Test Orientation
            </div>
            <div class="param-value" id="testOrientation">--</div>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-box">
            Test Statistic: <span id="statValue">--</span>
          </div>
          <div class="stat-box">
            P-Value: <span id="pvalValue">--</span>
          </div>
        </div>

        <div class="decision-slider-row" style="position: relative; display: flex; align-items: center; justify-content: center; gap: 20px;">
          <div class="diagnosis-container" style="margin: 0;">
            <div class="diagnosis-title">
              <i class="fa-solid fa-gavel diagnosis-icon"></i>Test Decision
            </div>
            <div class="decision-display awaiting" id="decisionDisplay">Configure test above</div>
          </div>
        </div>

      </div>
    </div>
    
    <!-- Visualization Modal -->
    <div id="visualizationModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 10000; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
      <div style="background: #1a1f2e; border-radius: 12px; width: 90%; max-width: 1000px; max-height: 90vh; overflow: hidden; box-shadow: 0 10px 50px rgba(0,0,0,0.5); border: 1px solid #2d3748;">
        <div style="background: #0c1624; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2d3748;">
          <span style="color: rgb(255,165,120); font-size: 18px; font-weight: 600;">
            <i class="fa-solid fa-chart-line" style="margin-right: 10px;"></i>
            Hypothesis Test Visualization
          </span>
          <button onclick="closeVisualizationModal()" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0; line-height: 1; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
            ×
          </button>
        </div>
        <div style="padding: 20px; max-height: calc(90vh - 70px); overflow-y: auto;">
          <div id="chartContainer" style="width: 100%; height: 500px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; color: rgba(255,255,255,0.6);">
              <i class="fa-solid fa-chart-line" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
              <div style="font-size: 16px; margin-bottom: 8px;">Chart will be rendered here</div>
              <div style="font-size: 13px; opacity: 0.7;">(Plotly integration coming next)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Initialize
  updateMethodVisibility();
  updateParameterLabels();
}

/**
 * Select test method
 */
function selectMethod(method) {
  currentTestMethod = method;
  updateMethodVisibility();
}

/**
 * Update method visibility (iterations for bootstrap, median/percentile for bootstrap)
 */
function updateMethodVisibility() {
  const isBootstrap = currentTestMethod === 'bootstrap';
  
  // Show/hide iterations
  const iterContainer = document.getElementById('iterationsContainer');
  if (iterContainer) {
    iterContainer.classList.toggle('visible', isBootstrap);
  }
  
  // Enable/disable median and percentile
  const medianContainer = document.getElementById('paramMedianContainer');
  const percentileContainer = document.getElementById('paramPercentileContainer');
  const medianRadio = document.getElementById('paramMedian');
  const percentileRadio = document.getElementById('paramPercentile');
  
  if (isBootstrap) {
    if (medianContainer) medianContainer.classList.remove('disabled');
    if (percentileContainer) percentileContainer.style.opacity = '1';
    if (medianRadio) medianRadio.disabled = false;
    if (percentileRadio) percentileRadio.disabled = false;
  } else {
    if (medianContainer) medianContainer.classList.add('disabled');
    if (percentileContainer) percentileContainer.style.opacity = '0.4';
    if (medianRadio) medianRadio.disabled = true;
    if (percentileRadio) percentileRadio.disabled = true;
    
    // Reset to mean if median or percentile was selected
    if (currentTestParameter === 'Median' || currentTestParameter === 'Percentile') {
      document.getElementById('paramMean').checked = true;
      selectParameter('Mean');
    }
  }
}

/**
 * Select test parameter
 */
function selectParameter(param) {
  currentTestParameter = param;
  updateParameterLabels();
  
  // Show percentile input when percentile is selected
  const percentileInput = document.getElementById('percentileContainer');
  if (percentileInput) {
    percentileInput.classList.toggle('visible', param === 'Percentile');
  }
}

/**
 * Select orientation
 */
function selectOrientation(orientation) {
  currentTestOrientation = orientation;
}

/**
 * Update H0 value
 */
function updateH0Value() {
  const input = document.getElementById('h0Value');
  currentH0Value = parseFloat(input.value) || 0;
  updateParameterLabels();
}

/**
 * Update iterations
 */
function updateIterations() {
  const input = document.getElementById('iterations');
  bootstrapIterations = parseInt(input.value) || 500;
}

/**
 * Update percentile
 */
function updatePercentile() {
  // Just trigger parameter label update
  updateParameterLabels();
}

/**
 * Update parameter labels (H0 and H1)
 */
function updateParameterLabels() {
  const paramNames = {
    'Mean': 'mean',
    'Variance': 'variance',
    'Median': 'median',
    'Percentile': 'percentile'
  };
  
  const paramName = paramNames[currentTestParameter] || 'parameter';
  
  const h0ParamName = document.getElementById('h0ParamName');
  const h1ParamName = document.getElementById('h1ParamName');
  const h1ValueLeft = document.getElementById('h1ValueLeft');
  const h1ValueTwo = document.getElementById('h1ValueTwo');
  const h1ValueRight = document.getElementById('h1ValueRight');
  
  if (h0ParamName) h0ParamName.textContent = paramName;
  if (h1ParamName) h1ParamName.textContent = paramName;
  if (h1ValueLeft) h1ValueLeft.textContent = currentH0Value;
  if (h1ValueTwo) h1ValueTwo.textContent = currentH0Value;
  if (h1ValueRight) h1ValueRight.textContent = currentH0Value;
}

/**
 * Run hypothesis test
 */
function runHypothesisTest() {
  if (!resultsData || !resultsData.rawData) {
    console.warn('No data available for hypothesis testing');
    return;
  }
  
  console.log('🧪 Running hypothesis test:', {
    method: currentTestMethod,
    parameter: currentTestParameter,
    orientation: currentTestOrientation,
    h0: currentH0Value
  });
  
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
  
  if (currentTestParameter === 'Mean') {
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
    
    testName = `One-sample t-test`;
    
  } else if (currentTestParameter === 'Variance') {
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
    
    testName = `Chi-square test`;
  }
  
  return { testStat, pValue, critValue, testName, df };
}

/**
 * Bootstrap hypothesis test
 */
function runBootstrapTest() {
  const data = resultsData.rawData;
  const n = data.length;
  const iterations = bootstrapIterations;
  
  // Calculate observed statistic
  let observedStat;
  if (currentTestParameter === 'Mean') {
    observedStat = data.reduce((a, b) => a + b, 0) / n;
  } else if (currentTestParameter === 'Median') {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    observedStat = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  } else if (currentTestParameter === 'Variance') {
    const mean = data.reduce((a, b) => a + b, 0) / n;
    observedStat = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  } else if (currentTestParameter === 'Percentile') {
    const percentileValue = parseInt(document.getElementById('percentileValue').value) || 50;
    const sorted = [...data].sort((a, b) => a - b);
    const index = (n - 1) * (percentileValue / 100);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    observedStat = sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
  
  // Shift data to H0
  const shiftedData = data.map(x => x - (observedStat - currentH0Value));
  
  // Bootstrap resampling
  const bootstrapStats = [];
  for (let i = 0; i < iterations; i++) {
    const sample = [];
    for (let j = 0; j < n; j++) {
      sample.push(shiftedData[Math.floor(Math.random() * n)]);
    }
    
    let stat;
    if (currentTestParameter === 'Mean') {
      stat = sample.reduce((a, b) => a + b, 0) / n;
    } else if (currentTestParameter === 'Median') {
      const sorted = [...sample].sort((a, b) => a - b);
      const mid = Math.floor(n / 2);
      stat = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    } else if (currentTestParameter === 'Variance') {
      const mean = sample.reduce((a, b) => a + b, 0) / n;
      stat = sample.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    } else if (currentTestParameter === 'Percentile') {
      const percentileValue = parseInt(document.getElementById('percentileValue').value) || 50;
      const sorted = [...sample].sort((a, b) => a - b);
      const index = (n - 1) * (percentileValue / 100);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      stat = sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    bootstrapStats.push(stat);
  }
  
  // Calculate p-value
  bootstrapStats.sort((a, b) => a - b);
  let pValue;
  
  if (currentTestOrientation === 'two-sided') {
    const countLower = bootstrapStats.filter(s => s <= currentH0Value - Math.abs(observedStat - currentH0Value)).length;
    const countUpper = bootstrapStats.filter(s => s >= currentH0Value + Math.abs(observedStat - currentH0Value)).length;
    pValue = (countLower + countUpper) / iterations;
  } else if (currentTestOrientation === 'left') {
    pValue = bootstrapStats.filter(s => s <= observedStat).length / iterations;
  } else {
    pValue = bootstrapStats.filter(s => s >= observedStat).length / iterations;
  }
  
  const testStat = observedStat;
  const testName = `Bootstrap test`;
  const critValue = null;
  const df = null;
  
  return { testStat, pValue, critValue, testName, df };
}

/**
 * Display test results
 */
function displayTestResults(results) {
  const { testStat, pValue, critValue, testName, df } = results;
  
  // Show results panel
  const resultsPanel = document.getElementById('resultsPanel');
  if (resultsPanel) {
    resultsPanel.style.display = 'block';
  }
  
  // Update test parameter cards
  document.getElementById('testParameter').textContent = currentTestParameter;
  document.getElementById('testName').textContent = testName + (df ? ` (df=${df})` : '');
  document.getElementById('testOrientation').textContent = 
    currentTestOrientation === 'two-sided' ? 'Two-tailed' : 
    currentTestOrientation === 'left' ? 'Left-tailed' : 'Right-tailed';
  
  // Update statistics
  document.getElementById('statValue').textContent = testStat.toFixed(4);
  document.getElementById('pvalValue').textContent = pValue.toFixed(6);
  
  // Update decision
  const decision = pValue < currentAlpha ? 'Reject H₀' : 'Do not reject H₀';
  const decisionClass = pValue < currentAlpha ? 'reject' : 'fail-reject';
  const decisionDisplay = document.getElementById('decisionDisplay');
  
  decisionDisplay.textContent = decision;
  decisionDisplay.className = 'decision-display ' + decisionClass;
  
  // Store results for visualization
  window.currentTestResults = results;
  
  console.log('✅ Test results displayed:', { testStat, pValue, decision });
}

/**
 * Open visualization modal
 */
function openVisualizationModal() {
  const modal = document.getElementById('visualizationModal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
    
    console.log('📊 Opening visualization modal');
    console.log('Test results:', window.currentTestResults);
  }
}

/**
 * Close visualization modal
 */
function closeVisualizationModal() {
  const modal = document.getElementById('visualizationModal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// Close modal when clicking outside
if (typeof document !== 'undefined') {
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('visualizationModal');
    if (modal && e.target === modal) {
      closeVisualizationModal();
    }
  });
}
