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
      <div class="qqplot-controls">
        <div class="control-row">
          <div class="control-group">
            <label>Plot Type:</label>
            <div class="btn-group">
              <button id="btnQQ" class="plot-type-btn active" onclick="switchPlotType('qq')">
                <i class="fa-solid fa-chart-line"></i> QQ Plot
              </button>
              <button id="btnPP" class="plot-type-btn" onclick="switchPlotType('pp')">
                <i class="fa-solid fa-chart-scatter"></i> PP Plot
              </button>
            </div>
          </div>
          <div class="control-group">
            <label for="distributionSelect">Distribution:</label>
            <select id="distributionSelect" onchange="switchDistribution()">
              <option value="normal" selected>Normal</option>
              <option value="exponential">Exponential</option>
              <option value="uniform">Uniform</option>
              <option value="lognormal">Log-Normal</option>
              <option value="gamma">Gamma</option>
            </select>
          </div>
        </div>
      </div>
      
      <div id="qqplot-chart"></div>
      
      <div id="detrended-chart"></div>
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
  
  document.getElementById('btnQQ').classList.toggle('active', type === 'qq');
  document.getElementById('btnPP').classList.toggle('active', type === 'pp');
  
  createQQPPPlots();
}

/**
 * Switch theoretical distribution
 */
function switchDistribution() {
  currentDistribution = document.getElementById('distributionSelect').value;
  createQQPPPlots();
}

/**
 * Calculate theoretical quantiles/probabilities based on selected distribution
 */
function getTheoreticalValues(sortedData, distribution, plotType) {
  const n = sortedData.length;
  const theoretical = [];
  const empirical = [];
  
  for (let i = 0; i < n; i++) {
    const p = (i + 0.5) / n;
    empirical.push(sortedData[i]);
    
    let theoreticalValue;
    
    if (plotType === 'qq') {
      switch(distribution) {
        case 'normal':
          theoreticalValue = jStat.normal.inv(p, 0, 1);
          break;
        case 'exponential':
          theoreticalValue = jStat.exponential.inv(p, 1);
          break;
        case 'uniform':
          theoreticalValue = jStat.uniform.inv(p, 0, 1);
          break;
        case 'lognormal':
          theoreticalValue = jStat.lognormal.inv(p, 0, 1);
          break;
        case 'gamma':
          theoreticalValue = jStat.gamma.inv(p, 2, 1);
          break;
        default:
          theoreticalValue = jStat.normal.inv(p, 0, 1);
      }
      theoretical.push(theoreticalValue);
    } else {
      const mean = sortedData.reduce((a, b) => a + b, 0) / n;
      const std = Math.sqrt(sortedData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n);
      const standardized = (sortedData[i] - mean) / std;
      
      switch(distribution) {
        case 'normal':
          theoreticalValue = jStat.normal.cdf(standardized, 0, 1);
          break;
        case 'exponential':
          theoreticalValue = jStat.exponential.cdf(Math.abs(standardized), 1);
          break;
        case 'uniform':
          theoreticalValue = jStat.uniform.cdf(standardized, -3, 3);
          break;
        case 'lognormal':
          theoreticalValue = sortedData[i] > 0 ? jStat.lognormal.cdf(sortedData[i], 0, 1) : 0;
          break;
        case 'gamma':
          theoreticalValue = sortedData[i] > 0 ? jStat.gamma.cdf(sortedData[i], 2, 1) : 0;
          break;
        default:
          theoreticalValue = jStat.normal.cdf(standardized, 0, 1);
      }
      theoretical.push(theoreticalValue);
      empirical[i] = p;
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
  
  if (currentPlotType === 'qq' && currentDistribution !== 'normal') {
    const mean = sortedData.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(sortedData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n);
    for (let i = 0; i < n; i++) {
      sortedData[i] = (sortedData[i] - mean) / std;
    }
  }
  
  const { theoretical, empirical } = getTheoreticalValues(sortedData, currentDistribution, currentPlotType);
  
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
