goog.module('omid.sessionClient.AdSession');

const Communication = goog.require('omid.common.Communication');
const Context = goog.require('omid.sessionClient.Context');
const InternalMessage = goog.require('omid.common.InternalMessage');
const OmidJsSessionInterface = goog.require('omid.sessionClient.OmidJsSessionInterface');
const Rectangle = goog.require('omid.common.Rectangle');
const VerificationScriptResource = goog.require('omid.sessionClient.VerificationScriptResource');
const argsChecker = goog.require('omid.common.argsChecker');
const logger = goog.require('omid.common.logger');
const {AdEventType, ErrorType} = goog.require('omid.common.constants');
const {Event} = goog.require('omid.common.eventTypedefs');
const {Version} = goog.require('omid.common.version');
const {deserializeMessageArgs, serializeMessageArgs} = goog.require('omid.common.ArgsSerDe');
const {generateGuid} = goog.require('omid.common.guid');
const {packageExport} = goog.require('omid.common.exporter');
const {resolveGlobalContext, startSessionServiceCommunication} = goog.require('omid.common.serviceCommunication');

/** @const {string} */
const SESSION_CLIENT_VERSION = Version;

/**
 * The JS ad session API enabling the integration partner to contribute to an
 * existing native ad session. This is also responsible for communicating to
 * the OM SDK JS service and will also handle scenarios with limited access
 * to the OM SDK JS service - i.e. cross-domain iFrames.
 * This API is commonly used in the following scenarios;
 *  - video ad session relying on the HTML5 video player for injecting
 *    verification script resources and/or publishing OMID video events.
 *  - display ad session relying on a separate JS component to handle the
 *    impression event.
 */
class AdSession {
  /**
   * @param {!Context} context that provides the required information for
   *   initialising the JS ad session.
   * @param {?Communication<?>=} communication Communication object that the
   *     VerificationClient will use to talk to the VerificationService. This
   *     parameter is useful for testing. If left unspecified, the correct
   *     Communication will be constructed and used.
   * @param {?OmidJsSessionInterface=} sessionInterface Communicates with the
   *     OMID JS Session Interface. Used for testing, and defaults to a
   *     newly constructed value.
   * @throws error if the supplied context is undefined or null.
   */
  constructor(
      context, communication = undefined, sessionInterface = undefined) {
    argsChecker.assertNotNullObject('AdSession.context', context);

    /** @private @const {!Context} */
    this.context_ = context;

    /** @private {boolean} */
    this.impressionOccurred_ = false;

    /** @private @const {?Communication} */
    this.communication_ = communication ||
        startSessionServiceCommunication(resolveGlobalContext());

    /** @private @const {!OmidJsSessionInterface} */
    this.sessionInterface_ = sessionInterface || new OmidJsSessionInterface();

    /** @private {boolean} */
    this.hasAdEvents_ = false;

    /** @private {boolean} */
    this.hasVideoEvents_ = false;

    /** @private {boolean} */
    this.isSessionRunning_ = false;

    /**
     * Map of callback guids to callbacks.
     * @type {!Object<string, function(?)>}
     * @private
     */
    this.callbackMap_ = {};

    // Listen to messages sent by the OMID SessionService communication.
    if (this.communication_) {
      this.communication_.onMessage = this.handleInternalMessage_.bind(this);
    }
    this.setClientInfo_();
    this.injectVerificationScripts_(context.verificationScriptResources);
    this.sendSlotElement_(context.slotElement);
    this.sendVideoElement_(context.videoElement);

    // Start watching session events so we know when the session is running.
    this.watchSessionEvents_();
  }

  /**
   * Returns true if OMID is available, false otherwise.
   * @return {boolean}
   */
  isSupported() {
    return Boolean(this.communication_) || this.sessionInterface_.isSupported();
  }

  /**
   * Returns true if sending elements to the service is supported, which is the
   * case when communication is between same-origin contexts.
   * @return {boolean}
   * @private
   */
  isSendingElementsSupported_() {
    return this.communication_ ? this.communication_.isDirectCommunication() :
                                 this.sessionInterface_.isSupported();
  }

