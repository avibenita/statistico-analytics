# 🚀 Getting Started with Statistico Analytics

Welcome! This guide will help you get up and running quickly.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Your First Module](#your-first-module)
3. [Understanding the Structure](#understanding-the-structure)
4. [Next Steps](#next-steps)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

This opens the Analytics Hub at `http://localhost:8080`

### 3. Explore the Hub

Click on any module card to see it in action. Try:
- **Univariate Analysis**: See the template in action
- **Hub Page**: The beautiful landing page
- **Shared Components**: Used across all modules

## Your First Module

Let's create a simple "T-Test" module in 5 minutes!

### Step 1: Copy Template

```bash
cd src/modules
mkdir t-test
cp ../templates/module-template.html t-test/t-test.html
cp ../templates/module-template.js t-test/t-test.js
```

### Step 2: Update HTML

Edit `t-test.html`:

```html
<!-- Change title -->
<title>T-Test - Statistico Analytics</title>

<!-- Update header -->
<h1>
  <i class="fa fa-chart-bar"></i>
  T-Test Analysis
</h1>

<!-- Update import -->
<script type="module">
  import { TTestAnalysis } from './t-test.js';
  
  document.addEventListener('DOMContentLoaded', () => {
    const module = new TTestAnalysis();
    module.initialize();
    window.analysisModule = module;
  });
</script>
```

### Step 3: Update JavaScript

Edit `t-test.js`:

```javascript
import { BaseAnalyticsModule } from '../../shared/js/analytics/base-analytics.js';
import { dataHandler } from '../../shared/js/core/data-handler.js';
import { validateVariableSelection } from '../../shared/js/core/validation.js';

export class TTestAnalysis extends BaseAnalyticsModule {
  constructor() {
    super('T-Test Analysis', {
      inputPanelId: 'inputPanel',
      errorContainerId: 'errorContainer',
      showResultsInPopup: true
    });
  }

  getInputPanelConfig() {
    return {
      allowMultipleSelection: true,
      minSelection: 2,
      maxSelection: 2  // Exactly 2 variables for t-test
    };
  }

  validateInputs() {
    const errors = [];
    const selectedVars = this.inputPanel.getSelectedVariables();
    
    if (selectedVars.length !== 2) {
      errors.push('Please select exactly 2 variables');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  async performAnalysis() {
    const [var1Name, var2Name] = this.inputPanel.getSelectedVariables();
    const group1 = dataHandler.getVariable(var1Name);
    const group2 = dataHandler.getVariable(var2Name);
    
    // Simple t-test calculation
    const mean1 = group1.reduce((a, b) => a + b) / group1.length;
    const mean2 = group2.reduce((a, b) => a + b) / group2.length;
    
    return {
      variables: [var1Name, var2Name],
      mean1,
      mean2,
      difference: mean1 - mean2,
      // Add more stats here
      timestamp: new Date().toISOString()
    };
  }

  displayResults(results) {
    const html = `
      <div class="results-section">
        <div class="results-section-title">
          <i class="fa fa-chart-bar"></i>
          T-Test Results
        </div>
        <div class="table-wrap">
          <table>
            <tr>
              <td><strong>Group 1 (${results.variables[0]}):</strong></td>
              <td>${this.formatNumber(results.mean1)}</td>
            </tr>
            <tr>
              <td><strong>Group 2 (${results.variables[1]}):</strong></td>
              <td>${this.formatNumber(results.mean2)}</td>
            </tr>
            <tr>
              <td><strong>Difference:</strong></td>
              <td>${this.formatNumber(results.difference)}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
    
    this.resultsPopup.setTitle('T-Test Results');
    this.resultsPopup.setContent(html);
    this.resultsPopup.open();
  }
}
```

### Step 4: Add to Hub

Edit `src/hub/index.html`, add this card:

```html
<div class="module-card" onclick="navigateTo('t-test')">
  <div class="module-icon">
    <i class="fa fa-chart-bar"></i>
  </div>
  <h2 class="module-title">T-Test</h2>
  <p class="module-description">
    Compare means of two independent groups.
  </p>
  <ul class="module-features">
    <li><i class="fa fa-check"></i> Independent samples</li>
    <li><i class="fa fa-check"></i> Mean comparison</li>
    <li><i class="fa fa-check"></i> Statistical significance</li>
  </ul>
</div>
```

And update the navigation:

```javascript
const moduleUrls = {
  // ... existing
  't-test': '../modules/t-test/t-test.html'
};
```

### Step 5: Test It!

1. Refresh the hub (`http://localhost:8080`)
2. Click on your new T-Test card
3. Load some data (use browser console to inject test data)
4. Select 2 variables
5. Click "Run Analysis"
6. See results in popup!

**Congratulations! 🎉** You just created your first module!

## Understanding the Structure

### The Big Picture

```
┌─────────────────────────────────────────────┐
│           Analytics Hub (Landing)           │
│         src/hub/index.html                  │
└──────────────┬──────────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼─────┐    ┌─────▼─────┐
│  Module 1 │    │  Module 2 │
│           │    │           │
│ Extends   │    │ Extends   │
│ BaseClass │    │ BaseClass │
└─────┬─────┘    └─────┬─────┘
      │                │
      └────────┬────────┘
               │
    ┌──────────▼──────────┐
    │  Shared Components  │
    │  - InputPanel       │
    │  - ResultsPopup     │
    │  - DataHandler      │
    │  - Utils            │
    └─────────────────────┘
```

### Key Concepts

#### 1. BaseAnalyticsModule

The foundation for all modules. Provides:
- ✅ Data handling
- ✅ Input panel management
- ✅ Results popup
- ✅ VB6 communication
- ✅ Error handling

**You implement:**
- `validateInputs()` - Check if inputs are valid
- `performAnalysis()` - Do your calculations
- `displayResults()` - Show results

#### 2. InputPanel Component

Handles:
- ✅ Variable selection
- ✅ Data source options
- ✅ Selection validation
- ✅ Cross-frame communication

**You configure:**
```javascript
getInputPanelConfig() {
  return {
    minSelection: 1,      // Minimum variables
    maxSelection: 10,     // Maximum variables
    allowMultipleSelection: true
  };
}
```

#### 3. ResultsPopup Component

Features:
- ✅ Modal display
- ✅ Tabbed content
- ✅ Further analysis dropdown
- ✅ Responsive design

**You use:**
```javascript
this.resultsPopup.setTitle('My Results');
this.resultsPopup.setContent('<div>...</div>');
this.resultsPopup.open();
```

#### 4. DataHandler

Singleton for data management:

```javascript
import { dataHandler } from '../shared/js/core/data-handler.js';

// Load data
dataHandler.loadFromSessionStorage();

// Get variable data
const values = dataHandler.getVariable('income');

// Get all data
const allData = dataHandler.getAllData();

// Get selected variables
const selected = dataHandler.getSelectedFromInputsXL();
```

### File Structure

```
your-module/
├── your-module.html    # Main HTML page
├── your-module.js      # Module logic (extends BaseAnalyticsModule)
└── your-module.css     # Module-specific styles (optional)
```

**HTML imports:**
```html
<!-- Shared CSS -->
<link rel="stylesheet" href="../../shared/css/main.css" />
<link rel="stylesheet" href="../../shared/css/input-panel.css" />
<link rel="stylesheet" href="../../shared/css/results-popup.css" />

<!-- Module-specific CSS (if needed) -->
<link rel="stylesheet" href="./your-module.css" />
```

**JavaScript imports:**
```javascript
// Base class
import { BaseAnalyticsModule } from '../../shared/js/analytics/base-analytics.js';

// Core utilities
import { dataHandler } from '../../shared/js/core/data-handler.js';
import { formatNumber } from '../../shared/js/core/utils.js';
import { validateVariableSelection } from '../../shared/js/core/validation.js';
```

## Next Steps

### Learn More

1. **[Development Guide](docs/development-guide.md)** - Deep dive into architecture
2. **[Module Creation Guide](docs/module-creation.md)** - Complete walkthrough
3. **[API Reference](docs/api-reference.md)** - All classes and methods
4. **[Migration Guide](docs/migration-guide.md)** - Migrate existing modules

### Try These

- [ ] Modify the T-Test module to calculate actual t-statistic
- [ ] Add a chart to the results using D3.js
- [ ] Create a new module from scratch
- [ ] Add tests for your module
- [ ] Explore the shared components code

### Get Help

- 📖 **Documentation**: Check the `/docs` folder
- 💬 **Issues**: Open an issue on GitHub
- 🎯 **Examples**: Look at existing modules in `/src/modules`
- 🧪 **Tests**: See `/tests` for examples

## Common Tasks

### Add a new module
```bash
npm run create-module my-module  # (if script exists)
# or manually copy template
```

### Run tests
```bash
npm test
```

### Build for production
```bash
npm run build
```

### Lint code
```bash
npm run lint
```

### Start server
```bash
npm start
```

## Tips for Success

1. **Start Small**: Get basic structure working before adding complexity
2. **Use the Template**: Don't start from scratch
3. **Console Log**: Add lots of console.log() during development
4. **Test Often**: Test in browser after each change
5. **Read Examples**: Look at existing modules
6. **Ask Questions**: Open issues on GitHub

## Troubleshooting

### Module doesn't load?
- Check browser console for errors
- Verify import paths
- Ensure files are saved

### InputPanel not showing?
- Check `inputPanelId` in constructor
- Verify container div exists
- Call `this.inputPanel.initialize()`

### Results not displaying?
- Check `this.resultsPopup` exists
- Verify HTML is valid
- Check for JavaScript errors

### Still stuck?
- Review the [Development Guide](docs/development-guide.md)
- Check existing module implementations
- Open an issue on GitHub

---

**Happy Coding! 🎉**

Ready to build amazing analytics modules!
