goog.module('omid.common.serviceCommunication');

const Communication = goog.require('omid.common.Communication');
const DirectCommunication = goog.require('omid.common.DirectCommunication');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {isOmidPresent} = goog.require('omid.common.DetectOmid');

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

exports = {startServiceCommunication};
