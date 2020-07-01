import OmsdkManager from './omsdk-manager.js';
import {MessageKeys, MessageTypes} from './constants.js';
import {VerificationSettings} from './typedefs.js';
import {parseVerificationSettings} from './query-utils.js';

/**
 * Orchestrates measurement and playback for a test video creative. The parent
 * frame messages this frame to tell it what media to load, and with which
 * verification settings to measure.
 */
class VideoCreativePageController {
  /**
   * @param {!HTMLVideoElement} videoElement The element in which to play media.
   * @param {!Element} startButton The button to use to start playback.
   */
  constructor(videoElement, startButton) {
    /** @const @private {!HTMLVideoElement} */
    this.videoElement_ = videoElement;

    /** @private {boolean} */
    this.didPressStart_ = false;

    /**
     * Manages interactions with the OMSDK. Null until an init message is
     * received from the parent frame.
     * @private {?OmsdkManager}
     */
    this.omsdkManager_ = null;

    startButton.addEventListener('click', () => this.startButtonPressed_());
    window.addEventListener(
        'message', (event) => this.didReceivePostMessage_(event));

    // Tell the parent frame that this creative has initialized.
    const loadedMessage = {
      [MessageKeys.TYPE]: MessageTypes.CREATIVE_DID_INIT,
    };
    window.parent.postMessage(loadedMessage, '*');
  }

  /**
   * Handles incoming post messages.
   * @param {!Event} event
   * @private
   */
  didReceivePostMessage_(event) {
    if (event.source != window.parent) {
      return;
    }
    const message = event.data;
    switch (message[MessageKeys.TYPE]) {
      case MessageTypes.LOAD_CREATIVE:
        const verificationSettings =
            parseVerificationSettings(message[MessageKeys.DATA]);
        if (!verificationSettings) {
          break;
        }
        this.didReceiveLoadCreativeMessage_(verificationSettings);
        break;
      default:
        break;
    }
  }

  /**
   * Handles a LOAD_CREATIVE message from the parent frame, setting up
   * measurement and media.
   * @param {!VerificationSettings} verificationSettings
   * @private
   */
  didReceiveLoadCreativeMessage_(verificationSettings) {
    this.videoElement_.src = verificationSettings.mediaUrl;
    this.videoElement_.load();
    this.omsdkManager_ =
        new OmsdkManager(verificationSettings, this.videoElement_);
  }

  /** @private */
  startButtonPressed_() {
    if (this.didPressStart_) {
      return;
    }
    this.videoElement_.play();
    this.didPressStart_ = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const videoElement = document.getElementById('videoElement');
  const startButton = document.getElementById('startButton');
  if (!(videoElement instanceof HTMLVideoElement) || !startButton) {
    throw new Error('Could not locate video elements.');
  }
  new VideoCreativePageController(videoElement, startButton);
});
