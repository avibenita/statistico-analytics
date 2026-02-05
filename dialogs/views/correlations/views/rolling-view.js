// Rolling Correlations View Component
window.CorrelationViews = window.CorrelationViews || {};

window.CorrelationViews.RollingView = {
  template: `
    <div class="results-container">
      <div class="coming-soon-container">
        <i class="fas fa-chart-line fa-3x" style="color: var(--accent-2); margin-bottom: 20px;"></i>
        <h2 style="color: var(--accent-1); margin-bottom: 10px;">Rolling Correlations</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Track how correlations change over time</p>
        <div style="background: var(--surface-2); padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <p style="color: var(--text-muted); font-size: 14px;">
            Coming soon: Analyze time-varying correlations with customizable window sizes for time series data.
          </p>
        </div>
      </div>
    </div>
  `,

  init: function() {
    console.log('✅ Rolling Correlations View initialized (placeholder)');
  }
};
