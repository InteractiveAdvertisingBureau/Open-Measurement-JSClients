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
   * @param {!HTMLInputElement} volumeControl The control to use to change player volume.
   * @param {!HTMLButtonElement} startButton The button to use to start playback.
   * @param {!HTMLButtonElement} clickButton The button to use for user interaction.
   * @param {!HTMLButtonElement} playPauseButton The button to use to play, pause media.
   * @param {!HTMLButtonElement} fullscreenButton The button to use to change player fullscreen, normal mode.
   */
  constructor(videoElement, volumeControl, startButton, clickButton,
      playPauseButton, fullscreenButton) {
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

    /** @private {!HTMLInputElement} */
    this.volumeControl_ = volumeControl;

    /** @private {!HTMLButtonElement} */
    this.playPauseButton_ = playPauseButton;

    volumeControl.addEventListener('change', () => this.changeVolume_());
    volumeControl.addEventListener('input', () => this.changeVolume_());
    startButton.addEventListener('click', () => this.startButtonPressed_());
    clickButton.addEventListener('click', () => this.clickButtonPressed_());
    playPauseButton.addEventListener('click', () => this.playPauseButtonPressed_());
    fullscreenButton.addEventListener('click', () => this.fullscreenButtonPressed_());
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

  /** @private */
  clickButtonPressed_() {
    this.videoElement_.click();
  }

  /** @private */
  playPauseButtonPressed_() {
    if (!this.didPressStart_) {
      return;
    }
    if (this.videoElement_.paused) {
      this.playPauseButton_.innerHTML = '<h3>Pause</h3>';
      this.videoElement_.play();
    } else {
      this.playPauseButton_.innerHTML = '<h3>Resume</h3>';
      this.videoElement_.pause();
    }
  }

  /** @private */
  fullscreenButtonPressed_() {
    if (document.fullscreenEnabled || document.mozFullscreenEnabled ||
        document.webkitFullscreenEnabled || document.msFullscreenEnabled) {
      if (this.videoElement_.requestFullscreen) {
        this.videoElement_.requestFullscreen();
      } else if (this.videoElement_.webkitRequestFullscreen) {
        this.videoElement_.webkitRequestFullscreen();
      } else if (this.videoElement_.msRequestFullscreen) {
        this.videoElement_.msRequestFullscreen();
      } else if (this.videoElement_.mozRequestFullscreen) {
        this.videoElement_.mozRequestFullscreen();
      }
    } else {
      console.log('Fullscreen not enabled.');
    }
  }
  
  /** @private */
  changeVolume_() {
    this.videoElement_.volume = this.volumeControl_.value / 100;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const videoElement = document.getElementById('videoElement');
  const volumeControl = document.getElementById('volumeControl');
  const startButton = document.getElementById('startButton');
  const clickButton = document.getElementById('clickButton');
  const playPauseButton = document.getElementById('playPauseButton');
  const fullscreenButton = document.getElementById('fullscreenButton');
  if (!(videoElement instanceof HTMLVideoElement) ||
      !(volumeControl instanceof HTMLInputElement) ||
      !(startButton instanceof HTMLButtonElement) ||
      !(clickButton instanceof HTMLButtonElement) ||
      !(playPauseButton instanceof HTMLButtonElement) ||
      !(fullscreenButton instanceof HTMLButtonElement)) {
    throw new Error('Could not locate video elements and player controls.');
  }
  new VideoCreativePageController(videoElement, volumeControl, startButton,
      clickButton, playPauseButton, fullscreenButton);
});
