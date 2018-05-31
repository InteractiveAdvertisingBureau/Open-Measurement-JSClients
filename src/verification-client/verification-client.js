goog.module('omid.verificationClient.VerificationClient');

const Communication = goog.require('omid.common.Communication');
const InternalMessage = goog.require('omid.common.InternalMessage');
const logger = goog.require('omid.common.logger');
const {AdEventType} = goog.require('omid.common.constants');
const {ImpressionCallback, GeometryChangeCallback, VideoCallback, SessionObserverCallback} = goog.require('omid.common.eventTypedefs');
const {assertTruthyString, assertFunction, assertPositiveNumber} = goog.require('omid.common.argsChecker');
const {startServiceCommunication} = goog.require('omid.common.serviceCommunication');
const {packageExport} = goog.require('omid.common.exporter');
const {serializeMessageArgs, deserializeMessageArgs} = goog.require('omid.common.ArgsSerDe');
const {Version} = goog.require('omid.common.version');
const {omidGlobal} = goog.require('omid.common.OmidGlobalProvider');

/** @type {string} */
const VERIFICATION_CLIENT_VERSION = Version;

/**
 * @typedef {!ImpressionCallback|
 *           !GeometryChangeCallback|
 *           !VideoCallback}
 */
let EventCallback;

/**
 * OMID VerificationClient.
 * Allows verification scripts to interact with the OM SDK Service.
 */
class VerificationClient {
  /**
   * @param {?Communication<?>} communication Communication object that the
   *     VerificationClient will use to talk to the VerificationService. This
   *     parameter is useful for testing. If left unspecified, the correct
   *     Communication will be constructed and used.
   */
  constructor(
      communication = startServiceCommunication(
          omidGlobal, ['omid', 'v1_VerificationServiceCommunication'])) {
    this.communication = communication;
    if (this.communication) {
      this.communication.onMessage = this.handleMessage_.bind(this);
    }

    // Create counters so that we can assign local IDs to timeouts and
    // intervals.
    /** @private */
    this.remoteTimeouts_ = 0;
    /** @private */
    this.remoteIntervals_ = 0;

    /**
     * Map of callback guids to callbacks.
     * @type {!Object<string, function(?)>}
     * @private
     */
    this.callbackMap_ = {};
  }

  /**
   * Checks if OMID is available.
   * @return {boolean}
   */
  isSupported() {
    return Boolean(this.communication);
  }

  /**
   * Registers a callback for  session start and finish events triggered by the
   * native ad session.
   *
   * This enables the JS component to keep in sync with the native layer - for
   * example, ensure that the ad session has started prior to recording the
   * impression event.
   * @param {SessionObserverCallback} functionToExecute Called once
   *     either the session start or finish has been received.
   * @param {string=} vendorKey
   * @throws error if the function to execute is undefined or null.
   * @throws error if the vendor key is undefined, null or blank.
   */
  registerSessionObserver(functionToExecute, vendorKey = undefined) {
    assertFunction('functionToExecute', functionToExecute);
    this.sendMessage_('addSessionListener', functionToExecute, vendorKey);
  }

  /**
   * Registers an event listener.
   *
   * Possible event types include:
   *  - stateChange
   *  - impression
   *  - geometryChange
   *  - video
   * @param {!AdEventType} eventType Event type to listen to.
   * @param {!EventCallback} functionToExecute Callback to execute when the
   *     event fires.
   * @throws error if the event type is undefined, null or blank.
   * @throws error if the function to execute is undefined or null.
   */
  addEventListener(eventType, functionToExecute) {
    assertTruthyString('eventType', eventType);
    assertFunction('functionToExecute', functionToExecute);
    this.sendMessage_('addEventListener', functionToExecute, eventType);
  }

  /**
   * Requests the target URL.
   *
   * This can be used to transmit data to a remote server by requesting a URL
   * with the payload embeded into the URL as query arg(s).
   * @param {string} url which should be requested.
   * @param {function()=} successCallback function to be executed when the
   *     request has been successful.
   * @param {function()=} failureCallback function to be executed when the
   *     request has failed.
   * @throws error if the url is undefined, null or blank.
   */
  sendUrl(url, successCallback = undefined, failureCallback = undefined) {
    assertTruthyString('url', url);
    this.sendMessage_(
        'sendUrl', (success) => {
          if (success && successCallback) {
            successCallback();
          } else if (!success && failureCallback) {
            failureCallback();
          }
        }, url);
  }

