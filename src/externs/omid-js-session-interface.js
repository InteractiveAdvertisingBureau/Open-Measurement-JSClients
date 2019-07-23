/**
 * @fileoverview @externs Definition of omidSessionInterface, used for session
 * client integration with the OM SDK service script.
 */

/**
 * @typedef {{
 *   adSessionId: string,
 *   timestamp: number,
 *   type: string,
 *   data: ?,
 * }}
 */
let OmidEvent;

/** @const */
const omidSessionInterface = {};

/**
 * Updates information about the session client. The client may call this at any
 * time(s). This information must be used to update the event data given to
 * SESSION_START observers.
 * @param {string} sessionClientVersion The Session Client Library's version
 *     string.
 * @param {string} partnerName The integration partner's identifier.
 * @param {string} partnerVersion The integration partner's version string.
 */
omidSessionInterface.setClientInfo =
    function(sessionClientVersion, partnerName, partnerVersion) {};
/**
 * Registers a callback for the SESSION_START, SESSION_ERROR, and SESSION_FINISH
 * events from the Service Script only until SESSION_FINISH is sent. The client
 * may call this it at any time(s). After receiving SESSION_FINISH, the client
 * will have to call this function again to get new events.
 * From one SESSION_START to the next SESSION_FINISH, a client can assume that
 * there is only one session active. Note that SESSION_ERROR by itself does not
 * imply that a session has finished.
 * On SESSION_FINISH, the Service Script shall:
 *   - Unregister all verification scripts and session clients from further
 *     events.
 *   - Reset the slot or video elements, and the element bounds.
 * @param {function(!OmidEvent)} sessionEventsCallback A
 *     callback for receiving session events.
 */
omidSessionInterface.registerSessionObserver =
    function(sessionEventsCallback) {};
