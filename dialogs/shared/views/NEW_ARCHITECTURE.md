# STATISTICO VIEW ARCHITECTURE
## Proper HTML-Based Structure for All Analysis Views

## 🎯 THE PROBLEM

**Current Approach (Broken):**
- JavaScript files generate HTML via `innerHTML`
- Inconsistent structure across views
- No separation of concerns
- Hard to maintain and debug
- Script injection issues
- No browser caching

## ✅ THE SOLUTION

**New Approach (Proper):**
- Each view is a **complete HTML file**
- Separate CSS for view-specific styles
- Separate JS for view-specific logic
- Shared CSS and utilities for common functionality
- Clean, maintainable, consistent

---

## 🏗️ DIRECTORY STRUCTURE

```
dialogs/
├── shared/
│   ├── css/
│   │   ├── statistico-base.css        # Base theme, colors, typography
│   │   ├── statistico-scrollbars.css  # Scrollbar styling
│   │   ├── statistico-responsive.css  # Responsive breakpoints
│   │   └── statistico-components.css  # Shared components (tables, panels)
│   │
│   └── js/
│       ├── statistico-utils.js        # Shared utilities (format, calculations)
│       └── statistico-api.js          # Office API integration
│
└── views/
    ├── histogram/
    │   ├── histogram.html             # Complete HTML structure
    │   ├── histogram.css              # View-specific styles
    │   └── histogram.js               # View-specific logic
    │
    ├── boxplot/
    │   ├── boxplot.html
    │   ├── boxplot.css
    │   └── boxplot.js
    │
    ├── confidence-interval/
    │   ├── confidence-interval.html
    │   ├── confidence-interval.css
    │   └── confidence-interval.js
    │
    ├── hypothesis-testing/
    │   ├── hypothesis-testing.html
    │   ├── hypothesis-testing.css
    │   └── hypothesis-testing.js
    │
    ├── normality/
    │   ├── normality.html
    │   ├── normality.css
    │   └── normality.js
    │
    ├── outliers/
    │   ├── outliers.html
    │   ├── outliers.css
    │   └── outliers.js
    │
    ├── qqplot/
    │   ├── qqplot.html
    │   ├── qqplot.css
    │   └── qqplot.js
    │
    └── kernel/
        ├── kernel.html
        ├── kernel.css
        └── kernel.js
```

---

## 📄 FILE STRUCTURE

### 1. HTML File (e.g., `histogram.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Histogram Analysis - Statistico</title>
  
  <!-- SHARED CSS -->
  <link rel="stylesheet" href="../shared/css/statistico-base.css">
  <link rel="stylesheet" href="../shared/css/statistico-scrollbars.css">
  <link rel="stylesheet" href="../shared/css/statistico-responsive.css">
  <link rel="stylesheet" href="../shared/css/statistico-components.css">
  
  <!-- VIEW-SPECIFIC CSS -->
  <link rel="stylesheet" href="./histogram.css">
  
  <!-- EXTERNAL LIBRARIES -->
  <script src="https://code.highcharts.com/highcharts.js"></script>
  
  <!-- SHARED UTILITIES -->
  <script src="../shared/js/statistico-utils.js"></script>
  <script src="../shared/js/statistico-api.js"></script>
</head>
<body>
  <!-- HEADER -->
  <header class="statistico-header">
    <h1 id="analysisTitle">Interactive Histogram</h1>
    <p id="variableInfo"><span id="variableName">--</span> <span id="sampleSize">(n=0)</span></p>
  </header>
  
  <!-- MAIN CONTENT -->
  <main id="resultsContent" class="statistico-content">
    <!-- View-specific content here -->
  </main>
  
  <!-- FOOTER -->
  <footer class="statistico-footer">
    <button onclick="closeView()">Close</button>
  </footer>
  
  <!-- VIEW-SPECIFIC JAVASCRIPT -->
  <script src="./histogram.js"></script>
</body>
</html>
```

### 2. CSS File (e.g., `histogram.css`)

```css
/**
 * HISTOGRAM VIEW - Specific Styles
 * Only styles unique to this view
 */

.histogram-panel {
  background: var(--surface-1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.histogram-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

#histogram-chart {
  min-height: 400px;
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .histogram-controls {
    flex-direction: column;
  }
}
```

### 3. JavaScript File (e.g., `histogram.js`)

```javascript
/**
 * HISTOGRAM VIEW - Logic
 * Only logic specific to this view
 */

// Global state
let histogramChart = null;
let currentData = [];

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Histogram view loaded');
  initializeControls();
  
  // Listen for data from Office
  if (window.receiveData) {
    window.receiveData = handleDataReceived;
  }
});

// Handle data received from Office
function handleDataReceived(data) {
  currentData = data.values || [];
  updateStatistics(data.descriptive);
  createHistogram();
}

