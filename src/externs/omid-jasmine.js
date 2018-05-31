/**
 * This represents the value of the jasmine variable in production runs of the
 * code. In production, this variable is checked by logger.js. If the variable
 * is undefined, it means that we are executing tests and logger.js is throwing
 * loudly instead of logging errors. However, in production the jasmine
 * variable is undefined and logger.js just logs the errors.
 * @type {undefined}
 */
let jasmine = undefined;
