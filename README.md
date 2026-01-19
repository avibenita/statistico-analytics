# Statistico Analytics Hub

[![Build Status](https://github.com/yourusername/statistico-analytics/workflows/Build%20and%20Deploy/badge.svg)](https://github.com/yourusername/statistico-analytics/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Guided Workflows for Statistical Analysis - Excel Add-in & Web Platform**

A modular, extensible platform for statistical analysis featuring multiple analysis modules with a unified user interface and shared component library. **Now with Office.js support for Excel add-ins using Dialog API for full-screen results!**

![Analytics Hub Screenshot](docs/images/hub-screenshot.png)

## 🎯 Features

- **🔷 Office.js Excel Add-in** (NEW!)
  - Taskpane integration (320px+ optimized)
  - Office Dialog API for full-screen results
  - Direct Excel data access
  - Export results to worksheets
  - Deploy via GitHub Pages (HTTPS)

- **7 Statistical Analysis Modules**
  - Univariate Analysis
  - Correlations
  - Regression Analysis
  - Logistic Regression
  - Factor Analysis
  - Independent Comparisons
  - Dependent Comparisons

- **Unified Architecture**
  - Shared CSS/JS components
  - Consistent UI/UX across all modules
  - Reusable data handling
  - Common input panel with 3 data options
  - Standardized results popup

- **Developer-Friendly**
  - Modular ES6 JavaScript
  - Template-based module creation
  - Comprehensive documentation
  - GitHub Actions CI/CD

## 📁 Project Structure

```
statistico-analytics/
├── src/
│   ├── shared/              # Shared components
│   │   ├── css/             # Common styles
│   │   ├── js/              # Shared JavaScript
│   │   │   ├── core/        # Core utilities
│   │   │   ├── components/  # Reusable components
│   │   │   └── analytics/   # Base analytics class
│   │   └── assets/          # Images, icons
│   ├── modules/             # Analysis modules
│   │   ├── univariate/
│   │   ├── correlations/
│   │   ├── regression/
│   │   └── ...
│   ├── hub/                 # Landing page
│   └── templates/           # Module templates
├── docs/                    # Documentation
├── tests/                   # Test files
├── build/                   # Build scripts
└── .github/                 # GitHub Actions
```

## 🚀 Quick Start

### For Excel Add-in Development

See **[OFFICE-JS-DEPLOYMENT.md](OFFICE-JS-DEPLOYMENT.md)** for complete Office.js setup!

**Quick steps:**
1. Push to GitHub, enable GitHub Pages
2. Update `manifest.xml` with your GitHub URL  
3. Sideload add-in in Excel
4. Start building modules!

### For Web Development

**Prerequisites:**
- Node.js >= 16.0.0
- npm >= 8.0.0

**Installation:**

```bash
# Clone the repository
git clone https://github.com/yourusername/statistico-analytics.git
cd statistico-analytics

# Install dependencies
npm install

# Start development server
npm start
```

The hub will open at `http://localhost:8080`

## 🛠️ Development

### Creating a New Module

1. **Copy the template:**
```bash
cp -r src/templates src/modules/my-module
cd src/modules/my-module
```

2. **Rename files:**
```bash
mv module-template.html my-module.html
mv module-template.js my-module.js
```

3. **Customize the module:**
   - Update `ModuleNameAnalysis` class name
   - Implement `validateInputs()` method
   - Implement `performAnalysis()` method
   - Implement `displayResults()` method

4. **Update the hub:**
   - Add module card to `src/hub/index.html`

See [Module Creation Guide](docs/module-creation.md) for details.

### Shared Components

#### InputPanel Component
```javascript
import { InputPanel } from '../../shared/js/components/InputPanel.js';

const inputPanel = new InputPanel('inputPanelContainer', {
  allowMultipleSelection: true,
  minSelection: 2,
  maxSelection: 10
});
inputPanel.initialize();
```

#### ResultsPopup Component
```javascript
import { ResultsPopup } from '../../shared/js/components/ResultsPopup.js';

const resultsPopup = new ResultsPopup({
  title: 'Analysis Results',
  showDropdown: true
});
resultsPopup.initialize();
resultsPopup.setContent('<div>Your results here</div>');
resultsPopup.open();
```

#### BaseAnalyticsModule
```javascript
import { BaseAnalyticsModule } from '../../shared/js/analytics/base-analytics.js';

class MyAnalysis extends BaseAnalyticsModule {
  constructor() {
    super('My Analysis Module');
  }

  validateInputs() {
    // Validation logic
    return { valid: true, errors: [] };
  }

  async performAnalysis() {
    // Analysis logic
    return results;
  }

  displayResults(results) {
    // Display logic
  }
}
```

### Building

```bash
# Build all
npm run build

# Build specific parts
npm run build:shared
npm run build:modules
npm run build:hub
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage
```

### Linting

```bash
# Lint JavaScript
npm run lint

# Lint CSS
npm run lint:css

# Auto-fix
npm run lint:fix
```

## 📖 Documentation

### Office.js (Excel Add-in)
- **[Office.js Deployment Guide](OFFICE-JS-DEPLOYMENT.md)** - Start here for Excel add-in!
- **[Office.js Setup](docs/OFFICE-JS-SETUP.md)** - Complete setup instructions

### General Development
- [Development Guide](docs/development-guide.md)
- [Module Creation Guide](docs/module-creation.md)
- [Migration Guide](docs/migration-guide.md)
- [Getting Started](GETTING-STARTED.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `hotfix/*` - Critical fixes

## 📝 Coding Standards

- Use ES6+ modules
- Follow Airbnb JavaScript Style Guide
- Write JSDoc comments for public APIs
- Maintain test coverage above 70%
- Use semantic commit messages

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
- ✅ Lints code
- ✅ Runs tests
- ✅ Builds all modules
- ✅ Deploys to GitHub Pages (main branch)
- ✅ Creates releases on version tags

## 📦 Release Process

```bash
# Update version (updates package.json, creates tag)
npm version patch  # or minor, major

# Push with tags
git push && git push --tags
```

GitHub Actions will automatically create a release with build artifacts.

## 🐛 Troubleshooting

### Module not loading?
- Check browser console for errors
- Verify file paths are correct
- Ensure shared components are loaded first

### Styles not applying?
- Clear browser cache
- Check CSS import order
- Verify CSS variables are defined

### Data not loading?
- Check sessionStorage has `analysisData`
- Verify data format matches expected structure
- Check console for data handler messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- D3.js for data visualization
- Highcharts for interactive charts
- Font Awesome for icons

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/statistico-analytics](https://github.com/yourusername/statistico-analytics)

---

**Built with ❤️ for the statistics community**
