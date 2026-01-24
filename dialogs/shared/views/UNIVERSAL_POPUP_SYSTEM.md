# STATISTICO UNIVERSAL POPUP SYSTEM
## Robust Layout Management for ALL Dialogs

## 🎯 CRITICAL PRINCIPLES

1. **Maximum Display on 14" Screens** - Content fits without scrolling
2. **Automatic Scrolling** - Vertical scrollbar appears on smaller displays

---

## 📁 SYSTEM FILES

### `universal-popup-styles.css`
Comprehensive CSS framework for all popups

### `universal-popup-utility.js`
JavaScript helper utility for easy implementation

---

## 🏗️ ARCHITECTURE

### Container Structure
```
┌─────────────────────────────────────┐
│ statistico-popup-container          │ ← Viewport-based height
│ ┌─────────────────────────────────┐ │
│ │ popup-fixed-section              │ │ ← Config/Controls (never scrolls)
│ │ (flex-shrink: 0)                 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ popup-scroll-section             │ │ ← Results/Charts (scrolls)
│ │ (flex: 1, overflow-y: auto)      │ │
│ │                                  │ │
│ │  [Scrollbar appears here]        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🚀 QUICK START

### Method 1: Using JavaScript Utility

```javascript
// In your view's displayFunction()
function displayMyView() {
  document.getElementById('resultsContent').innerHTML = `
    <link rel="stylesheet" href="./shared/views/universal-popup-styles.css">
    <script src="./shared/views/universal-popup-utility.js"></script>
    
    <!-- Your HTML here -->
    <div id="configPanel">...</div>
    <div id="resultsPanel">...</div>
  `;
  
  // Initialize after DOM is ready
  setTimeout(() => {
    StatisticoPopup.applyStructure(
      '#resultsContent',      // Container
      '#configPanel',         // Fixed section
      '#resultsPanel'         // Scroll section
    );
  }, 100);
}
```

### Method 2: Using CSS Classes Directly

```html
<div id="resultsContent" class="statistico-popup-container">
  <div class="popup-fixed-section">
    <!-- Configuration Panel -->
    <div class="panel">...</div>
  </div>
  
  <div class="popup-scroll-section">
    <!-- Results Panel -->
    <div class="panel">...</div>
  </div>
</div>
```

---

## 📏 RESPONSIVE BEHAVIOR

### Height Breakpoints

| Screen Height | Container Height | Behavior |
|--------------|------------------|----------|
| ≥ 800px | `calc(100vh - 180px)` | Full display |
| < 800px | `calc(100vh - 150px)` | Compact spacing |
| < 700px | `calc(100vh - 120px)` | More compact + compact-mode class |
| < 600px | `calc(100vh - 100px)` | Ultra-compact |

### Automatic Adjustments

**At < 700px height:**
- Panel margins reduce
- Heading padding shrinks
- Font sizes decrease
- `compact-mode` class added automatically

---

## 🎨 SCROLLBAR STYLING

### Specifications
- **Width:** 12px (highly visible)
- **Color:** Cyan (`rgba(120,200,255,...)`) matching brand
- **Thumb:** Minimum 40px height, rounded corners
- **Track:** Semi-transparent background
- **Browser Support:** Webkit (Chrome, Edge, Safari) + Firefox

### CSS Implementation
```css
.popup-scroll-section::-webkit-scrollbar {
  width: 12px !important;
}

.popup-scroll-section::-webkit-scrollbar-thumb {
  background: rgba(120,200,255,0.4) !important;
  border-radius: 6px !important;
}

