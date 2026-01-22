/**
 * Stdin Utilities
 * Handles reading JSON from stdin (Claude Code hook input)
 */

/**
 * Read all stdin and parse as JSON
 */
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      try {
        const parsed = data.trim() ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse stdin JSON: ${err.message}`));
      }
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });

    // Handle case where stdin is empty/closed
    if (process.stdin.isTTY) {
      resolve({});
    }
  });
}

/**
 * Output JSON to stdout (for Claude Code)
 */
function writeOutput(data) {
  console.log(JSON.stringify(data));
}

/**
 * Output success response
 */
function outputSuccess(additionalContext = null) {
  if (additionalContext) {
    writeOutput({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext
      }
    });
  } else {
    writeOutput({
      continue: true,
      suppressOutput: true
    });
  }
}

/**
 * Output error (non-blocking)
 */
function outputError(message) {
  console.error(`Supermemory: ${message}`);
  writeOutput({
    continue: true,
    suppressOutput: true
  });
}

module.exports = {
  readStdin,
  writeOutput,
  outputSuccess,
  outputError
};
