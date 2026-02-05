// Network View Component
window.CorrelationViews = window.CorrelationViews || {};

window.CorrelationViews.NetworkView = {
  template: `
    <div class="results-container">
      <div class="controls">
        <div class="control-group">
          <span class="slider-label">Highlight r ≥</span>
          <input type="range" id="networkThresholdSlider" min="0" max="1" step="0.05" value="0" oninput="updateNetworkThreshold(this.value)">
          <span class="slider-value" id="networkThresholdValue">0.00</span>
        </div>

        <div class="control-group">
          <label class="checkbox-label">
            <input type="checkbox" id="showCorrValues" checked onchange="toggleCorrValues()">
            <span>Show r</span>
          </label>
        </div>
      </div>

      <div id="networkLoadingMessage" class="loading" style="display:none;">
        <i class="fa-solid fa-spinner"></i>
        <p>Loading correlation network...</p>
      </div>

      <div class="network-container" id="networkContainer" style="display:none;">
        <svg id="networkSVG"></svg>
      </div>
    </div>
  `,

  init: function() {
    console.log('✅ Network View initialized');
  }
};
