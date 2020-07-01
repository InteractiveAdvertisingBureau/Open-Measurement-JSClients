const AdSession = goog.require('omid.sessionClient.AdSession');
const AdEvents = goog.require('omid.sessionClient.AdEvents');
const Context = goog.require('omid.sessionClient.Context');
const MediaEvents = goog.require('omid.sessionClient.MediaEvents');
const Partner = goog.require('omid.sessionClient.Partner');
const VastProperties = goog.require('omid.common.VastProperties');
const {AccessMode: OmidAccessMode, ErrorType, VideoPosition} = goog.require('omid.common.constants');
const {resolveGlobalContext} = goog.require('omid.common.windowUtils');
const {startSessionServiceCommunication} = goog.require('omid.common.serviceCommunication');

import {AccessMode} from './constants.js';
import {OmidPartnerName, OmidPartnerVersion} from './constants.js';
import {VerificationSettings} from './typedefs.js';

/**
 * HTML video element events to listen for relevent for measurement.
 * @const {!Array<string>}
 */
const VIDEO_EVENT_TYPES = [
  'error',
  'loadeddata',
  'timeupdate',
];

/**
 * Manages measurement integration with the OM SDK.
 *
 * NOTE: This is a simplified OMSDK integration, without allowance for user
 * pause/resume, skips, volume changes, clicks, or interactions. A creative that
 * featured these capabilities would have to also integrate with those
 * respective OMID APIs.
 */
class OmsdkManager {
  /**
   * @param {!VerificationSettings} verificationSettings The settings to use for
   *     the creative and its measurement.
   * @param {!HTMLVideoElement} videoElement The video element to measure.
   */
  constructor(verificationSettings, videoElement) {
    /** @private @const {!VerificationSettings} */
    this.verificationSettings_ = verificationSettings;

    /** @private @const {!HTMLVideoElement} */
    this.videoElement_ = videoElement;

    /** @private {?AdSession} */
    this.adSession_ = null;

    /** @private {?AdEvents} */
    this.adEvents_ = null;

    /** @private {?MediaEvents} */
    this.mediaEvents_ = null;

    /**
     * The last observed currentTime of the video element.
     * @private {number}
     */
    this.lastVideoTime_ = -1;

    /**
     * The friendly iframe containing the OMSDK.
     * @private @const {!HTMLIFrameElement}
     */
    this.omsdkIframe_ = this.createOmsdkIframe_();

    this.omsdkIframe_.addEventListener(
        'load', () => this.omsdkIframeDidLoad_());
    document.body.appendChild(this.omsdkIframe_);

    VIDEO_EVENT_TYPES.forEach((eventType) => {
      this.videoElement_.addEventListener(
          eventType, (event) => this.videoElementDidDispatchEvent_(event));
    });
  }

  /**
   * Builds a friendly iframe in which to run the OMSDK.
   * @return {!HTMLIFrameElement}
   * @private
   */
  createOmsdkIframe_() {
    const iframe =
        /** @type {!HTMLIFrameElement}*/ (document.createElement('iframe'));
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.style.display = 'none';
    iframe.srcdoc =
        `<script src=${this.verificationSettings_.omsdkUrl}></script>`;
    return iframe;
  }

  /**
   * Handles loading of the OMSDK iframe, starting the ad session.
   * @private
   */
  omsdkIframeDidLoad_() {
    this.adSession_ = this.createAdSession_();
    this.adEvents_ = new AdEvents(this.adSession_);
    this.mediaEvents_ = new MediaEvents(this.adSession_);
    // TODO: Use AdSession_.start when publicly released.
    this.adSession_.sendOneWayMessage('startSession', {});
  }

  /**
   * Creates a new ad session, with the settings provided at construction time.
   * @return {!AdSession}
   * @private
   */
  createAdSession_() {
    const partner = new Partner(OmidPartnerName, OmidPartnerVersion);
    const context = new Context(partner, []);
    context.setVideoElement(this.videoElement_);
    const serviceWindow = this.omsdkIframe_.contentWindow;
    if (!serviceWindow) {
      throw new Error('OM SDK iframe content window not available.');
    }

    // TODO: Use Context.setServiceWindow when publicly released.
    const serviceCommunication =
        startSessionServiceCommunication(resolveGlobalContext(), serviceWindow);

    const adSession = new AdSession(context, serviceCommunication);

    // TODO: Use VerificationScriptResource constructor when publicly released.
    const injectData = [
      {
        'resourceUrl': this.verificationSettings_.verificationScriptUrl,
        'vendorKey': this.verificationSettings_.vendorKey,
        'verificationParameters':
            this.verificationSettings_.verificationParameters,
        'accessMode': this.getOmidAccessMode_(),
      },
    ];
    adSession.sendOneWayMessage(
        'injectVerificationScriptResources', injectData);

    return adSession;
  }

  /**
   * Calculates the OMID access mode from the settings' access mode.
   * @return {!OmidAccessMode}
   * @private
   */
  getOmidAccessMode_() {
    switch (this.verificationSettings_.accessMode) {
      case AccessMode.LIMITED:
        return OmidAccessMode.LIMITED;
      case AccessMode.DOMAIN:
        return OmidAccessMode.DOMAIN;
      case AccessMode.CREATIVE:
      case AccessMode.FULL:
      default:
        return OmidAccessMode.FULL;
    }
  }

  /**
   * Handles events fired by the measured video element, reporting to the OMSDK
   * as necessary.
   * @param {!Event} event
   * @private
   */
  videoElementDidDispatchEvent_(event) {
    if (!this.adSession_ || !this.adEvents_ || !this.mediaEvents_) {
      return;
    }
    switch (event.type) {
      case 'error':
        this.adSession_.error(
            ErrorType.VIDEO, this.videoElement_.error.message);
        break;
      case 'loadeddata':
        const vastProperties = new VastProperties(
            /* isSkippable= */ false, /* skipOffset= */ 0,
            /* isAutoPlay= */ false, VideoPosition.PREROLL);
        this.adEvents_.loaded(vastProperties);
        break;
      case 'timeupdate':
        this.videoElementDidDispatchTimeUpdate_();
        break;
      default:
        break;
    }
  }

  /**
   * Handles a timeupdate event from the measured video element.
   * @private
   */
  videoElementDidDispatchTimeUpdate_() {
    if (!this.adEvents_ || !this.mediaEvents_ ||
        this.videoElement_.playbackRate == 0) {
      return;
    }
    // Check if playback has crossed a quartile threshold, and report that to
    // the OMSDK.
    const currentVideoTime =
        this.videoElement_.currentTime / this.videoElement_.duration;
    if (this.lastVideoTime_ < 0 && currentVideoTime >= 0) {
      this.adEvents_.impressionOccurred();
      this.mediaEvents_.start(
          this.videoElement_.duration, this.videoElement_.volume);
    } else if (this.lastVideoTime_ < 0.25 && currentVideoTime >= 0.25) {
      this.mediaEvents_.firstQuartile();
    } else if (this.lastVideoTime_ < 0.5 && currentVideoTime >= 0.5) {
      this.mediaEvents_.midpoint();
    } else if (this.lastVideoTime_ < 0.75 && currentVideoTime >= 0.75) {
      this.mediaEvents_.thirdQuartile();
    } else if (this.lastVideoTime_ < 1 && currentVideoTime >= 1) {
      this.mediaEvents_.complete();
    }

    this.lastVideoTime_ = currentVideoTime;
  }
}

export default OmsdkManager;
