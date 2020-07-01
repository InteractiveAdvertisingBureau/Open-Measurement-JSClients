/**
 * An implementation of EventTarget that can be used as a parent class. The
 * built-in browser EventTarget cannot be inherited in certain browsers.
 * @implements {EventTarget}
 */
class ExtendableEventTarget {
  /** @param {!EventTarget=} target */
  constructor(target = window.document) {
    /** @private @const {!EventTarget} */
    this.target_ = target;
  }

  /** @override*/
  addEventListener(type, listener, options) {
    this.target_.addEventListener(type, listener, options);
  }

  /** @override */
  removeEventListener(type, listener, options) {
    this.target_.removeEventListener(type, listener, options);
  }

  /** @override */
  dispatchEvent(event) {
    return this.target_.dispatchEvent(event);
  }
}

export default ExtendableEventTarget;
