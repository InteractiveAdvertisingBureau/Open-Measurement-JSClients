/**
 * @fileoverview @externs Definition of omidSessionInterface, used for session
 * client integration with the OM SDK service script.
 */

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
 *   - Reset the slot or media elements, and the element bounds.
 * @param {function(!Object)} sessionEventsCallback A callback for receiving
 *     session events.
 */
omidSessionInterface.registerSessionObserver =
    function(sessionEventsCallback) {};

/**
 * If there is no currently active ad session, this notifies all session
 * observers that the ad session has started with a SESSION_START event. This
 * starts ad view tracking and makes media and ad events available to send to
 * verification scripts injected for this ad session.
 * This method has no effect if called after the ad session has already started.
 */

omidSessionInterface.startAdSession = function() {};

/**
 * If there is a currently active ad session, this notifies all session
 * observers that the ad session has finished with a SESSION_FINISH event. This
 * ceases ad view tracking and message sending to verification scripts injected
 * for the ad session.
 * This method has no effect if there is no active ad session.
 */

omidSessionInterface.finishAdSession = function() {};

/**
 * The client must call this if they detect a fatal error during their session.
 * This should trigger a SESSION_ERROR event to all session observers if a
 * session has started.
 * @param {string} errorType The type of session error.
 * @param {string} message A string describing the error in detail.
 */
omidSessionInterface.reportError = function(errorType, message) {};

/**
 * The client must call this before making any adEvents calls from JavaScript,
 * each time a new session is started. Otherwise, the event will be ignored.
 */
omidSessionInterface.registerAdEvents = function() {};

/**
 * The client must call this before making any mediaEvents calls from
 * JavaScript, each time a new session is started. Otherwise, the event will be
 * ignored.
 */
omidSessionInterface.registerMediaEvents = function() {};

/**
 * Injects verification scripts for the current or upcoming session.
 * The Service Script should inject these scripts only once SESSION_START has
 * occurred. The client may call this multiple times and expect the scripts to
 * be injected. If the integrator has indicated that a verification script
 * should have limited access, then the Service Script should set the sandbox
 * attribute on the verification script's iframe.sandbox to 'allow-scripts'.
 * Otherwise, it must set it to 'allow-scripts allow-same-origin'.
 * On SESSION_START, the Service Script should include the verification
 * parameters in the event data sent to verification scripts on SESSION_START.
 * The Service Script is responsible for sending the right parameters to the
 * right script, matching on vendor key.

 * @param{!Array<!Object>} verificationScriptResources An array of verification
 *     resources to execute for the current or upcoming session.
 */
omidSessionInterface.injectVerificationScriptResources =
    function(verificationScriptResources) {};

/**
 * Sets the slot element for a display creative for measurement.
 * The client may call this at any time(s). The slot element set resets after
 * SESSION_FINISH, after which the client will need to call this again. The
 * service  script must not modify this element.
 * @param {?HTMLElement} slotElement An HTMLElement accessible to the service
 *     script, or null to reset.
 */
omidSessionInterface.setSlotElement = function(slotElement) {};

/**
 * Sets the media element for a media creative for measurement.
 * The client may call this at any time(s). The media element set resets after
 * SESSION_FINISH, after which the client will need to call this again. The
 * service  script must not modify this element.
 * @param {?HTMLMediaElement} mediaElement An HTMLMediaElement accessible to the
 *     Service Script, or null to reset.
 */
omidSessionInterface.setMediaElement = function(mediaElement) {};

/**
 * Sets the DOM element's geometry relative to the geometry of either the slot
 * element or the cross domain iframe the creative's DOM element is in.
 * The client may call this at any time(s). The element bounds reset after
 * SESSION_FINISH, after which the client will need to call this again.
 * @param {?Object} elementBounds Geometry describing the element's bounds, or
 *     null to reset.
 */
omidSessionInterface.setElementBounds = function(elementBounds) {};

/**
 * Sets the creative type for the active ad session, or the next one if there is
 * no active ad session.
 * @param {?string} creativeType
 */
omidSessionInterface.setCreativeType = function(creativeType) {};

/**
 * Sets the impression type for the active ad session, or the next one if there
 * is no active ad session.
 * @param {?string} impressionType
 */
omidSessionInterface.setImpressionType = function(impressionType) {};

// The integrator may make these calls only once a session has started. Doing
// otherwise is a no-op.

omidSessionInterface.adEvents = {};
omidSessionInterface.mediaEvents = {};

/**
 * Notifies all verification providers that an impression event should be
 * recorded.
 * @throws error if the ad session has not been started.
 */
omidSessionInterface.adEvents.impressionOccurred = function() {};

/**
 * Notifies all verification providers that an ad has loaded.
 * @param {!Object=} vastProperties Must be supplied for media creative types
 *     and omitted for display creative types.
 * @see VastProperties
 */
omidSessionInterface.adEvents.loaded = function(vastProperties) {};

/**
 * Notifies all media listeners that media content has started playing.
 * @param {number} duration The duration of the selected media (in seconds).
 * @param {number} mediaPlayerVolume The volume of the media player, from 0 to
 *     1.
 * @throws error if either the supplied duration or mediaPlayerVolume are
 *     invalid.
 */
omidSessionInterface.mediaEvents.start =
    function(duration, mediaPlayerVolume) {};

/**
 * Notifies all media listeners that media playback has reached the first
 * quartile.
 */
omidSessionInterface.mediaEvents.firstQuartile = function() {};

/**
 * Notifies all media listeners that media playback has reached the midpoint.
 */
omidSessionInterface.mediaEvents.midpoint = function() {};

/**
 * Notifies all media listeners that media playback has reached the third
 * quartile.
 */
omidSessionInterface.mediaEvents.thirdQuartile = function() {};

/** Notifies all media listeners that the ad media has played to completion. */
omidSessionInterface.mediaEvents.complete = function() {};

/**
 * Notifies all media listeners that media playback has paused due to a user
 * interaction.
 */
omidSessionInterface.mediaEvents.pause = function() {};

/**
 * Notifies all media listeners that media playback has resumed due to a user
 * interaction.
 */
omidSessionInterface.mediaEvents.resume = function() {};

/**
 * Notifies all media listeners that media playback has stopped and started
 * buffering.
 */
omidSessionInterface.mediaEvents.bufferStart = function() {};

/**
 * Notifies all media listeners that buffering has finished and media playback
 * has resumed.
 */
omidSessionInterface.mediaEvents.bufferFinish = function() {};

/**
 * Notifies all media listeners that media playback has stopped due to a user
 * skip interaction. Once skipped, it should not be possible for ad media to
 * resume.
 */
omidSessionInterface.mediaEvents.skipped = function() {};

/**
 * Notifies all media listeners that the media player volume has changed.
 * @param {number} mediaPlayerVolume The volume of the media player, from 0 to
 *     1.
 * @throws error if the supplied mediaPlayerVolume is invalid.
 */
omidSessionInterface.mediaEvents.volumeChange = function(mediaPlayerVolume) {};

/**
 * Notifies all media listeners that media player state has changed.
 * @param {string} playerState The new media player state.
 * @throws error if the supplied state is undefined or null.
 * @see PlayerState
 */
omidSessionInterface.mediaEvents.playerStateChange = function(playerState) {};

/**
 * Notifies all media listeners that the user has performed an ad interaction.
 * @param {string} interactionType The type of user interaction.
 * @throws error if the supplied interaction type is undefined or null.
 */
omidSessionInterface.mediaEvents.adUserInteraction =
    function(interactionType) {};
