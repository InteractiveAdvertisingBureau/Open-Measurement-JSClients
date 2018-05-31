goog.module('omid.common.OmidGlobalProvider');

/**
 * Calling `this` from within a Closure module results either in an error, or
 * getting a reference to the module itself. Calling `eval('this')` allows us
 * to get the top-level global object the module belongs to.
 * @type {!Window}
 */
const globalThis = /** @type {!Window} */ (eval('this'));

/**
 * Returns the omidGlobal object. If the client is wrapped in a bootstrapper,
 * then the omidGlobal object is defined from the wrapping immediately invoked
 * function. For client integrations that use Google Closure Compiler, then it
 * resorts to the top-level this object.
 * @return {!Window}
 * @throws error when omidGlobal cannot be determined.
 */
function getOmidGlobal() {
  if (typeof omidGlobal !== 'undefined' && omidGlobal) {
    return omidGlobal;
  } else if (typeof global !== 'undefined' && global) {
    return global;
  } else if (typeof window !== 'undefined' && window) {
    return window;
  } else if (typeof globalThis !== 'undefined' && globalThis) {
    return globalThis;
  } else {
    throw new Error('Could not determine global object context.');
  }
}

/** @type {!Window} */
exports.omidGlobal = getOmidGlobal();
