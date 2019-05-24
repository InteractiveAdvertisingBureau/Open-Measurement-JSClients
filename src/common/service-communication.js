goog.module('omid.common.serviceCommunication');

const Communication = goog.require('omid.common.Communication');
const DirectCommunication = goog.require('omid.common.DirectCommunication');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {isOmidPresent} = goog.require('omid.common.DetectOmid');
const {omidGlobal} = goog.require('omid.common.OmidGlobalProvider');


/**
 * This function returns the top window that is accessible from the current window context within
 * which we are executing. The primary purpose is to ensure that when either the verification or
 * session client initiate communication that they check the correct window context for OMID
 * presence. If a window does not exist at all, we simply return omidGlobal.
 * @param {?Window=} currentWindow Reference to current window context.
 * @return {!Window}
 */
function resolveTopWindowContext(currentWindow = undefined) {
  if (typeof currentWindow === 'undefined') {
    if (typeof window !== 'undefined' && window) {
      currentWindow = window;
    }
  }
  const isWindowValid = typeof currentWindow !== 'undefined' &&
    currentWindow &&
    typeof currentWindow.top !== 'undefined' &&
    currentWindow.top;
  // Probably JSCore or some other non browser environment, so return whatever omidGlobal is.
  if (!isWindowValid) {
    return omidGlobal;
  }
  if (currentWindow === currentWindow.top) {
    return currentWindow;
  }
  // The purpose of this block is to detect if we are in a cross domain iframe.
  // If we are in a cross domain iframe, this will throw an exception, so the appropriate window
  // context is just window.
  // If no exception is thrown, then we are in a friendly iframe, so the correct window context
  // is window.top.
  try {
    const top = currentWindow.top;
    // This check is tricky and subtle. We want to confirm that arbitrary properties on the top
    // window are safely accessible, but we don't care what the value of the particular property
    // we choose to check is. Compilation could remove this check if it is thought to not have
    // side effects.
    //  Bugs that have affected this code previously:
    //    OMSDK-467: IE<=11 will return 'undefined' for typeof top.unaccessibleProperty, instead of
    //               throwing an error. We must access and test properties directly.
    //    OMSDK-469: iOS<=9 will not throw an error for accessing/reading top.unaccessibleProperty,
    //               and will simply return undefined (and log an uncatchable console error).
    //
    if (typeof top.location.hostname === 'undefined') {
      // This check catches top inaccessibility for most browsers, including old Safari/iOS.
      return currentWindow;
    }
    // This check is explicitly for IE 11 and below, which will not be properly caught above.
    return (top['x'] === '' || top['x'] !== '') ? top : currentWindow;
  } catch (e) {
    return currentWindow;
  }
}

/**
 * Gets the value of an unobfuscated key of an object.
 * The key may be arbitrarily depp in the object.
 * @param {!Object} object
 * @param {!Array<string>} unobfuscatedName
 * @return {!Object|undefined}
 */
function getUnobfuscatedKey(object, unobfuscatedName) {
  return unobfuscatedName.reduce(
      (subObject, key) => subObject && subObject[key],
      object);
}

/**
 * Starts communication with the OMID VerificationService.
 * @param {!Window} globalObject Object which refers to the global context.
 * @param {!Array<string>} exportedCommunicationName The unobfuscated name of
 *     the DirectCommunication as exported in the global context.
 * @param {function(!Window): boolean=} omidPresenseCallback Callback used to
 *     check if the OM SDK Service is present in a cross domain iframe. Used for
 *     dependency injection.
 * @return {?Communication<?>}
 */
function startServiceCommunication(
    globalObject, exportedCommunicationName,
    omidPresenseCallback = isOmidPresent) {
  const directCommunication =
      getUnobfuscatedKey(globalObject, exportedCommunicationName);
  if (directCommunication) {
    return new DirectCommunication(
        /** @type {!DirectCommunication} */ (directCommunication));
  } else if (globalObject.top && omidPresenseCallback(globalObject.top)) {
    return new PostMessageCommunication(globalObject, globalObject.top);
  }
  return null;
}

exports = {startServiceCommunication, resolveTopWindowContext};