/* Firefox */
.popup-scroll-section {
  scrollbar-width: thin !important;
  scrollbar-color: rgba(120,200,255,0.5) rgba(255,255,255,0.1) !important;
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### For Each Popup View:

- [ ] Add CSS link: `<link rel="stylesheet" href="./shared/views/universal-popup-styles.css">`
- [ ] Add JS script: `<script src="./shared/views/universal-popup-utility.js"></script>`
- [ ] Identify fixed section (config/controls)
- [ ] Identify scroll section (results/charts)
- [ ] Call `StatisticoPopup.applyStructure()` after DOM ready
- [ ] Test on different screen heights (800px, 700px, 600px)
- [ ] Verify scrollbar appears when needed
- [ ] Check compact mode activates correctly

---

## 🔧 API REFERENCE

### StatisticoPopup.applyStructure(container, fixed, scroll)

Apply universal layout to existing structure.

**Parameters:**
- `container` (string): Selector for main container
- `fixed` (string): Selector for fixed section
- `scroll` (string): Selector for scroll section

**Example:**
```javascript
StatisticoPopup.applyStructure(
  '#resultsContent',
  '#inputPanel',
  '#resultsPanel'
);
```

### StatisticoPopup.init(containerId, options)

Full initialization with options.

**Parameters:**
- `containerId` (string): Main container element ID
- `options` (object):
  - `fixedSections` (array): Array of selectors for fixed sections
  - `scrollSections` (array): Array of selectors for scroll sections

**Example:**
```javascript
StatisticoPopup.init('resultsContent', {
  fixedSections: ['#configPanel', '#controlsPanel'],
  scrollSections: ['#resultsPanel', '#chartsPanel']
});
```

### StatisticoPopup.checkCompactMode()

Manually check and apply compact mode based on viewport height.

### StatisticoPopup.refreshScroll()

Force scroll section to update (useful after dynamic content changes).

### StatisticoPopup.getRecommendedHeights()

Get recommended height allocation for fixed and scroll sections.

**Returns:**
```javascript
{
  fixed: 300,      // Recommended height for fixed section
  scroll: 500,     // Recommended height for scroll section
  total: 800       // Total available height
}
```

---

## 📂 VIEWS TO UPDATE

### ✅ Completed
- [x] hypothesis-testing-view.js
- [x] confidence-interval-view.js
- [x] histogram-view.js
- [x] boxplot-view.js
- [x] qqplot-view.js
- [x] normality-view.js
- [x] outliers-view.js
- [x] kernel-view.js

**All views updated with universal popup system! 🎉**

---

## 🐛 DEBUGGING

### Enable Debug Mode

Uncomment in `universal-popup-styles.css`:

```css
.statistico-popup-container {
  outline: 2px solid red !important;
}

.popup-fixed-section {
  outline: 2px solid blue !important;
}

.popup-scroll-section {
  outline: 2px solid green !important;
}
```

### Common Issues

**Scrollbar not appearing:**
1. Check if `popup-scroll-section` class is applied
2. Verify content height exceeds container
3. Check for conflicting `overflow` CSS
4. Use `StatisticoPopup.refreshScroll()`

**Layout not responsive:**
1. Ensure CSS file is loaded
2. Check for conflicting max-height rules
3. Verify flexbox is not disabled
4. Test `StatisticoPopup.checkCompactMode()`

---

## 💡 BEST PRACTICES

1. **Keep Fixed Section Compact** - Max 40% of viewport
2. **Use Semantic IDs** - e.g., `#configPanel`, `#resultsPanel`
3. **Test Multiple Heights** - 600px, 700px, 800px, 1080px
4. **Avoid Nested Scrolling** - Only one scroll section per popup
5. **Leverage Compact Mode** - Design for graceful degradation

---

## 📊 PERFORMANCE

- **CSS:** < 10KB (minified)
- **JS:** < 5KB (minified)
- **Load Time:** < 50ms
- **Memory:** Negligible
- **Reflow:** Optimized with `flex` layout

---

## 🔮 FUTURE ENHANCEMENTS

- [ ] Horizontal scrolling support
- [ ] Touch gesture optimization
- [ ] Accessibility improvements (ARIA)
- [ ] Dark/Light theme variants
- [ ] Custom scrollbar colors per view
- [ ] Animation transitions
- [ ] Sticky headers within scroll sections

---

## 📞 SUPPORT

For issues or questions, contact the Statistico development team.

**Last Updated:** 2026-01-24  
**Version:** 1.0.0  
**Status:** Production Ready ✅
