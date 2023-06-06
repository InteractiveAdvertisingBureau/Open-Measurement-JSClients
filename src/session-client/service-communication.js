goog.module('omid.sessionClient.ServiceCommunication');

const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const windowUtils = goog.require('omid.common.windowUtils');
const {MessageMethod} = goog.require('omid.common.constants');
const {packageExport} = goog.require('omid.common.exporter');

/**
 * Registers a callback that is called with the window containing the OM SDK
 * service once the service has loaded.
 *
 * To use this function:
 * 1. From the window containing the session client, call this function with a
 *    callback that takes a service window as an argument and saves that window.
 * 2. From any window, call `setSessionClientWindow` on the
 *    `omidSessionInterface` found in the service window, passing the session
 *    client window.
 * 3. When starting an ad session from the session client window, set the
 *    `serviceWindow` property of the `Context` to the saved service window.
 *
 * This is useful when the top-level OM SDK integration can obtain a reference
 * to each of these windows but it would be difficult for the session client
 * window to obtain a reference to the service window.
 *
 * @param {function(!Window)} callback
 */
function listenForServiceWindow(callback) {
  const thisWindow = windowUtils.resolveGlobalContext();
  const communication = new PostMessageCommunication(thisWindow);
  communication.onMessage = (message, from) => {
    if (message.method !== MessageMethod.IDENTIFY_SERVICE_WINDOW) return;
    callback(from);
  };
}

packageExport(
    'OmidSessionClient.listenForServiceWindow', listenForServiceWindow);
exports = {listenForServiceWindow};
