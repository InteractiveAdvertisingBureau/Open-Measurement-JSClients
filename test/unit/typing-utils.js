goog.module('omid.test.typingUtils');

/**
 * Casts any value to a Jasmine Spy.
 *
 * Directly casting methods to the Spy type will result in `invalid cast - must
 * be a subtype or supertype` errors.
 * @param {?} value
 * @return {!jasmine.Spy}
 */
function asSpy(value) {
  return /** @type {!jasmine.Spy} */ (value);
}

/**
 * Casts any value to a Window.
 *
 * Directly casting methods to the Window type will result in `invalid cast -
 * must be a subtype or supertype` errors.
 * @param {?} value
 * @return {!Window}
 */
function asWindow(value) {
  return /** @type {!Window} */ (value);
}

exports = {asSpy, asWindow};
