/**
 * Statistico Analytics - Universal Saved Analyses Manager
 * 
 * Manages saving and loading analysis configurations across all modules
 * using Excel Custom Document Properties (workbook-specific storage)
 */

const SavedAnalysesManager = (function() {
  'use strict';

  const PROPERTY_KEY = 'STATISTICO_ANALYSES';
  const MAX_ANALYSES = 100; // Safety limit

  /**
   * Save an analysis configuration to the workbook
   * @param {Object} analysisData - The analysis configuration
   * @returns {Promise<boolean>} Success status
   */
  async function saveAnalysis(analysisData) {
    try {
      console.log('💾 Saving analysis to workbook:', analysisData.name);
      
      await Excel.run(async (context) => {
        const properties = context.workbook.properties.custom;
        
        // Load existing analyses
        const allAnalyses = await loadAllAnalyses();
        
        // Check if updating existing or adding new
        const existingIndex = allAnalyses.findIndex(a => a.id === analysisData.id);
        if (existingIndex >= 0) {
          allAnalyses[existingIndex] = analysisData;
          console.log('📝 Updated existing analysis');
        } else {
          // Check limit
          if (allAnalyses.length >= MAX_ANALYSES) {
            throw new Error(`Maximum of ${MAX_ANALYSES} saved analyses reached`);
          }
          allAnalyses.push(analysisData);
          console.log('➕ Added new analysis');
        }
        
        // Save to Excel custom property
        const prop = properties.getItemOrNullObject(PROPERTY_KEY);
        await context.sync();
        
        if (prop.isNullObject) {
          properties.add(PROPERTY_KEY, JSON.stringify(allAnalyses));
        } else {
          prop.value = JSON.stringify(allAnalyses);
        }
        
        await context.sync();
        console.log('✅ Analysis saved successfully');
        return true;
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error saving analysis:', error);
      throw error;
    }
  }

  /**
   * Load all saved analyses from the workbook
   * @returns {Promise<Array>} Array of saved analyses
   */
  async function loadAllAnalyses() {
    try {
      return await Excel.run(async (context) => {
        const properties = context.workbook.properties.custom;
        const prop = properties.getItemOrNullObject(PROPERTY_KEY);
        prop.load("value");
        await context.sync();
        
        if (!prop.isNullObject && prop.value) {
          const analyses = JSON.parse(prop.value);
          console.log(`📂 Loaded ${analyses.length} saved analyses`);
          return analyses;
        }
        
        console.log('📂 No saved analyses found');
        return [];
      });
    } catch (error) {
      console.error('❌ Error loading analyses:', error);
      return [];
    }
  }

  /**
   * Load a specific analysis by ID
   * @param {string} analysisId - The analysis ID
   * @returns {Promise<Object|null>} The analysis or null if not found
   */
  async function loadAnalysisById(analysisId) {
    const allAnalyses = await loadAllAnalyses();
    const analysis = allAnalyses.find(a => a.id === analysisId);
    return analysis || null;
  }

  /**
   * Delete an analysis from the workbook
   * @param {string} analysisId - The analysis ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async function deleteAnalysis(analysisId) {
    try {
      console.log('🗑️ Deleting analysis:', analysisId);
      
      await Excel.run(async (context) => {
        const properties = context.workbook.properties.custom;
        const allAnalyses = await loadAllAnalyses();
        
        const filtered = allAnalyses.filter(a => a.id !== analysisId);
        
        if (filtered.length === allAnalyses.length) {
          console.warn('⚠️ Analysis not found:', analysisId);
          return false;
        }
        
        const prop = properties.getItem(PROPERTY_KEY);
        prop.value = JSON.stringify(filtered);
        await context.sync();
        
        console.log('✅ Analysis deleted successfully');
        return true;
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting analysis:', error);
      throw error;
    }
  }

  /**
   * Toggle star status of an analysis
   * @param {string} analysisId - The analysis ID
   * @returns {Promise<boolean>} New star status
   */
  async function toggleStar(analysisId) {
    try {
      const allAnalyses = await loadAllAnalyses();
      const analysis = allAnalyses.find(a => a.id === analysisId);
      
      if (!analysis) {
        throw new Error('Analysis not found');
      }
      
      analysis.starred = !analysis.starred;
      await saveAnalysis(analysis);
      
      return analysis.starred;
    } catch (error) {
      console.error('❌ Error toggling star:', error);
      throw error;
    }
  }

  /**
   * Get analyses filtered by module
   * @param {string} moduleName - The module name (e.g., 'regression', 'hypothesis')
   * @returns {Promise<Array>} Filtered analyses
   */
  async function getAnalysesByModule(moduleName) {
    const allAnalyses = await loadAllAnalyses();
    return allAnalyses.filter(a => a.module === moduleName);
  }

  /**
   * Create a default analysis name based on module and config
   * @param {string} module - Module name
   * @param {Object} config - Module config
   * @returns {string} Default name
   */
  function generateDefaultName(module, config) {
    const timestamp = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    switch (module) {
      case 'regression':
        return `${config.y} Model (${timestamp})`;
      case 'hypothesis':
        return `${config.parameter} Test (${timestamp})`;
      case 'correlation':
        return `Correlation (${timestamp})`;
      case 'descriptive':
        return `Descriptive Stats (${timestamp})`;
      case 'normality':
        return `Normality Test (${timestamp})`;
      default:
        return `Analysis (${timestamp})`;
    }
  }

  /**
   * Validate data range still exists in workbook
   * @param {string} dataRange - Excel range reference
   * @returns {Promise<boolean>} True if valid
   */
  async function validateDataRange(dataRange) {
    try {
      await Excel.run(async (context) => {
        const range = context.workbook.getSelectedDataRange();
        // Try to get the range - will throw if invalid
        const testRange = context.workbook.worksheets.getActiveWorksheet().getRange(dataRange);
        testRange.load('address');
        await context.sync();
        return true;
      });
      return true;
    } catch (error) {
      console.warn('⚠️ Data range validation failed:', dataRange);
      return false;
    }
  }

  // Public API
  return {
    saveAnalysis,
    loadAllAnalyses,
    loadAnalysisById,
    deleteAnalysis,
    toggleStar,
    getAnalysesByModule,
    generateDefaultName,
    validateDataRange
  };
})();

// Make available globally
if (typeof window !== 'undefined') {
  window.SavedAnalysesManager = SavedAnalysesManager;
}
