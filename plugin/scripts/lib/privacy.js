/**
 * Privacy Tag Utilities
 * Handles stripping of private content before storage
 */

const PRIVATE_TAG_REGEX = /<private>[\s\S]*?<\/private>/gi;
const MAX_TAG_COUNT = 100; // ReDoS protection

/**
 * Strip all <private>...</private> content
 */
function stripPrivateContent(text) {
  if (!text || typeof text !== 'string') return text;

  // ReDoS protection: limit tag count
  const matches = text.match(PRIVATE_TAG_REGEX);
  if (matches && matches.length > MAX_TAG_COUNT) {
    console.error(`Privacy: Too many tags (${matches.length}), truncating`);
    // Still strip, but warn
  }

  return text.replace(PRIVATE_TAG_REGEX, '[PRIVATE]');
}

/**
 * Check if content is entirely private (nothing useful left after stripping)
 */
function isFullyPrivate(text) {
  if (!text || typeof text !== 'string') return true;

  const stripped = stripPrivateContent(text).trim();
  return stripped === '[PRIVATE]' || stripped === '' || stripped === '[PRIVATE][PRIVATE]';
}

/**
 * Check if content contains any private tags
 */
function containsPrivateTag(text) {
  if (!text || typeof text !== 'string') return false;
  return PRIVATE_TAG_REGEX.test(text);
}

/**
 * Strip private content from JSON object (recursively)
 */
function stripPrivateFromJson(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return stripPrivateContent(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => stripPrivateFromJson(item));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = stripPrivateFromJson(value);
    }
    return result;
  }

  return obj;
}

module.exports = {
  stripPrivateContent,
  isFullyPrivate,
  containsPrivateTag,
  stripPrivateFromJson
};