  /**
   * Registers new observer for session events. The registered observer will be
   * notified for any session start or session finish events.
   * @param {function(!Event)} functionToExecute
   */
  registerSessionObserver(functionToExecute) {
    this.sendMessage('registerSessionObserver', functionToExecute);
  }

  /**
   * Allows JS ad session clients to notify verification clients of any errors.
   * Possible errorType values include; “GENERIC” and “VIDEO”.
   *
   * When calling this method all verification clients will be notified via the
   * sessionError session observer event.
   * @param {!ErrorType} errorType
   * @param {string} message
   */
  error(errorType, message) {
    this.sendOneWayMessage('sessionError', errorType, message);
  }

  /**
   * Registers the existence of an AdEvent instance.
   */
  registerAdEvents() {
    if (this.hasAdEvents_) {
      throw new Error('AdEvents already registered.');
    }
    this.hasAdEvents_ = true;
    this.sendOneWayMessage('registerAdEvents');
  }

  /**
   * Registers the existence of an VideoEvents instance.
   */
  registerVideoEvents() {
    if (this.hasVideoEvents_) {
      throw new Error('VideoEvents already registered.');
    }
    this.hasVideoEvents_ = true;
    this.sendOneWayMessage('registerVideoEvents');
  }

  /**
   * Sends a message to the OMID VerificationService and ignores responses.
   * NOTE: This method is friend scoped. Therefore it should not be exported
   * beyond obfuscation.
   * @param {string} method Name of the remote method to invoke.
   * @param {...?} args Arguments to use when invoking the remote
   *     function.
   */
  sendOneWayMessage(method, ...args) {
    this.sendMessage(method, null, ...args);
  }

  /**
   * Sends a message to the OMID SessionService.
   * NOTE: This method is friend scoped. Therefore it should not be exported
   * beyond obfuscation.
   * @param {string} method Name of the remote method to invoke.
   * @param {?function(...?)} responseCallback Callback to be called when a
   *     response is received.
   * @param {...?} args Arguments to use when invoking the remote function.
   */
  sendMessage(method, responseCallback, ...args) {
    if (this.communication_) {
      this.sendInternalMessage_(method, responseCallback, args);
    } else if (this.sessionInterface_.isSupported()) {
      this.sendInterfaceMessage_(method, responseCallback, args);
    }
  }

  /**
   * Sends a message to the OMID SessionService via internal OM SDK
   * communication.
   * @param {string} method The name of the method to call.
   * @param {?function(...?)} responseCallback A callback invoked on certain
   *     messages that send responses back.
   * @param {!Array<?>} args The arguments of the method.
   * @private
   */
  sendInternalMessage_(method, responseCallback, args) {
    const guid = generateGuid();
    if (responseCallback) {
      this.callbackMap_[guid] = responseCallback;
    }
    const message = new InternalMessage(
        guid, `SessionService.${method}`, SESSION_CLIENT_VERSION,
        serializeMessageArgs(SESSION_CLIENT_VERSION, args));
    this.communication_.sendMessage(message);
  }

  /**
   * Handles an incoming internal OM SDK message from the OMID SessionService.
   * @param {!InternalMessage} message The incoming message.
   * @param {?} from The sender of the message.
   * @private
   */
  handleInternalMessage_(message, from) {
    const {method, guid, args} = message;
    if (method === 'response' && this.callbackMap_[guid]) {
      // Clients deserialize messages based on their own version, which is this
      // SESSION_CLIENT_VERSION in this case.
      // The service will serde the message based on the clients' initiated
      // message version
      const parsedArgs = deserializeMessageArgs(SESSION_CLIENT_VERSION, args);
      this.callbackMap_[guid].apply(this, parsedArgs);
    }
    if (method === 'error') {
      if (window.console) logger.error(args);
    }
  }

