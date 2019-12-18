goog.module('omid.sessionClient.Context');

const argsChecker = goog.require('omid.common.argsChecker');
const Partner = goog.require('omid.sessionClient.Partner');
const VerificationScriptResource = goog.require('omid.sessionClient.VerificationScriptResource');
const {packageExport} = goog.require('omid.common.exporter');

/**
 * Holds information provided into the ad session context by the JavaScript
 * layer.
 */
class Context {
  /**
   * Create a new ad session context providing reference to partner and a list
   * of script resources which should be managed by OM SDK service.
   * @param {!Partner} partner
   * @param {?Array<!VerificationScriptResource>} verificationScriptResources
   * @param {?string=} contentUrl The provided content url needed if OMSDK
   * is running in cross-domain. Defaults to null.
   * @param {?string=} customReferenceData Arbitrary reference data the
   * integrator can share with verification scripts. Has no effect in
   * mobile app environment. Defaults to null.
   * @throws error if the supplied partner is undefined or null.
   */
  constructor(partner, verificationScriptResources, contentUrl = null,
    customReferenceData = null) {
    argsChecker.assertNotNullObject('Context.partner', partner);

    this.partner = partner;
    this.verificationScriptResources = verificationScriptResources;
    /** @type {?HTMLElement} */
    this.slotElement = null;
    /** @type {?HTMLVideoElement} */
    this.videoElement = null;
    /** @type {?string} */
    this.contentUrl = contentUrl;
    /** @type {?string} */
    this.customReferenceData = customReferenceData;
  }

  /**
   * Specifies the video element within the WebView.
   * @param {?HTMLVideoElement} videoElement The video element
   */
  setVideoElement(videoElement) {
    argsChecker.assertNotNullObject('Context.videoElement', videoElement);
    this.videoElement = videoElement;
  }
  /**
   * Specifies the ad creative HTML element within the WebView.
   * @param {?HTMLElement} slotElement The ad creative DOM element
   */
  setSlotElement(slotElement) {
    argsChecker.assertNotNullObject('Context.slotElement', slotElement);
    this.slotElement = slotElement;
  }
}

packageExport('OmidSessionClient.Context', Context);
exports = Context;