// View-specific functions
function initializeControls() {
  document.getElementById('numBins').addEventListener('change', updateHistogram);
  document.getElementById('showNormalCurve').addEventListener('change', updateHistogram);
  // ... more event listeners
}

function updateStatistics(stats) {
  document.getElementById('stat-count').textContent = stats.n;
  document.getElementById('stat-mean').textContent = formatNumber(stats.mean, 2);
  // ... more updates
}

function createHistogram() {
  // Histogram creation logic specific to this view
  histogramChart = Highcharts.chart('histogram-chart', {
    // ... chart options
  });
}

function updateHistogram() {
  // Update logic
}

// Close view
function closeView() {
  if (typeof Office !== 'undefined') {
    Office.context.ui.messageParent('close');
  }
}
```

---

## 📦 SHARED FILES

### `statistico-base.css`

```css
/**
 * BASE STYLES - Used by ALL views
 * Theme, colors, typography, basic layout
 */

:root {
  /* Colors */
  --surface-0: #0c1624;
  --surface-1: #1a1f2e;
  --surface-2: #242938;
  --border: #2d3748;
  --accent-1: rgb(255,165,120);
  --accent-2: rgb(120,200,255);
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.8);
  --text-muted: rgba(255,255,255,0.6);
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--surface-0);
  color: var(--text-primary);
}

.statistico-header {
  background: var(--surface-1);
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.statistico-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

.statistico-footer {
  background: var(--surface-1);
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  text-align: right;
}

/* Buttons */
button {
  background: var(--accent-2);
  color: var(--text-primary);
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  opacity: 0.9;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
}
```

### `statistico-scrollbars.css`

```css
/**
 * SCROLLBAR STYLES - Consistent across ALL views
 */

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(120,200,255,0.5) rgba(255,255,255,0.1);
}

/* Webkit (Chrome, Edge, Safari) */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.08);
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(120,200,255,0.4);
  border-radius: 6px;
  border: 2px solid rgba(26,31,46,1);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(120,200,255,0.6);
}
```

### `statistico-responsive.css`

```css
/**
 * RESPONSIVE BREAKPOINTS - Apply to ALL views
 */

/* 14" and up - Full display */
@media (min-height: 800px) {
  .statistico-content {
    max-height: calc(100vh - 180px);
  }
}

/* 13" laptops */
@media (max-height: 800px) {
  .statistico-content {
    max-height: calc(100vh - 150px);
  }
}

/* Smaller displays */
@media (max-height: 700px) {
  .statistico-content {
    max-height: calc(100vh - 120px);
    padding: 12px;
  }
  
  .statistico-header {
    padding: 12px;
  }
  
  .statistico-footer {
    padding: 8px 12px;
  }
}

/* Mobile/tablet */
@media (max-height: 600px) {
  .statistico-content {
    max-height: calc(100vh - 100px);
    padding: 8px;
  }
  
  .statistico-header h1 {
    font-size: 1.2rem;
  }
}
```

### `statistico-utils.js`

```javascript
/**
 * SHARED UTILITIES - Used by ALL views
 */

// Format number with decimals
function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '--';
  return parseFloat(value).toFixed(decimals);
}

// Calculate mean
function calculateMean(data) {
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

// Calculate standard deviation
function calculateStdDev(data, mean) {
  if (!data || data.length < 2) return 0;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
  return Math.sqrt(variance);
}

// More shared utilities...
```

---

## 🔄 MIGRATION PLAN

### Phase 1: Create Shared Files
1. Create `shared/css/` directory
2. Extract common CSS to shared files
3. Create `shared/js/` directory
4. Extract common utilities

### Phase 2: Convert Each View
For each view (start with Histogram):
1. Create `views/[view-name]/` directory
2. Create `[view-name].html` with complete structure
3. Extract view-specific CSS to `[view-name].css`
4. Convert `[view-name]-view.js` to standalone `[view-name].js`
5. Test independently
6. Update main navigation to point to new HTML file

### Phase 3: Cleanup
1. Remove old `-view.js` files
2. Remove redundant inline styles
3. Update documentation
4. Test all views

---

## ✅ BENEFITS

1. **Separation of Concerns** - HTML, CSS, JS properly separated
2. **Consistency** - Shared styles ensure uniform look
3. **Maintainability** - Easy to update one view without affecting others
4. **Performance** - Browser caching of shared files
5. **Debugging** - Easier to debug complete HTML files
6. **Independence** - Each view works standalone
7. **Testability** - Can test views independently

---

## 🎯 NEXT STEPS

1. Review this architecture
2. Create shared CSS files
3. Create shared JS utilities
4. Convert Histogram view as proof of concept
5. Apply to remaining views

---

**Ready to implement?** Say "yes" and I'll start with the shared files and Histogram conversion!
