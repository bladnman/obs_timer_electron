/**
 * Formats seconds into HH:MM:SS string format
 * @param {number} seconds - The number of seconds to format
 * @returns {string} Formatted time string in HH:MM:SS format
 */
function formatHMS(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) {
    return '00:00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return [hours, minutes, remainingSeconds]
    .map(unit => unit.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Calculates elapsed time from a start timestamp
 * @param {number} startTime - Start timestamp from Date.now()
 * @returns {number} Elapsed seconds
 */
function getElapsedSeconds(startTime) {
  return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * Saves total time to localStorage
 * @param {number} totalSeconds - Total accumulated seconds
 */
function saveTotalTime(totalSeconds) {
  localStorage.setItem('obsTotal', totalSeconds.toString());
}

/**
 * Loads total time from localStorage
 * @returns {number} Total accumulated seconds (defaults to 0)
 */
function loadTotalTime() {
  const saved = localStorage.getItem('obsTotal');
  return saved ? parseInt(saved, 10) || 0 : 0;
}

// Export for Node.js (tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatHMS,
    getElapsedSeconds,
    saveTotalTime,
    loadTotalTime
  };
} else {
  // Browser global
  window.timeUtils = {
    formatHMS,
    getElapsedSeconds,
    saveTotalTime,
    loadTotalTime
  };
} 