  /**
   * Injects the supplied JavaScript resource into the same execution
   * environment as the verification provider.
   *
   * For all DOM based environments (incl. Android native ad sessions) this will
   * append <script> elements to the DOM.
   * For native ad sessions this will delegate responsibility to the OM SDK
   * library which will be responsible for downloading and injecting the
   * JavaScript content into the execution environment.
   * @param {string} url of the JavaScript resource you would like injected into
   *     the execution environment.
   * @param {function()=} successCallback Called when the HTTP request is
   *     successful. Does not indicate whether the script evaluation was
   *     successful.
   * @param {function()=} failureCallback
   * @throws error if the supplied URL is undefined, null or blank.
   */
  injectJavaScriptResource(
      url, successCallback, failureCallback) {
    assertTruthyString('url', url);
    if (omidGlobal.document) {
      this.injectJavascriptResourceUrlInDom_(
          url, successCallback, failureCallback);
    } else {
      this.sendMessage_(
          'injectJavaScriptResource', (success, contents) => {
            // Check for resource load failure.
            if (!success) {
              logger.error('Service failed to load JavaScript resource.');
              failureCallback();
              return;
            }

            this.evaluateJavaScript_(contents, url);
            successCallback();
          }, url);
    }
  }

  /**
   * Inject the supplied javascript resource in the DOM.
   * @param {string} url
   * @param {function()=} successCallback
   * @param {function()=} failureCallback
   * @private
   */
  injectJavascriptResourceUrlInDom_(url, successCallback, failureCallback) {
    const document = omidGlobal.document;
    const body = document.body;

    // Create the script tag and load the content, while listening to the onload
    // and onerror events as measures of success. Note that if the parsing of
    // the script fails, the onload event will still fire. Success only
    // indicates HTTP success.
    const scriptNode = document.createElement('script');
    // Type expected for onload/onerror callbacks is slightly different
    scriptNode.onload =
        /** @type {function ((Event|null)): ?|null} */ (successCallback);
    scriptNode.onerror =
        /** @type {function ((Event|null)): ?|null} */ (failureCallback);
    scriptNode.src = url;
    scriptNode.type = 'application/javascript';

    body.appendChild(scriptNode);
  }

  /**
   * Inject the supplied javascript resource in the DOM.
   * @param {string} javaScript
   * @param {string} url
   * @private
   */
  evaluateJavaScript_(javaScript, url) {
    try {
      eval(javaScript);
    } catch (error) {
      logger.error(`Error evaluating the JavaScript resource from "${url}".`);
    }
  }

  /**
   * Calls a function after the specified time has elapsed.
   * @param {function()} functionToExecute which should be executed once the
   *     timeout has been reached.
   * @param {number} timeInMillis which you would like to wait before the
   *     callback function will be executed
   * @return {number} a unique timeout id which can be used with clearTimeout to
   *     cancel the function execution.
   * @throws error if the function to execute is undefined or null.
   * @throws error if the time in millis is undefined, null or a non-positive
   *     number.
   */
  setTimeout(functionToExecute, timeInMillis) {
    assertFunction('functionToExecute', functionToExecute);
    assertPositiveNumber('timeInMillis', timeInMillis);

    if (this.hasTimeoutMethods_()) {
      return omidGlobal.setTimeout(functionToExecute, timeInMillis);
    }

    const id = this.remoteTimeouts_++;
    this.sendMessage_('setTimeout', functionToExecute, id, timeInMillis);
    return id;
  }

  /**
   * Cancels a timeout before it has been executed.
   * @param {number} timeoutId which should be canceled.
   * @throws error if the timeout id is undefined, null or a non-positive
   *     number.
   */
  clearTimeout(timeoutId) {
    assertPositiveNumber('timeoutId', timeoutId);

    if (this.hasTimeoutMethods_()) {
      omidGlobal.clearTimeout(timeoutId);
      return;
    }

    this.sendOneWayMessage_('clearTimeout', timeoutId);
  }

