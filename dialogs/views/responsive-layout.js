/**
 * Responsive Layout Manager for Statistico Views
 * Ensures views fit perfectly without scrolling
 * Provides utilities for dynamic layout adjustments
 * 
 * Usage: Include after responsive-layout.css
 * <script src="./responsive-layout.js"></script>
 */

const ResponsiveLayout = {
  // Configuration
  config: {
    headerHeight: 52,
    minChartHeight: 280,
    targetViewportHeight: 1080,
    targetViewportWidth: 1920,
    debugMode: false
  },
  
  /**
   * Initialize responsive layout
   * Call this on page load or after DOM ready
   */
  init() {
    console.log('🎨 ResponsiveLayout: Initializing...');
    
    // Apply responsive classes
    this.applyResponsiveClasses();
    
    // Setup viewport monitoring
    this.setupViewportMonitoring();
    
    // Setup resize handler
    this.setupResizeHandler();
    
    // Initial layout calculation
    this.calculateOptimalLayout();
    
    console.log('✅ ResponsiveLayout: Initialized');
  },
  
  /**
   * Apply responsive classes to common elements
   */
  applyResponsiveClasses() {
    // Find container and apply class
    const container = document.querySelector('.container, [class*="container"]');
    if (container && !container.classList.contains('responsive-container')) {
      container.classList.add('responsive-container');
    }
    
    // Find panels and apply classes
    const panels = document.querySelectorAll('.panel, [class*="panel"]');
    panels.forEach(panel => {
      if (!panel.classList.contains('responsive-panel')) {
        panel.classList.add('responsive-panel');
      }
    });
    
    if (this.config.debugMode) {
      console.log('📦 Applied responsive classes to', panels.length, 'panels');
    }
  },
  
  /**
   * Setup viewport size monitoring
   */
  setupViewportMonitoring() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Log viewport info
    console.log(`📐 Viewport: ${viewport.width}x${viewport.height}`);
    
    // Check if scrolling might occur
    const bodyHeight = document.body.scrollHeight;
    const hasScroll = bodyHeight > viewport.height;
    
    if (hasScroll) {
      console.warn(`⚠️ Content overflow detected: ${bodyHeight}px > ${viewport.height}px`);
      this.adjustForOverflow();
    } else {
      console.log('✅ No scrolling detected - layout fits perfectly');
    }
    
    // Store in data attribute for CSS access
    document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    document.documentElement.style.setProperty('--viewport-width', `${viewport.width}px`);
  },
  
  /**
   * Setup window resize handler
   */
  setupResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.calculateOptimalLayout();
        this.setupViewportMonitoring();
      }, 250);
    });
  },
  
  /**
   * Calculate optimal layout based on viewport
   */
  calculateOptimalLayout() {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate available space for content
    const availableHeight = viewportHeight - this.config.headerHeight;
    
    // Find chart containers and set optimal height
    const chartContainers = document.querySelectorAll(
      '#chart-container, .chart-container, .responsive-chart-container, [class*="chart"]'
    );
    
    chartContainers.forEach(container => {
      // Calculate space taken by siblings
      const parent = container.parentElement;
      if (!parent) return;
      
      const siblings = Array.from(parent.children).filter(child => child !== container);
      const siblingsHeight = siblings.reduce((total, sibling) => {
        return total + sibling.offsetHeight;
      }, 0);
      
      // Set optimal height
      const optimalHeight = Math.max(
        availableHeight - siblingsHeight - 20, // 20px buffer
        this.config.minChartHeight
      );
      
      container.style.height = `${optimalHeight}px`;
      
      if (this.config.debugMode) {
        console.log(`📊 Chart height set to: ${optimalHeight}px`);
      }
    });
  },
  
  /**
   * Adjust layout when overflow is detected
   */
  adjustForOverflow() {
    console.log('🔧 Adjusting layout to prevent overflow...');
    
    // Reduce padding and margins progressively
    const adjustments = [
      { selector: '.responsive-container', property: 'padding', value: '2px 8px' },
      { selector: '.responsive-panel-body', property: 'padding', value: '3px 8px' },
      { selector: '.compact-card', property: 'padding', value: '3px 6px' },
      { selector: '.compact-info-box', property: 'padding', value: '3px 6px' }
    ];
    
    adjustments.forEach(adj => {
      const elements = document.querySelectorAll(adj.selector);
      elements.forEach(el => {
        el.style[adj.property] = adj.value;
      });
    });
    
    // Recalculate after adjustments
    setTimeout(() => {
      this.setupViewportMonitoring();
    }, 100);
  },
  
  /**
   * Force layout to fit viewport (emergency measure)
   */
  forceLayoutFit() {
    console.log('🚨 Forcing layout to fit viewport...');
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    const container = document.querySelector('.responsive-container');
    if (container) {
      container.style.maxHeight = `calc(100vh - ${this.config.headerHeight}px)`;
      container.style.overflow = 'hidden';
    }
  },
  
  /**
   * Get current layout metrics
   */
  getMetrics() {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      document: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      },
      body: {
        width: document.body.scrollWidth,
        height: document.body.scrollHeight
      },
      hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
      hasVerticalScroll: document.documentElement.scrollHeight > window.innerHeight
    };
  },
  
  /**
   * Log current metrics (debugging)
   */
  logMetrics() {
    const metrics = this.getMetrics();
    console.group('📊 Layout Metrics');
    console.table(metrics);
    console.groupEnd();
    return metrics;
  },
  
  /**
   * Enable debug mode
   */
  enableDebug() {
    this.config.debugMode = true;
    console.log('🐛 Debug mode enabled');
    
    // Add visual indicators
    document.body.style.outline = '2px solid rgba(255,0,0,0.3)';
    
    // Log metrics every second
    setInterval(() => {
      const metrics = this.getMetrics();
      if (metrics.hasVerticalScroll || metrics.hasHorizontalScroll) {
        console.warn('⚠️ Scrolling detected!', metrics);
      }
    }, 1000);
  },
  
  /**
   * Utility: Wait for element to be ready
   */
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found after ${timeout}ms`));
        } else {
          requestAnimationFrame(checkElement);
        }
      };
      
      checkElement();
    });
  },
  
  /**
   * Utility: Apply compact spacing to element
   */
  makeCompact(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    element.style.margin = '2px';
    element.style.padding = '4px';
    
    // Make children compact too
    Array.from(element.children).forEach(child => {
      child.style.margin = '2px';
    });
  }
};

// Auto-initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ResponsiveLayout.init();
  });
} else {
  ResponsiveLayout.init();
}

// Global shortcut
window.RL = ResponsiveLayout;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponsiveLayout;
}
