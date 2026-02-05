// Matrix View Component
window.CorrelationViews = window.CorrelationViews || {};

window.CorrelationViews.MatrixView = {
  template: `
    <div class="results-container">
      <div class="controls">
        <div class="control-group">
          <label>Correlation Type:</label>
          <div class="radio-bar">
            <label>
              <input type="radio" name="corrType" value="Pearson" checked onchange="recalculate()">
              <span>Pearson</span>
            </label>
            <label>
              <input type="radio" name="corrType" value="Spearman" onchange="recalculate()">
              <span>Spearman</span>
            </label>
            <label>
              <input type="radio" name="corrType" value="Kendall" onchange="recalculate()">
              <span>Kendall</span>
            </label>
          </div>
        </div>

        <div class="filter-controls-frame">
          <div class="slider-center">
            <div class="control-group slider-container">
              <span class="slider-label">Highlight r ≥</span>
              <input type="range" id="thresholdSlider" min="0" max="1" step="0.05" value="0" oninput="updateThreshold(this.value)">
              <span class="slider-value" id="thresholdValue">0.00</span>
            </div>
          </div>

          <div class="checkbox-right">
            <div class="control-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="showPValue" checked onchange="toggleDisplay()">
                <span>Show p-value</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="showN" checked onchange="toggleDisplay()">
                <span>Show n</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div id="loadingMessage" class="loading">
        <i class="fa-solid fa-spinner"></i>
        <p>Loading correlation data...</p>
      </div>

      <div id="resultsContainer" style="display:none;">
        <div class="scroll-hint">
          <i class="fa-solid fa-arrows-left-right"></i>
          Scroll horizontally to view all variables • First column stays fixed
        </div>
        
        <div class="table-container">
          <table id="correlationTable">
            <thead id="tableHead"></thead>
            <tbody id="tableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `,

  init: function() {
    console.log('✅ Matrix View initialized');
  }
};
