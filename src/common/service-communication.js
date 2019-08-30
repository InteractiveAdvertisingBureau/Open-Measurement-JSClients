/**
 * @fileoverview A set of functions for setting up communication with the OM SDK
 * service script from either the session client or the verification client.
 */
goog.module('omid.common.serviceCommunication');

const Communication = goog.require('omid.common.Communication');
const DirectCommunication = goog.require('omid.common.DirectCommunication');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {isOmidPresent} = goog.require('omid.common.DetectOmid');
const {omidGlobal} = goog.require('omid.common.OmidGlobalProvider');

/**
 * The keypath of the communication exported by the OMID SessionService.
 * @const {!Array<string>}
 */
const EXPORTED_SESSION_COMMUNICATION_NAME =
    ['omid', 'v1_SessionServiceCommunication'];

/**
 * The keypath of the communication exported by the OMID VerificationService.
 * @const {!Array<string>}
 */
const EXPORTED_VERIFICATION_COMMUNICATION_NAME =
    ['omid', 'v1_VerificationServiceCommunication'];

/**
 * The keypath of a reference to the service window exported by the OMID
 * VerificationService in omid.service.VerificationInjector.
 * @const {!Array<string>}
 */
const EXPORTED_SERVICE_WINDOW_NAME = ['omid', 'serviceWindow'];

/**
 * Detects if the given window exists in a DOM and is not null or undefined.
 * @param {!Window=} win The window to check.
 * @return {boolean} True if the window exists in a DOM and is not null or
 *    undefined.
 */
function isValidWindow(win = undefined) {
  return win != null && typeof win.top !== 'undefined' && win.top != null;
}

/**
 * Detect if the given window is cross-origin relative to the current one.
 * @param {!Window} win The window to check.
 * @return {boolean} True if the window is cross-origin.
 */
function isCrossOrigin(win) {
  if (win === omidGlobal) {
    return false;
  }
  try {
    // This check is tricky and subtle. We want to confirm that arbitrary
    // properties on the window are safely accessible, but we don't care
    // what the value of the particular property we choose to check is.
    //  Bugs that have affected this code previously:
    //    OMSDK-467: IE<=11 will return 'undefined' for typeof
    //    window.unaccessibleProperty, instead of throwing an error. We must
    //    access and test properties directly.
    //
    //    OMSDK-469: iOS<=9 will not throw an error for accessing/reading
    //    window.unaccessibleProperty, and will simply return undefined (and log
    //    an uncatchable console error).
    //
    if (typeof win.location.hostname === 'undefined') {
      // This check catches top inaccessibility for most browsers, including old
      // Safari/iOS.
      return true;
    }
    if (isSameOriginForIE(win)) {
      return false;
    }
  } catch (e) {
    // If the above block throws an exception, then the window is cross-origin.
    return true;
  }
  // In all other cases, the window is same-origin.
  return false;
}

/**
 * This check is explicitly for IE 11 and below, which will not be properly
 * caught by techniques used for other browsers. In most browsers, this function
 * will return true for cross and same-origin windows, and true in IE 11 and
 * below for a same-origin window. It will throw for a cross-origin window in IE
 * 11 and below.
 *
 * This statement never returns false, but the check needs to be made so that
 * the compiler won't remove it because it thinks the result is not being used.
 *
 * This one-line check also needs to be in its own function since otherwise the
 * compiler will remove it because it doesn't think it can ever throw.
 *
 * @param {!Window} win The window to check.
 * @return {boolean} True if the window is same-origin.
 * @throws an error if the window is cross-origin on IE.
 */
function isSameOriginForIE(win) {
  return win['x'] === '' || win['x'] !== '';
}

/**
 * Resolves the global context for the current environment -- either the current
 * window for a DOM environment, or the omidGlobal in a DOM-less environment.
 * @param {!Window=} win The current environment's window object. If not
 *     provided, defaults to the 'window' global.
 * @return {!Window} The global context for the current environment.
 */
function resolveGlobalContext(win = undefined) {
  if (typeof win === 'undefined' && typeof window !== 'undefined' && window) {
    win = window;
  }
  if (isValidWindow(win)) {
    return /** @type {!Window} */ (win);
  }
  // Probably JSCore or some other non-DOM environment, so return omidGlobal.
  return omidGlobal;
}

/**
 * Returns the top window that is accessible from the current window context.
 * If a window does not exist at all, omidGlobal is returned.
 * @param {!Window=} win The current environment's window object.
 * @return {!Window} The top window, or the omidGlobal.
 */
function resolveTopWindowContext(win) {
  // JSCore or some other non browser environment, so return omidGlobal.
  if (!isValidWindow(win)) {
    return omidGlobal;
  }
  return win.top;
}

/**
 * Gets the value for an unobfuscated keypath of an object. The key may be
 * arbitrarily deep in the object.
 * @param {!Object} object The object to query.
 * @param {!Array<string>} unobfuscatedKeypath The keypath of the property.
 * @return {!Object|undefined} The value at the keypath, or undefined if not
 *     found.
 */
