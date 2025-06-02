/**
 * Settings Manager
 * Handles local storage of OBS connection settings
 */

class Settings {
  constructor() {
    this.storageKey = 'obsTimerSettings';
    this.defaultSettings = {
      obsHost: 'localhost',
      obsPort: 4455,
      obsPassword: '',
      autoConnect: true
    };
  }

  /**
   * Load settings from localStorage
   * @returns {Object} Settings object
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return { ...this.defaultSettings };
  }

  /**
   * Save settings to localStorage
   * @param {Object} settings - Settings to save
   */
  save(settings) {
    try {
      const current = this.load();
      const updated = { ...current, ...settings };
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error saving settings:', error);
      return settings;
    }
  }

  /**
   * Get OBS WebSocket connection URL
   * @returns {string} WebSocket URL
   */
  getConnectionUrl() {
    const settings = this.load();
    return `ws://${settings.obsHost}:${settings.obsPort}`;
  }

  /**
   * Get OBS password
   * @returns {string} Password
   */
  getPassword() {
    const settings = this.load();
    return settings.obsPassword || '';
  }

  /**
   * Update OBS connection settings
   * @param {string} host - OBS host
   * @param {number} port - OBS port
   * @param {string} password - OBS password
   */
  updateConnectionSettings(host, port, password) {
    return this.save({
      obsHost: host,
      obsPort: port,
      obsPassword: password
    });
  }

  /**
   * Clear all settings
   */
  reset() {
    localStorage.removeItem(this.storageKey);
  }
}

// Export for Node.js (tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Settings;
} else {
  // Browser global
  window.Settings = Settings;
} 