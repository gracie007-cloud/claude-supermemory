/**
 * Settings Management
 * Handles configuration from file and environment
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SETTINGS_DIR = path.join(os.homedir(), '.supermemory-claude');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  // Tools to skip capturing (high-frequency, low-value)
  skipTools: ['Read', 'Glob', 'Grep', 'TodoWrite', 'AskUserQuestion'],

  // Tools to always capture
  captureTools: ['Edit', 'Write', 'Bash', 'Task'],

  // Context injection limits
  maxContextMemories: 10,
  maxProjectMemories: 20,
  maxProfileItems: 5,

  // Behavior
  debug: false,
  injectProfile: true
};

/**
 * Ensure settings directory exists
 */
function ensureSettingsDir() {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

/**
 * Load settings from file and environment
 */
function loadSettings() {
  const settings = { ...DEFAULT_SETTINGS };

  // Load from file if exists
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileContent = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const fileSettings = JSON.parse(fileContent);
      Object.assign(settings, fileSettings);
    }
  } catch (err) {
    console.error(`Settings: Failed to load ${SETTINGS_FILE}: ${err.message}`);
  }

  // Environment overrides
  if (process.env.SUPERMEMORY_API_KEY) {
    settings.apiKey = process.env.SUPERMEMORY_API_KEY;
  }
  if (process.env.SUPERMEMORY_SKIP_TOOLS) {
    settings.skipTools = process.env.SUPERMEMORY_SKIP_TOOLS.split(',').map(s => s.trim());
  }
  if (process.env.SUPERMEMORY_DEBUG === 'true') {
    settings.debug = true;
  }

  return settings;
}

/**
 * Save settings to file
 */
function saveSettings(settings) {
  ensureSettingsDir();
  const toSave = { ...settings };
  // Don't save API key to file (use env var)
  delete toSave.apiKey;
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(toSave, null, 2));
}

/**
 * Get API key (required)
 */
function getApiKey(settings) {
  const apiKey = settings.apiKey || process.env.SUPERMEMORY_API_KEY;
  if (!apiKey) {
    throw new Error('SUPERMEMORY_API_KEY not set. Get your key at https://console.supermemory.ai');
  }
  return apiKey;
}

/**
 * Check if a tool should be captured
 */
function shouldCaptureTool(toolName, settings) {
  if (settings.skipTools.includes(toolName)) {
    return false;
  }
  // If captureTools is specified, only capture those
  if (settings.captureTools && settings.captureTools.length > 0) {
    return settings.captureTools.includes(toolName);
  }
  return true;
}

/**
 * Debug log (only if debug enabled)
 */
function debugLog(settings, message, data) {
  if (settings.debug) {
    const timestamp = new Date().toISOString();
    const logLine = data
      ? `[${timestamp}] ${message}: ${JSON.stringify(data)}`
      : `[${timestamp}] ${message}`;
    console.error(logLine);
  }
}

module.exports = {
  SETTINGS_DIR,
  SETTINGS_FILE,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  getApiKey,
  shouldCaptureTool,
  debugLog
};
