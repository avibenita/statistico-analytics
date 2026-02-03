/**
 * Shared Header Component for Statistico Standalone Views
 * Provides navigation dropdown to other analysis views
 */

const StatisticoHeader = {
  currentView: 'histogram',
  variableName: 'Variable',
  sampleSize: 0,
  
  /**
   * Initialize the header
   * @param {string} viewName - Current view name (histogram, boxplot, etc.)
   * @param {string} variableName - Variable name to display
   * @param {number} sampleSize - Sample size
   */
  init(viewName, variableName = 'Variable', sampleSize = 0) {
    this.currentView = viewName;
    this.variableName = variableName;
    this.sampleSize = sampleSize;
    this.render();
  },
  
  /**
   * Update variable name and sample size
   */
  updateVariable(variableName, sampleSize) {
    this.variableName = variableName;
    this.sampleSize = sampleSize;
    document.getElementById('headerVariableName').textContent = variableName;
    document.getElementById('headerSampleSize').textContent = `(n=${sampleSize})`;
  },
  
  /**
   * Render the header HTML
   */
  render() {
    const viewTitles = {
      'histogram': 'Interactive Histogram',
      'boxplot': 'Box Plot Analysis',
      'qqplot': 'QQ/PP Plot Analysis',
      'normality': 'Normality Tests',
      'kernel': 'Kernel Density',
      'cdf': 'Cumulative Distribution',
      'confidence': 'Confidence Intervals',
      'hypothesis': 'Hypothesis Testing',
      'outliers': 'Outliers Detection',
      'percentile': 'Percentile Calculator'
    };
    
    const headerHTML = `
      <div class="statistico-header">
        <!-- Left: Logo + Module -->
        <div class="header-left">
          <div class="header-logo">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <div class="header-module">
            <div class="header-brand">Statistico</div>
            <div class="header-module-name">Univariate</div>
          </div>
        </div>
        
        <!-- Center: View Name + Variable -->
        <div class="header-center">
          <div class="header-view-name">${viewTitles[this.currentView] || 'Analysis'}</div>
          <div class="header-variable">
            <span id="headerVariableName">${this.variableName}</span>
            <span id="headerSampleSize">(n=${this.sampleSize})</span>
          </div>
        </div>
        
        <!-- Right: Dropdown Menu -->
        <div class="header-right">
          <button class="refresh-btn" onclick="StatisticoHeader.refreshView()" title="Refresh View (Ctrl+R)">
            <i class="fa-solid fa-rotate-right"></i>
          </button>
          <button class="dropdown-btn" onclick="StatisticoHeader.toggleDropdown()">
            <span>Advanced Analysis Options</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="dropdown-content" id="dropdownMenu">
            ${this.renderDropdownItems()}
          </div>
        </div>
      </div>
    `;
    
    // Insert at beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  },
  
  /**
   * Render dropdown menu items
   */
  renderDropdownItems() {
    const views = [
      { id: 'histogram', label: 'Interactive Histogram', file: 'histogram-standalone.html' },
      { id: 'boxplot', label: 'Box Plot Analysis', file: 'boxplot-standalone.html' },
      { id: 'cdf', label: 'Cumulative Distribution', file: 'cumulative-distribution.html' },
      { id: 'percentile', label: 'Percentiles', file: 'percentile-standalone.html' },
      { id: 'outliers', label: 'Outliers Detection', file: 'outliers-standalone.html' },
      { id: 'separator', label: '---', file: null }, // Separator
      { id: 'normality', label: 'Tests of Normality', file: 'normality-standalone.html' },
      { id: 'qqplot', label: 'PP-QQ Plots', file: 'qqplot-standalone.html' },
      { id: 'hypothesis', label: 'Hypothesis Testing', file: 'hypothesis-standalone.html' },
      { id: 'confidence', label: 'Confidence Intervals', file: 'confidence-standalone.html' },
      { id: 'kernel', label: 'Kernel Density', file: 'kernel-standalone.html' }
    ];
    
    return views.map(view => {
      if (view.id === 'separator') {
        return '<div class="analysis-separator"></div>';
      }
      return `
        <div class="analysis-option ${view.id === this.currentView ? 'active' : ''}" 
             onclick="StatisticoHeader.navigateTo('${view.file}')">
          ${view.label}
        </div>
      `;
    }).join('');
  },
  
  /**
   * Toggle dropdown visibility
   */
  toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('show');
    
    // Close when clicking outside
    if (dropdown.classList.contains('show')) {
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdownOnClickOutside, true);
      }, 10);
    }
  },
  
  /**
   * Close dropdown when clicking outside
   */
  closeDropdownOnClickOutside(e) {
    const dropdown = document.getElementById('dropdownMenu');
    const button = document.querySelector('.dropdown-btn');
    
    if (!dropdown.contains(e.target) && !button.contains(e.target)) {
      dropdown.classList.remove('show');
      document.removeEventListener('click', StatisticoHeader.closeDropdownOnClickOutside, true);
    }
  },
  
  /**
   * Refresh current view
   */
  refreshView() {
    console.log('🔄 Refreshing view...');
    window.location.reload();
  },
  
  /**
   * Navigate to another view
   */
  navigateTo(filename) {
    console.log('🔄 Navigating to:', filename);
    
    try {
      // Check if Office is available
      const isOfficeAvailable = typeof Office !== 'undefined' && 
                                Office.context && 
                                Office.context.ui;
      
      console.log('Office available:', isOfficeAvailable);
      
      if (isOfficeAvailable) {
        // Office context - send message to parent
        const currentData = localStorage.getItem('univariateResults');
        if (currentData) {
          console.log('✅ Data preserved for new view');
        }
        
        const message = {
          action: 'switchView',
          view: filename
        };
        
        console.log('📤 Sending message to parent:', message);
        Office.context.ui.messageParent(JSON.stringify(message));
        console.log('✅ Message sent successfully');
      } else {
        // Browser mode - direct navigation
        console.log('⚠️ Browser mode - navigating directly');
        const newUrl = filename.startsWith('http') ? filename : `./${filename}`;
        console.log('Navigating to:', newUrl);
        window.location.href = newUrl;
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback to direct navigation
      try {
        const newUrl = filename.startsWith('http') ? filename : `./${filename}`;
        window.location.href = newUrl;
      } catch (fallbackError) {
        console.error('❌ Fallback navigation failed:', fallbackError);
        alert(`Navigation failed. Please manually navigate to: ${filename}`);
      }
    }
  }
};

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ StatisticoHeader loaded and ready');
  
  // Add keyboard shortcut for refresh
  document.addEventListener('keydown', (e) => {
    // Ctrl+R or Cmd+R or F5
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      StatisticoHeader.refreshView();
    } else if (e.key === 'F5') {
      e.preventDefault();
      StatisticoHeader.refreshView();
    }
  });
});
