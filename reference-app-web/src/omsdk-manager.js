const AdSession = goog.require('omid.sessionClient.AdSession');
const AdEvents = goog.require('omid.sessionClient.AdEvents');
const Context = goog.require('omid.sessionClient.Context');
const MediaEvents = goog.require('omid.sessionClient.MediaEvents');
const Partner = goog.require('omid.sessionClient.Partner');
const UniversalAdId = goog.require('omid.sessionClient.UniversalAdId');
const VastProperties = goog.require('omid.common.VastProperties');
const VerificationScriptResource = goog.require('omid.sessionClient.VerificationScriptResource');
const {AccessMode: OmidAccessMode, ImpressionType, InteractionType, CreativeType, ErrorType, VideoPlayerState, VideoPosition} = goog.require('omid.common.constants');
import {AccessMode, OmidPartnerName, OmidPartnerVersion, UniversalAdIdValue, UniversalAdIdRegistry} from './constants.js';
import {VerificationSettings} from './typedefs.js';

/**
 * HTML video element events to listen for relevant for measurement.
 * @const {!Array<string>}
 */
const VIDEO_EVENT_TYPES = [
  'error',
  'loadeddata',
  'timeupdate',
  'volumechange',
  'click',
  'pause',
  'play',
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'msfullscreenchange',
];

/**
 * Manages measurement integration with the OM SDK.
 *
 * NOTE: This is a simplified OMSDK integration, without allowance for user
 * skips, or interactions. A creative that featured these capabilities would 
 * have to also integrate with those respective OMID APIs.
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

    const omsdkScript = this.createOmsdkScript_();
    omsdkScript.addEventListener('load', () => this.omsdkScriptDidLoad_());
    document.head.appendChild(omsdkScript);

    VIDEO_EVENT_TYPES.forEach((eventType) => {
      this.videoElement_.addEventListener(
          eventType, (event) => this.videoElementDidDispatchEvent_(event));
    });
  }

  /**
   * Builds a script tag which loads the OM SDK service.
   * @return {!HTMLScriptElement}
   * @private
   */
  createOmsdkScript_() {
    const script =
        /** @type {!HTMLScriptElement} */ (document.createElement('script'));
    script.src = this.verificationSettings_.omsdkUrl;
    return script;
  }

  /**
   * Handles loading of the OMSDK service, starting the ad session.
   * @private
   */
  omsdkScriptDidLoad_() {
    this.adSession_ = this.createAdSession_();
    this.adSession_.setCreativeType(CreativeType.VIDEO);
    // See impression type documentation to determine which type you should use.
    this.adSession_.setImpressionType(ImpressionType.BEGIN_TO_RENDER);
    this.adEvents_ = new AdEvents(this.adSession_);
    this.mediaEvents_ = new MediaEvents(this.adSession_);
    this.adSession_.start();
  }

  /**
   * Creates a new ad session, with the settings provided at construction time.
   * @return {!AdSession}
   * @private
   */
  createAdSession_() {
    const partner = new Partner(OmidPartnerName, OmidPartnerVersion);
    const verificationScriptResource = new VerificationScriptResource(
        this.verificationSettings_.verificationScriptUrl,
        this.verificationSettings_.vendorKey,
        this.verificationSettings_.verificationParameters,
        this.getOmidAccessMode_());
    const contentUrl = this.verificationSettings_.contentUrl || null;
    const customReferenceData = 'cust=ref&data=frominteg';
    const universalAdId = new UniversalAdId(UniversalAdIdValue, UniversalAdIdRegistry);
    const context = new Context(
        partner, [verificationScriptResource], contentUrl, customReferenceData, universalAdId);
    context.underEvaluation = true;
    context.setVideoElement(this.videoElement_);

    const adSession = new AdSession(context);
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
      case 'click':
        this.mediaEvents_.adUserInteraction(InteractionType.CLICK);
        break;
      case 'pause':
        if (!this.videoElement_.ended) {
          this.mediaEvents_.pause();
        }
        break;
      case 'play':
        if (this.videoElement_.currentTime != 0) {
          this.mediaEvents_.resume();
        }
        break;
      case 'volumechange':
        this.mediaEvents_.volumeChange(this.videoElement_.volume);
        break;
      case 'fullscreenchange':
      case 'webkitfullscreenchange':
      case 'mozfullscreenchange':
      case 'msfullscreenchange': 
        this.videoPlayerStateDidChange_();
        break;
      default:
        break;
    }
  }
  
  /**
   * Handles player state change event from the measured video element
   * @private
   */
  videoPlayerStateDidChange_() {
    const isFullscreen = document.fullscreenElement !== null || document.mozFullScreen ||
        document.webkitIsFullScreen || document.msFullScreen;
    const playerState = isFullscreen ? VideoPlayerState.FULLSCREEN : VideoPlayerState.NORMAL;
    this.mediaEvents_.playerStateChange(playerState);
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
      // Wait 3s, then finish the session.
      setTimeout(() => {
        this.adSession_.finish();
      }, 3000);
    }

    this.lastVideoTime_ = currentVideoTime;
  }
}

export default OmsdkManager;
