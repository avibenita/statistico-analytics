# Shared Analysis Views

These view modules are **shared across all analysis modules** (Univariate, Regression, Correlation, etc.).

## 📦 Available Views

| View | File | Used By | Description |
|------|------|---------|-------------|
| **Histogram** | `histogram-view.js` | Univariate, Regression (residuals) | Interactive histogram with binning methods |
| **Box Plot** | `boxplot-view.js` | Univariate, Regression (residuals) | Box plots with outlier detection |
| **QQ/PP Plot** | `qqplot-view.js` | Univariate, Regression (residuals) | Normality diagnostics |
| **Normality Tests** | `normality-view.js` | Univariate, Regression | Statistical normality tests |
| **Kernel Density** | `kernel-view.js` | Univariate | Smooth density estimation |

## 🔧 How to Use

### In Your Results Dialog HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load shared CSS -->
  <link rel="stylesheet" href="shared/css/results-dialog.css">
  
  <!-- Load Highcharts -->
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/highcharts-more.js"></script>
  
  <!-- Load jStat for statistics -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jstat/1.9.4/jstat.min.js"></script>
  
  <!-- Load shared view modules -->
  <script src="shared/views/histogram-view.js"></script>
  <script src="shared/views/boxplot-view.js"></script>
  <script src="shared/views/qqplot-view.js"></script>
  <script src="shared/views/normality-view.js"></script>
  <script src="shared/views/kernel-view.js"></script>
</head>
<body>
  <!-- Your dialog content -->
  <div id="resultsContent"></div>
  
  <script>
    // Set global resultsData
    window.resultsData = {
      rawData: [/* your data */],
      descriptive: {/* stats */},
      column: "Variable Name",
      n: 100
    };
    
    // Call any view
    displayHistogramView();
    // or displayBoxPlotView();
    // or displayQQPlotView();
    // etc.
  </script>
</body>
</html>
```

## 📋 Requirements

Each view expects a global `resultsData` object with:

```javascript
window.resultsData = {
  rawData: Array,        // Raw numeric data
  descriptive: {         // Descriptive statistics
    mean: Number,
    stdDev: Number,
    min: Number,
    q1: Number,
    median: Number,
    q3: Number,
    max: Number,
    variance: Number,
    skewness: Number,
    kurtosis: Number,
    range: Number
  },
  column: String,        // Variable name
  n: Number,             // Sample size
  dataSource: String     // Optional: data source
};
```

## 🎨 Theming

All views support light/dark themes via CSS class on `<body>`:

```javascript
// Light theme (default)
document.body.classList.remove('theme-dark');

// Dark theme
document.body.classList.add('theme-dark');
```

## 🔄 Adding New Modules

When creating new analysis modules (e.g., regression, correlation):

1. **Reuse existing views** - Don't duplicate!
2. **Load shared CSS** - Use `shared/css/results-dialog.css`
3. **Load required views** - Only load what you need
4. **Set resultsData** - Ensure global data is available
5. **Call display function** - e.g., `displayHistogramView()`

## ✅ Benefits of Shared Structure

- ✅ **No code duplication** - One source of truth
- ✅ **Consistent UX** - Same look/feel across modules
- ✅ **Easy maintenance** - Update once, all modules benefit
- ✅ **Smaller files** - Each module ~200-400 lines
- ✅ **Parallel loading** - Browser loads modules simultaneously
- ✅ **Better caching** - Shared files cached once
