/**
 * QQ/PP Plot View - Shared Analysis Component
 * 
 * Can be used by: Univariate, Regression (residuals analysis), any module needing distribution fit testing
 * 
 * Requirements:
 * - Global variable: resultsData { rawData, descriptive, column, n }
 * - Highcharts library must be loaded
 * - jStat library must be loaded
 * 
 * Exports:
 * - displayQQPlotView() - Main display function
 * - switchPlotType() - Toggle between QQ and PP plots
 * - switchDistribution() - Change theoretical distribution
 */

let currentPlotType = 'qq';
let currentDistribution = 'normal';
let qqppChart = null;

/**
 * Display QQ/PP plot view with distribution selection
 */
function displayQQPlotView() {
  const { column, n } = resultsData;
  
  document.getElementById('variableName').textContent = column || 'Variable';
  document.getElementById('sampleSize').textContent = `(n=${n})`;
  
  const content = document.getElementById('resultsContent');
  content.innerHTML = `
    <div class="qqplot-container">
      <!-- Centered, Prominent Controls -->
      <div class="qqplot-controls-header">
        <div class="plot-type-selector">
          <div class="selector-label">Plot Type</div>
          <div class="radio-group">
            <label class="radio-option active" id="radioQQ">
              <input type="radio" name="plotType" value="qq" checked onchange="switchPlotType('qq')">
              <span class="radio-label">
                <i class="fa-solid fa-chart-line"></i>
                <strong>QQ Plot</strong>
                <small>Quantile-Quantile</small>
              </span>
            </label>
            <label class="radio-option" id="radioPP">
              <input type="radio" name="plotType" value="pp" onchange="switchPlotType('pp')">
              <span class="radio-label">
                <i class="fa-solid fa-chart-scatter"></i>
                <strong>PP Plot</strong>
                <small>Probability-Probability</small>
              </span>
            </label>
          </div>
        </div>
        
        <div class="distribution-selector">
          <label for="distributionSelect" class="selector-label">Theoretical Distribution</label>
          <select id="distributionSelect" class="distribution-select" onchange="switchDistribution()">
            <option value="normal" selected>📊 Normal</option>
            <option value="exponential">📉 Exponential</option>
            <option value="uniform">📏 Uniform</option>
            <option value="lognormal">📈 Log-Normal</option>
            <option value="gamma">🎲 Gamma</option>
          </select>
        </div>
      </div>
      
      <!-- Main Chart Panel -->
      <div class="chart-panel" id="mainChartPanel">
        <div class="panel-header">
          <h3 id="chartTitle">QQ Plot - Normal Distribution</h3>
        </div>
        <div id="qqplot-chart" class="chart-container"></div>
      </div>
      
      <!-- Detrended Chart Panel -->
      <div class="chart-panel" id="detrendedChartPanel">
        <div class="panel-header">
          <h3>Detrended Plot</h3>
        </div>
        <div id="detrended-chart" class="chart-container"></div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    createQQPPPlots();
  }, 100);
}

/**
 * Switch between QQ and PP plots
 */
function switchPlotType(type) {
  currentPlotType = type;
  
  document.getElementById('radioQQ').classList.toggle('active', type === 'qq');
  document.getElementById('radioPP').classList.toggle('active', type === 'pp');
  
  // Update panel styling
  const mainPanel = document.getElementById('mainChartPanel');
  mainPanel.className = 'chart-panel ' + (type === 'qq' ? 'qq-panel' : 'pp-panel');
  
  // Update chart title
  updateChartTitle();
  
  createQQPPPlots();
}

/**
 * Switch theoretical distribution
 */
function switchDistribution() {
  currentDistribution = document.getElementById('distributionSelect').value;
  updateChartTitle();
  createQQPPPlots();
}

/**
 * Update chart title based on current plot type and distribution
 */
function updateChartTitle() {
  const plotTypeLabel = currentPlotType.toUpperCase();
  const distLabel = currentDistribution.charAt(0).toUpperCase() + currentDistribution.slice(1);
  const titleEl = document.getElementById('chartTitle');
  if (titleEl) {
    titleEl.textContent = `${plotTypeLabel} Plot - ${distLabel} Distribution`;
  }
}

/**
 * Calculate theoretical quantiles/probabilities based on selected distribution
 */
function getTheoreticalValues(sortedData, distribution, plotType, mean, std) {
  const n = sortedData.length;
  const theoretical = [];
  const empirical = [];
  
  for (let i = 0; i < n; i++) {
    const p = (i + 0.5) / n;
    
    let theoreticalValue;
    
    if (plotType === 'qq') {
      // For QQ plots: theoretical quantiles on x-axis, sample quantiles (raw data) on y-axis
      empirical.push(sortedData[i]); // Raw data values
      
      switch(distribution) {
        case 'normal':
          // Scale theoretical quantile to match data mean and std
          theoreticalValue = jStat.normal.inv(p, mean, std);
          break;
        case 'exponential':
          // Fit exponential using lambda = 1/mean
          const lambda = mean > 0 ? 1 / mean : 1;
          theoreticalValue = jStat.exponential.inv(p, lambda);
          break;
        case 'uniform':
          // Fit uniform to data range
          const dataMin = Math.min(...sortedData);
          const dataMax = Math.max(...sortedData);
          theoreticalValue = jStat.uniform.inv(p, dataMin, dataMax);
          break;
        case 'lognormal':
          // Fit lognormal using log-transformed statistics
          const logMean = Math.log(mean);
          const logStd = Math.sqrt(Math.log(1 + (std * std) / (mean * mean)));
          theoreticalValue = jStat.lognormal.inv(p, logMean, logStd);
          break;
        case 'gamma':
          // Fit gamma using method of moments
          const shape = (mean * mean) / (std * std);
          const scale = (std * std) / mean;
          theoreticalValue = jStat.gamma.inv(p, shape, scale);
          break;
        default:
          theoreticalValue = jStat.normal.inv(p, mean, std);
      }
      theoretical.push(theoreticalValue);
      
    } else {
      // For PP plots: theoretical probabilities on x-axis, empirical probabilities on y-axis
      empirical.push(p); // Empirical probability
      
      switch(distribution) {
        case 'normal':
          theoreticalValue = jStat.normal.cdf(sortedData[i], mean, std);
          break;
        case 'exponential':
          const lambda2 = mean > 0 ? 1 / mean : 1;
          theoreticalValue = jStat.exponential.cdf(sortedData[i], lambda2);
          break;
        case 'uniform':
          const dataMin2 = Math.min(...sortedData);
          const dataMax2 = Math.max(...sortedData);
          theoreticalValue = jStat.uniform.cdf(sortedData[i], dataMin2, dataMax2);
          break;
        case 'lognormal':
          const logMean2 = Math.log(mean);
          const logStd2 = Math.sqrt(Math.log(1 + (std * std) / (mean * mean)));
          theoreticalValue = sortedData[i] > 0 ? jStat.lognormal.cdf(sortedData[i], logMean2, logStd2) : 0;
          break;
        case 'gamma':
          const shape2 = (mean * mean) / (std * std);
          const scale2 = (std * std) / mean;
          theoreticalValue = sortedData[i] > 0 ? jStat.gamma.cdf(sortedData[i], shape2, scale2) : 0;
          break;
        default:
          theoreticalValue = jStat.normal.cdf(sortedData[i], mean, std);
      }
      theoretical.push(theoreticalValue);
    }
  }
  
  return { theoretical, empirical };
}

/**
 * Create both QQ/PP plot and detrended plot
 */
function createQQPPPlots() {
  if (!resultsData || !resultsData.rawData) return;
  
  const sortedData = [...resultsData.rawData].sort((a, b) => a - b);
  const n = sortedData.length;
  
  // Calculate statistics for fitting theoretical distribution
  const mean = sortedData.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(sortedData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n);
  
  const { theoretical, empirical } = getTheoreticalValues(sortedData, currentDistribution, currentPlotType, mean, std);
  
  const plotData = theoretical.map((t, i) => [t, empirical[i]]);
  
  const detrendedData = theoretical.map((t, i) => [t, empirical[i] - t]);
  
  const minVal = Math.min(...theoretical, ...empirical);
  const maxVal = Math.max(...theoretical, ...empirical);
  const referenceLine = [[minVal, minVal], [maxVal, maxVal]];
  
  const textColor = document.body.classList.contains('theme-dark') ? '#ffffff' : '#1e293b';
  const gridColor = document.body.classList.contains('theme-dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  const plotTypeLabel = currentPlotType.toUpperCase();
  const distLabel = currentDistribution.charAt(0).toUpperCase() + currentDistribution.slice(1);
  
  if (qqppChart) qqppChart.destroy();
  
  qqppChart = Highcharts.chart('qqplot-chart', {
    chart: {
      backgroundColor: 'transparent',
      height: null,
      reflow: true
    },
    title: {
      text: `${plotTypeLabel} Plot - ${distLabel} Distribution`,
      style: { color: textColor, fontSize: '14px', fontWeight: 600 }
    },
    xAxis: {
      title: { text: `Theoretical ${plotTypeLabel === 'QQ' ? 'Quantiles' : 'Probabilities'}`, style: { color: textColor } },
      labels: { style: { color: textColor } },
      gridLineColor: gridColor
    },
    yAxis: {
      title: { text: `Sample ${plotTypeLabel === 'QQ' ? 'Quantiles' : 'Probabilities'}`, style: { color: textColor } },
      labels: { style: { color: textColor } },
      gridLineColor: gridColor
    },
    legend: {
      enabled: true,
      itemStyle: { color: textColor }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      style: { color: '#ffffff' },
      shared: false
    },
    plotOptions: {
      scatter: { marker: { radius: 3 } },
      line: { marker: { enabled: false }, lineWidth: 2 }
    },
    series: [
      {
        name: 'Data Points',
        type: 'scatter',
        data: plotData,
        color: '#3b82f6',
        tooltip: {
          pointFormat: 'Theoretical: {point.x:.3f}<br/>Sample: {point.y:.3f}'
        }
      },
      {
        name: 'Reference Line (y=x)',
        type: 'line',
        data: referenceLine,
        color: '#e74c3c',
        dashStyle: 'Dash',
        enableMouseTracking: false
      }
    ]
  });
  
  Highcharts.chart('detrended-chart', {
    chart: {
      backgroundColor: 'transparent',
      height: null,
      reflow: true
    },
    title: {
      text: `Detrended ${plotTypeLabel} Plot`,
      style: { color: textColor, fontSize: '14px', fontWeight: 600 }
    },
    xAxis: {
      title: { text: `Theoretical ${plotTypeLabel === 'QQ' ? 'Quantiles' : 'Probabilities'}`, style: { color: textColor } },
      labels: { style: { color: textColor } },
      gridLineColor: gridColor
    },
    yAxis: {
      title: { text: 'Deviation from Reference', style: { color: textColor } },
      labels: { style: { color: textColor } },
      gridLineColor: gridColor,
      plotLines: [{
        value: 0,
        color: '#e74c3c',
        width: 2,
        dashStyle: 'Dash',
        zIndex: 5
      }]
    },
    legend: {
      enabled: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      style: { color: '#ffffff' },
      pointFormat: 'Theoretical: {point.x:.3f}<br/>Deviation: {point.y:.3f}'
    },
    plotOptions: {
      scatter: { marker: { radius: 3 } }
    },
    series: [
      {
        type: 'scatter',
        data: detrendedData,
        color: '#9b59b6'
      }
    ]
  });
}
