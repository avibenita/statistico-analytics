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
      'confidence': 'Confidence Intervals',
      'hypothesis': 'Hypothesis Testing',
      'outliers': 'Outliers Detection'
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
            <i class="fa-solid fa-chart-simple"></i>
            <span>Views</span>
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
      { id: 'histogram', icon: 'fa-chart-column', label: 'Histogram & Stats', file: 'histogram-standalone.html' },
      { id: 'boxplot', icon: 'fa-box', label: 'Box Plot', file: 'boxplot-standalone.html' },
      { id: 'qqplot', icon: 'fa-chart-scatter', label: 'QQ/PP Plot', file: 'qqplot-standalone.html' }
      // TODO: Add more views as they are created:
      // { id: 'normality', icon: 'fa-vial', label: 'Normality Tests', file: 'normality-standalone.html' },
      // { id: 'kernel', icon: 'fa-wave-square', label: 'Kernel Density', file: 'kernel-standalone.html' },
      // { id: 'confidence', icon: 'fa-chart-line', label: 'Confidence Intervals', file: 'confidence-standalone.html' },
      // { id: 'hypothesis', icon: 'fa-flask', label: 'Hypothesis Testing', file: 'hypothesis-standalone.html' },
      // { id: 'outliers', icon: 'fa-exclamation-triangle', label: 'Outliers Detection', file: 'outliers-standalone.html' }
    ];
    
    return views.map(view => `
      <div class="analysis-option ${view.id === this.currentView ? 'active' : ''}" 
           onclick="StatisticoHeader.navigateTo('${view.file}')">
        <i class="fa-solid ${view.icon}"></i>
        ${view.label}
      </div>
    `).join('');
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
    console.log('typeof Office:', typeof Office);
    console.log('Office.context:', Office.context);
    console.log('Office.context.ui:', Office.context && Office.context.ui);
    
    // If in Office context, we need to pass data and open new dialog
    if (typeof Office !== 'undefined' && Office.context && Office.context.ui) {
      // Store current data for the new view
      const currentData = localStorage.getItem('univariateResults');
      if (currentData) {
        // Keep the data in localStorage
        console.log('✅ Data preserved for new view');
      }
      
      // Close current dialog and let parent open the new one
      const message = {
        action: 'switchView',
        view: filename
      };
      
      console.log('📤 Sending message to parent:', message);
      
      try {
        Office.context.ui.messageParent(JSON.stringify(message));
        console.log('✅ Message sent successfully');
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    } else {
      // Browser mode - simple navigation
      console.log('⚠️ Not in Office context, using browser navigation');
      window.location.href = filename;
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