  /**
   * Schedules a function to be called repeatedly at a specified interval.
   * @param {function()} functionToExecute which should be executed once the
   *     interval has been reached.
   * @param {number} timeInMillis which you would like to wait before the
   *     callback function will be executed
   * @return {number} a unique interval id which can be used to cancel the
   *     function execution.
   * @throws error if the function to execute is undefined or null.
   * @throws error if the time in millis is undefined, null or a non-positive
   *     number.
   */
  setInterval(functionToExecute, timeInMillis) {
    assertFunction('functionToExecute', functionToExecute);
    assertPositiveNumber('timeInMillis', timeInMillis);

    if (this.hasIntervalMethods_()) {
      return omidGlobal.setInterval(functionToExecute, timeInMillis);
    }

    const id = this.remoteIntervals_++;
    this.sendMessage_('setInterval', functionToExecute, id, timeInMillis);
    return id;
  }

  /**
   * Stops a function execution interval set by `setInterval`.
   * @param {number} intervalId which should be stopped.
   * @throws error if the timeout id is undefined, null or a non-positive
   *     number.
   */
  clearInterval(intervalId) {
    assertPositiveNumber('intervalId', intervalId);

    if (this.hasIntervalMethods_()) {
      omidGlobal.clearInterval(intervalId);
      return;
    }

    this.sendOneWayMessage_('clearInterval', intervalId);
  }

  /**
   * Checks to see if intrinsic timeout methods are defined in the local
   * execution context.
   * @return {boolean} Whether setTimeout and clearTimeout are defined.
   * @protected
   */
  hasTimeoutMethods_() {
    return typeof omidGlobal.setTimeout === 'function' &&
        typeof omidGlobal.clearTimeout === 'function';
  }

  /**
   * Checks to see if intrinsic interval methods are defined in the local
   * execution context.
   * @return {boolean} Whether setInterval and clearInterval are defined.
   * @protected
   */
  hasIntervalMethods_() {
    return typeof omidGlobal.setInterval === 'function' &&
        typeof omidGlobal.clearInterval === 'function';
  }

  /**
   * Handles an incomming post message.
   * @param {!InternalMessage} message
   * @param {?} from Who sent the message.
   * @private
   */
  handleMessage_(message, from) {
    const {method, guid, args} = message;
    if (method === 'response' && this.callbackMap_[guid]) {
      // Clients deserialize messages based on their own version, which is this
      // VERIFICATION_CLIENT_VERSION in this case.
      // The service will serde the message based on the clients' initiated
      // message version
      const deserializedArgs = deserializeMessageArgs(
          VERIFICATION_CLIENT_VERSION, args);
      this.callbackMap_[guid].apply(this, deserializedArgs);
    }
    if (method === 'error') {
      if (window.console) logger.error(args);
    }
  }

  /**
   * Sends a message to the OMID VerificationService and ignores responses.
   * @param {string} method Name of the remote method to invoke.
   * @param {...?} args Arguments to use when invoking the remote
   *     function.
   * @private
   */
  sendOneWayMessage_(method, ...args) {
    this.sendMessage_(method, null, ...args);
  }

  /**
   * Sends a message to the OMID VerificationService.
   * @param {string} method Name of the remote method to invoke.
   * @param {?function(...?)} responseCallback Callback to be called when
   *     a response is received.
   * @param {...?} args Arguments to use when invoking the remote function.
   * @private
   */
  sendMessage_(method, responseCallback, ...args) {
    if (!this.isSupported()) return;

    const guid = this.communication.generateGuid();
    if (responseCallback) {
      this.callbackMap_[guid] = responseCallback;
    }

    const message = new InternalMessage(
        guid,
        `VerificationService.${method}`,
        VERIFICATION_CLIENT_VERSION,
        serializeMessageArgs(VERIFICATION_CLIENT_VERSION, args));
    this.communication.sendMessage(message);
  }
}

packageExport('OmidVerificationClient', VerificationClient);
exports = VerificationClient;
