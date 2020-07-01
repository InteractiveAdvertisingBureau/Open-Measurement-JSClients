import {AccessMode, VerificationSettingsKeys} from './constants.js';
import {MessageKeys, MessageTypes} from './constants.js';
import {VerificationSettings} from './typedefs.js';

/** Orchestrates creation of and communication with an iframed creative. */
class CreativeIframeHost {
  /**
   * @param {!VerificationSettings} verificationSettings The settings to use for
   *     the creative and its measurement.
   */
  constructor(verificationSettings) {
    /** @private @const {!VerificationSettings} */
    this.verificationSettings_ = verificationSettings;

    /** @const {!HTMLIFrameElement} */
    this.iframe = this.createCreativeIframe_();

    window.addEventListener(
        'message', (event) => this.didReceivePostMessage_(event));
  }

  /**
   * Builds an iframe containing the test creative.
   * @return {!HTMLIFrameElement}
   * @private
   */
  createCreativeIframe_() {
    const iframe =
        /** @type {!HTMLIFrameElement} */ (document.createElement('iframe'));
    iframe.id = 'creativeIframe';
    iframe.src = this.buildCreativeIframeUrl_();
    return iframe;
  }

  /**
   * @return {string}
   * @private
   */
  buildCreativeIframeUrl_() {
    // If creative or limited access, use a different port to load the creative
    // iframe in a separate origin. This is needed since same origin-ness is
    // lost between srcdoc iframe parent and children, even when
    // allow-same-origin is specified.
    const port =
        this.verificationSettings_.accessMode == AccessMode.FULL ? 8080 : 8081;
    return `//localhost:${port}/${
        this.verificationSettings_.testCasePageName}.html`;
  }

  /**
   * Handles incoming post messages.
   * @param {!Event} event
   * @private
   */
  didReceivePostMessage_(event) {
    if (event.source != this.iframe.contentWindow) {
      return;
    }
    const message = event.data;
    switch (message[MessageKeys.TYPE]) {
      case MessageTypes.CREATIVE_DID_INIT:
        this.didReceiveCreativeDidInit_();
        break;
      default:
        break;
    }
  }

  /**
   * Handles a CREATIVE_DID_INIT message from the creative iframe.
   * @private
   */
  didReceiveCreativeDidInit_() {
    // Now that the creative is listening for post messages, send it the
    // information it needs to load the creative and measurement.
    const settings = this.verificationSettings_;
    const initMessage = {
      [MessageKeys.TYPE]: MessageTypes.LOAD_CREATIVE,
      [MessageKeys.DATA]: {
        [VerificationSettingsKeys.ACCESS_MODE]: settings.accessMode,
        [VerificationSettingsKeys.MEDIA_URL]: settings.mediaUrl,
        [VerificationSettingsKeys.OMSDK_URL]: settings.omsdkUrl,
        [VerificationSettingsKeys.TEST_CASE_PAGE_NAME]:
            settings.testCasePageName,
        [VerificationSettingsKeys.VENDOR_KEY]: settings.vendorKey,
        [VerificationSettingsKeys.VERIFICATION_PARAMETERS]:
            settings.verificationParameters,
        [VerificationSettingsKeys.VERIFICATION_SCRIPT_URL]:
            settings.verificationScriptUrl,
      },
    };
    this.iframe.contentWindow.postMessage(initMessage, '*');
  }
}

export default CreativeIframeHost;
