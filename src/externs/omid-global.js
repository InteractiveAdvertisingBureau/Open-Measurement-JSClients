/**
 * @type {!Window}
 */
const omidGlobal = /** @type {!Window} */ ({
  'postMessage': /** @type {function(string)} */ ((message) => {}),
  'addEventListener': /** @type {function(string, function())} */ (
      (eventType, callback) => {}),
  'setTimeout': /** @type {function(function(), number):number} */(
      (callback, timeInMillis) => {}),
  'clearTimeout': /** @type {function(number)} */ ((timeoutId) => {}),
  'setInterval': /** @type {function(function(), number):number} */ (
      (callback, timeInMillis) => {}),
  'clearInterval': /** @type {function(number)} */ ((intervalId) => {}),
});

/**
 * Some JS environments have their top-level object named global instead of
 * this or window. We need this externs declaration to avoid any errors of
 * global not being defined in OmidGlobalProvider.
 * @type {!Window}
 */
const global = /** @type {!Window} */ ({
  'postMessage': /** @type {function(string)} */ ((message) => {}),
  'addEventListener': /** @type {function(string, function())} */ (
      (eventType, callback) => {}),
  'setTimeout': /** @type {function(function(), number):number} */(
      (callback, timeInMillis) => {}),
  'clearTimeout': /** @type {function(number)} */ ((timeoutId) => {}),
  'setInterval': /** @type {function(function(), number):number} */ (
      (callback, timeInMillis) => {}),
  'clearInterval': /** @type {function(number)} */ ((intervalId) => {}),
});