function getValueForKeypath(object, unobfuscatedKeypath) {
  return unobfuscatedKeypath.reduce(
      (subObject, key) => subObject && subObject[key], object);
}

/**
 * Starts communication with the OM SDK Service.
 * @param {!Window} clientGlobal The client's window or global object.
 * @param {!Window} serviceGlobal The service's window or global object.
 * @param {!Array<string>} exportedCommunicationName The unobfuscated name of
 *     the DirectCommunication as exported in the serviceGlobal.
 * @param {function(!Window): boolean} omidPresenceCallback Callback used to
 *     check if the OM SDK Service is present in a cross-origin iframe.
 * @return {?Communication<?>} A communication object connected to the service,
 *     or null if unavailable.
 */
function startServiceCommunication(
    clientGlobal, serviceGlobal, exportedCommunicationName,
    omidPresenceCallback) {
  // Prefer direct communication first.
  if (!isCrossOrigin(serviceGlobal)) {
    // As a paranoid safeguard, wrap direct access in a try catch.
    try {
      const directCommunication = getValueForKeypath(
          serviceGlobal, exportedCommunicationName);
      if (directCommunication) {
        return new DirectCommunication(
            /** @type {!DirectCommunication} */ (directCommunication));
      }
      // Do nothing, fall back to post message communication.
    } catch (e) {
    }
  }
  if (omidPresenceCallback(serviceGlobal)) {
    return new PostMessageCommunication(clientGlobal, serviceGlobal);
  }
  return null;
}

/**
 * Runs through the serviceGlobalCandidates in order and tries starting a
 * service communication with each, returning the first valid one started.
 * @param {!Window} clientGlobal The client's window or global object.
 * @param {!Array<!Window>} serviceGlobalCandidates A list of serviceGlobals
 *     with which to try starting a service communication.
 * @param {!Array<string>} exportedCommunicationName The unobfuscated name of
 *     the DirectCommunication as exported in the serviceGlobal candidates.
 * @param {function(!Window): boolean} omidPresenceCallback Callback used to
 *     check if the OM SDK Service is present in a cross-origin iframe.
 * @return {?Communication<?>} A communication object connected to the service,
 *     or null if unavailable.
 */
function startServiceCommunicationFromCandidates(
    clientGlobal, serviceGlobalCandidates, exportedCommunicationName,
    omidPresenceCallback) {
  // Try starting communication with each candidate, using first valid one.
  for (const serviceGlobal of serviceGlobalCandidates) {
    const communication = startServiceCommunication(
        clientGlobal, serviceGlobal, exportedCommunicationName,
        omidPresenceCallback);
    if (communication) {
      return communication;
    }
  }
  return null;
}

/**
 * Starts communication with the OMID SessionService.
 * @param {!Window} clientGlobal The session client's window or global object.
 * @param {!Window=} serviceGlobal A global with which to attempt service
 *     communication first, overriding the default search algorithm.
 * @param {function(!Window): boolean=} omidPresenceCallback Callback used to
 *     check if the OM SDK Service is present in a cross-origin iframe.
 * @return {?Communication<?>} A communication object connected to the service,
 *     or null if unavailable.
 */
function startSessionServiceCommunication(
    clientGlobal, serviceGlobal = undefined,
    omidPresenceCallback = isOmidPresent) {
  // Try a direct communication on the current global (DOM-less environments),
  // or try direct on top, or finally, post on top.
  const serviceGlobalCandidates =
      [clientGlobal, resolveTopWindowContext(clientGlobal)];
  if (serviceGlobal) {
    serviceGlobalCandidates.unshift(serviceGlobal);
  }
  return startServiceCommunicationFromCandidates(
      clientGlobal, serviceGlobalCandidates,
      EXPORTED_SESSION_COMMUNICATION_NAME, omidPresenceCallback);
}

/**
 * Starts communication with the OMID VerificationService.
 * @param {!Window} clientGlobal The verification client's window or global
 *     object.
 * @param {function(!Window): boolean=} omidPresenceCallback Callback used to
 *     check if the OM SDK Service is present in a cross-origin iframe.
 * @return {?Communication<?>} A communication object connected to the service,
 *     or null if unavailable.
 */
function startVerificationServiceCommunication(
    clientGlobal, omidPresenceCallback = isOmidPresent) {
  const serviceGlobalCandidates = [];
  // If the service script has told us which window to use, use that one.
  const providedServiceWindow = getValueForKeypath(
      clientGlobal, EXPORTED_SERVICE_WINDOW_NAME);
  if (providedServiceWindow) {
    serviceGlobalCandidates.push(providedServiceWindow);
  }
  // Otherwise, fall back to the old strategy of always using top.
  serviceGlobalCandidates.push(resolveTopWindowContext(clientGlobal));

  return startServiceCommunicationFromCandidates(
      clientGlobal, serviceGlobalCandidates,
      EXPORTED_VERIFICATION_COMMUNICATION_NAME, omidPresenceCallback);
}

exports = {
  isCrossOrigin,
  resolveGlobalContext,
  startSessionServiceCommunication,
  startVerificationServiceCommunication,
};