  /**
   * Sends a message to the OMID SessionService via the JS Session Interface.
   * @param {string} method The name of the method to call.
   * @param {?function(...?)} responseCallback A callback invoked on certain
   *     messages that send responses back.
   * @param {!Array<?>} args The arguments of the method.
   * @private
   */
  sendInterfaceMessage_(method, responseCallback, args) {
    try {
      this.sessionInterface_.sendMessage(method, responseCallback, args);
    } catch (error) {
      logger.error('Failed to communicate with SessionInterface with error:');
      logger.error(error);
    }
  }

  /**
   * Throws an error if the session is not running.
   * NOTE: This method is friend scoped. Therefore it should not be exported
   * beyond obfuscation.
   */
  assertSessionRunning() {
    if (!this.isSessionRunning_) {
      throw new Error('Session not started.');
    }
  }

  /**
   * Handles when an impression has occured.
   * Sets a flag of this class so that it can remember that an impression has
   * occured.
   * NOTE: This method is friend scoped. Therefore it should not be exported
   * beyond obfuscation.
   */
  impressionOccurred() {
    this.impressionOccurred_ = true;
  }

  /** Sends initial information about the session client to the JS service. */
  setClientInfo_() {
    this.sendOneWayMessage('setClientInfo', SESSION_CLIENT_VERSION,
        this.context_.partner.name, this.context_.partner.version);
  }

  /**
   * Requests the JS service to inject the verification script resources. This
   * happens either by the service appending <script> tags if a window is
   * available, or by invoking the native layer.
   * @param {?Array<!VerificationScriptResource>} verificationScriptResources
   * @throws error if the verificationScriptResources array is undefined, null
   *     or empty
   * @private
   */
  injectVerificationScripts_(verificationScriptResources) {
    if (!verificationScriptResources) return;
    const resourceUrls = verificationScriptResources.map(
        (resource) => ({
          'resourceUrl': resource.resourceUrl,
          'vendorKey': resource.vendorKey,
          'verificationParameters': resource.verificationParameters,
        }));
    this.sendOneWayMessage(
        'injectVerificationScriptResources', resourceUrls);
  }

  /**
   * Sends the ad creative DOM element to the service, if sending elements is
   * supported.
   * @param {?HTMLElement} element The ad creative DOM element
   * @private
   */
  sendSlotElement_(element) {
    this.sendElement_(element, 'setSlotElement');
  }

  /**
   * Sends the video DOM element to the service, if sending elements is
   * supported.
   * @param {?HTMLVideoElement} element The video DOM element
   * @private
   */
  sendVideoElement_(element) {
    this.sendElement_(element, 'setVideoElement');
  }

  /**
   * Sends the given DOM element to the service with the given method, if
   * sending elements is supported.
   * @param {?HTMLElement} element The DOM element to send.
   * @param {string} method The method with which to send the element.
   * @private
   */
  sendElement_(element, method) {
    if (!element) {
      return;
    }
    if (!this.isSendingElementsSupported_()) {
      this.error(ErrorType.GENERIC,
          `Session Client ${method} called when communication is cross-origin`);
      return;
    }
    this.sendOneWayMessage(method, element);
  }

  /**
   * Set the DOM element's geometry relative to the geometry of either the
   * slotElement or the cross domain iframe the creative's DOM element is in.
   * @param {?Rectangle} elementBounds
   * @throws Error if the elementBounds parameter is null or undefined.
   */
  setElementBounds(elementBounds) {
    argsChecker.assertNotNullObject('AdSession.elementBounds', elementBounds);
    this.sendOneWayMessage('setElementBounds', elementBounds);
  }

  /**
   * Watches the session start and stop events so that the class can know
   * whether the session is running or not.
   * @private
   */
  watchSessionEvents_() {
    // Watch for session events.
    this.registerSessionObserver((event) => {
      if (event['type'] === AdEventType.SESSION_START) {
        this.isSessionRunning_ = true;
      }
      if (event['type'] === AdEventType.SESSION_FINISH) {
        this.isSessionRunning_ = false;
      }
    });
  }
}

packageExport('OmidSessionClient.AdSession', AdSession);
exports = AdSession;
