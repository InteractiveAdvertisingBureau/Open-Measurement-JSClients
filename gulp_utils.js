const gulp = require('gulp');

/**
 * Returns the provided gulp operation (if the condition is truthy) or a no-op
 * gulp operation (if the condition is falsy).
 */
function gulpOperationIf(condition, operation) {
  if (!condition) return () => gulp.src('.'); // Return no-op.
  return operation;
}

module.exports = {gulpOperationIf};
