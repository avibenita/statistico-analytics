# Responsive Layout System

A robust CSS/JS framework ensuring all Statistico views fit perfectly without scrolling on standard displays (1920x1080 and 14" laptops).

## 🎯 Features

- ✅ **No Scrolling**: Guaranteed fit on 1920x1080 and 14" screens
- ✅ **Flexbox-based**: Modern, flexible layout system
- ✅ **Consistent Styling**: Unified design across all views
- ✅ **Auto-adjustment**: Detects and fixes overflow automatically
- ✅ **Compact Components**: Space-optimized UI elements
- ✅ **Debug Mode**: Built-in layout debugging tools

## 📦 Quick Start

### 1. Include in HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Other dependencies -->
  
  <!-- Add Responsive Layout System -->
  <link rel="stylesheet" href="./responsive-layout.css">
  <script src="./responsive-layout.js"></script>
</head>
```

### 2. Use Responsive Classes

```html
<body>
  <statistico-header></statistico-header>
  
  <!-- Main Container -->
  <div class="responsive-container">
    
    <!-- Panel with auto-sizing -->
    <div class="responsive-panel">
      <div class="responsive-panel-body">
        
        <!-- Your content sections -->
        <div class="flex-row flex-shrink-0">
          <!-- Fixed height content (cards, controls) -->
        </div>
        
        <!-- Chart/Main content area (fills remaining space) -->
        <div class="responsive-chart-container">
          <div id="chart"></div>
        </div>
        
        <!-- Fixed height footer -->
        <div class="compact-info-box flex-shrink-0">
          <i class="fas fa-info-circle"></i>
          Your info text here
        </div>
        
      </div>
    </div>
  </div>
</body>
```

## 🎨 CSS Classes

### Layout Classes

| Class | Purpose |
|-------|---------|
| `.responsive-container` | Main container (auto-sized to viewport) |
| `.responsive-panel` | Content panel with flex layout |
| `.responsive-panel-body` | Panel body with proper spacing |
| `.responsive-chart-container` | Auto-sized chart/content area |

### Flex Utilities

| Class | Purpose |
|-------|---------|
| `.flex-row` | Horizontal flex container |
| `.flex-column` | Vertical flex container |
| `.flex-center` | Center content (both axes) |
| `.flex-grow` | Fill available space |
| `.flex-shrink-0` | Don't shrink (fixed size) |

### Spacing Utilities

| Class | Purpose |
|-------|---------|
| `.mt-xs`, `.mt-sm`, `.mt-md` | Margin top (2px, 4px, 8px) |
| `.mb-xs`, `.mb-sm`, `.mb-md` | Margin bottom |
| `.my-xs`, `.my-sm`, `.my-md` | Margin vertical |
| `.pt-xs`, `.pt-sm` | Padding top |
| `.pb-xs`, `.pb-sm` | Padding bottom |

### Component Classes

| Class | Purpose |
|-------|---------|
| `.compact-card` | Compact card with hover effect |
| `.compact-card-label` | Card label text |
| `.compact-card-value` | Card value (emphasized) |
| `.compact-input` | Compact input field |
| `.compact-select` | Compact select dropdown |
| `.compact-button` | Compact button |
| `.compact-info-box` | Info/note box with icon |

## 🔧 JavaScript API

### Basic Usage

```javascript
// Auto-initialized on DOM load

// Force re-calculation
ResponsiveLayout.calculateOptimalLayout();

// Get layout metrics
const metrics = ResponsiveLayout.getMetrics();
console.log(metrics);

// Enable debug mode
ResponsiveLayout.enableDebug();
```

### Advanced Usage

```javascript
// Wait for specific element
ResponsiveLayout.waitForElement('#chart')
  .then(element => {
    console.log('Chart ready:', element);
  });

// Make element compact
ResponsiveLayout.makeCompact('#my-element');

// Force layout to fit (emergency)
ResponsiveLayout.forceLayoutFit();

// Log detailed metrics
ResponsiveLayout.logMetrics();
```

### Global Shortcut

```javascript
// Quick access via window.RL
RL.logMetrics();
RL.enableDebug();
```

## 📐 Layout Structure

The system uses a flex-based hierarchy:

```
body (100vh, overflow: hidden)
└── responsive-container (calc(100vh - 52px))
    └── responsive-panel (flex: 1)
        └── responsive-panel-body (flex column)
            ├── Fixed sections (flex-shrink: 0)
            │   ├── Cards/Stats
            │   ├── Controls
            │   └── Inputs
            ├── Chart area (flex: 1) ← Fills remaining space
            └── Footer (flex-shrink: 0)
                └── Info/Notes
```

## 🎯 Design Principles

1. **Viewport-based**: Everything sized relative to viewport
2. **Flex-first**: Use flexbox for automatic sizing
3. **Fixed + Fluid**: Fixed-size controls + fluid chart area
4. **No overflow**: Strict `overflow: hidden` on body
5. **Compact spacing**: Minimal margins (2-8px)
6. **Responsive fonts**: Relative sizing (0.7em - 1.2em)

## 🔍 Debugging

### Enable Debug Mode

```javascript
ResponsiveLayout.enableDebug();
```

This will:
- Add red outline to body
- Log metrics every second
- Warn if scrolling detected
- Show detailed layout info

### Check Metrics

```javascript
const metrics = ResponsiveLayout.getMetrics();
// {
//   viewport: { width: 1920, height: 1080 },
//   document: { width: 1920, height: 1080 },
//   hasVerticalScroll: false,
//   hasHorizontalScroll: false
// }
```

### Common Issues

**Problem**: Content overflows vertically

**Solution**:
1. Add `flex-shrink-0` to fixed sections
2. Remove explicit heights from flex children
3. Use `responsive-chart-container` for main content
4. Call `ResponsiveLayout.calculateOptimalLayout()`

**Problem**: Chart doesn't resize

**Solution**:
1. Ensure chart is in `.responsive-chart-container`
2. Chart library must support dynamic sizing
3. Call chart.reflow() or chart.resize() after layout changes

## 📊 CSS Variables

Customize via CSS variables:

```css
:root {
  --header-height: 52px;
  --container-padding-vertical: 4px;
  --container-padding-horizontal: 12px;
  --spacing-xs: 2px;
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --font-xs: 0.7em;
  --font-sm: 0.75em;
  --font-md: 0.85em;
}
```

## 🌐 Browser Support

- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Office.js WebView (EdgeHTML/Chromium)

## 📝 Migration Guide

### From Existing Layout

1. **Replace container classes**:
   ```html
   <!-- Before -->
   <div class="container">
   
   <!-- After -->
   <div class="responsive-container">
   ```

2. **Wrap content in responsive panel**:
   ```html
   <div class="responsive-panel">
     <div class="responsive-panel-body">
       <!-- Your content -->
     </div>
   </div>
   ```

3. **Mark fixed-size sections**:
   ```html
   <div class="my-cards flex-shrink-0">
     <!-- Cards, controls, etc. -->
   </div>
   ```

4. **Use chart container for main content**:
   ```html
   <div class="responsive-chart-container">
     <div id="chart"></div>
   </div>
   ```

5. **Include the CSS/JS**:
   ```html
   <link rel="stylesheet" href="./responsive-layout.css">
   <script src="./responsive-layout.js"></script>
   ```

## 🚀 Examples

See these files for complete examples:
- `cumulative-distribution.html` - Full implementation
- `hypothesis-standalone.html` - Complex multi-section layout
- `normality-standalone.html` - Cards + charts layout

## 📄 License

Part of Statistico Analytics Suite
© 2026 - Internal Use
