/**
 * Container Tag Utilities
 * Handles project identification via git root or cwd
 */

const { execSync } = require('child_process');
const crypto = require('crypto');

/**
 * Create a short SHA256 hash
 */
function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Get the git root directory, or null if not in a git repo
 */
function getGitRoot(cwd) {
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return gitRoot || null;
  } catch {
    return null;
  }
}

/**
 * Get container tag for a directory
 * Uses git root if available, otherwise cwd
 */
function getContainerTag(cwd) {
  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  return `claudecode_project_${sha256(basePath)}`;
}

/**
 * Get project name from directory
 */
function getProjectName(cwd) {
  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  return basePath.split('/').pop() || 'unknown';
}

/**
 * Get user container tag (cross-project)
 */
function getUserContainerTag() {
  // Try git email first
  try {
    const email = execSync('git config user.email', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (email) {
      return `claudecode_user_${sha256(email)}`;
    }
  } catch {}

  // Fallback to username
  const username = process.env.USER || process.env.USERNAME || 'anonymous';
  return `claudecode_user_${sha256(username)}`;
}

module.exports = {
  sha256,
  getGitRoot,
  getContainerTag,
  getProjectName,
  getUserContainerTag
};
