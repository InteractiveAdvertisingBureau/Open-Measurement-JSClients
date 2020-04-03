goog.module('omid.sessionClient.VideoEvents');

const AdSession = goog.require('omid.sessionClient.AdSession');
const MediaEvents = goog.require('omid.sessionClient.MediaEvents');
const VastProperties = goog.require('omid.common.VastProperties');
const argsChecker = goog.require('omid.common.argsChecker');
const {InteractionType, VideoPlayerState} = goog.require('omid.common.constants');
const {packageExport} = goog.require('omid.common.exporter');

/**
 * Provides a complete list of supported JS video events. Using this event API
 * assumes the video player is fully responsible for communicating all video
 * events at the appropriate times. Only one video events implementation can be
 * associated with the ad session and any attempt to create multiple instances
 * will result in an error. The same rules apply to both multiple JS video
 * events and any attempt to register a JS video events instance when a native
 * instance has already been registered via the native bridge.
 *
 * Note: This class will be deprecated in OMSDK 1.3.2 release.
 *
 */
class VideoEvents {
  /**
   * @param {!AdSession} adSession associated with the video events.
   * @throws error if the supplied ad session is undefined or null.
   */
  constructor(adSession) {
    this.mediaEvents = new MediaEvents(adSession);
  }

  /**
   * Note: This method will be deprecated in OMSDK 1.3.2 release.
   * Use AdEvents.loaded().
   *
   * Notifies all video listeners that video content has been loaded and ready
   * to start playing.
   * @param {!VastProperties} vastProperties containing static information
   *   about the video placement.
   * @throws error if the supplied VAST properties is undefined or null.
   * @see VastProperties
   */
  loaded(vastProperties) {
      this.mediaEvents.loaded(vastProperties);
  }

  /**
   * Notifies all video listeners that video content has started playing.
   * @param {number} duration of the selected video media (in seconds).
   * @param {number} videoPlayerVolume from the native video player with a
   *   range between 0 and 1.
   * @throws error if an invalid duration or videoPlayerVolume has been
   *   supplied.
   */
  start(duration, videoPlayerVolume) {
    this.mediaEvents.start(duration, videoPlayerVolume);
  }

  /**
   * Notifies all video listeners that video playback has reached the first
   * quartile.
   */
  firstQuartile() {
    this.mediaEvents.firstQuartile();
  }

  /**
   * Notifies all video listeners that video playback has reached the midpoint.
   */
  midpoint() {
    this.mediaEvents.midpoint();
  }

  /**
   * Notifies all video listeners that video playback has reached the third
   * quartile.
   */
  thirdQuartile() {
    this.mediaEvents.thirdQuartile();
  }

  /**
   * Notifies all video listeners that video playback is complete.
   */
  complete() {
    this.mediaEvents.complete();
  }

  /**
   * Notifies all video listeners that video playback has paused after a user
   * interaction.
   */
  pause() {
    this.mediaEvents.pause();
  }

  /**
   * Notifies all video listeners that video playback has resumed (after being
   * paused) after a user interaction.
   */
  resume() {
    this.mediaEvents.resume();
  }

  /**
   * Notifies all video listeners that video playback has stopped and started
   * buffering.
   */
  bufferStart() {
    this.mediaEvents.bufferStart();
  }

  /**
   * Notifies all video listeners that buffering has finished and video playback
   * has resumed.
   */
  bufferFinish() {
    this.mediaEvents.bufferFinish();
  }

  /**
   * Notifies all video listeners that video playback has stopped as a user skip
   * interaction. Once skipped video it should not be possible for the video to
   * resume playing content.
   */
  skipped() {
    this.mediaEvents.skipped();
  }

  /**
   * Notifies all video listeners that the video player volume has changed.
   * @param {number} videoPlayerVolume from the native video player.
   * @throws error if an invalid videoPlayerVolume has been supplied.
   */
  volumeChange(videoPlayerVolume) {
    this.mediaEvents.volumeChange(videoPlayerVolume);
  }

  /**
   * Notifies all video listeners that video player state has changed.
   * @param {!VideoPlayerState} playerState to signal the latest video player
   *   state
   * @throws error if the supplied player state is undefined or null.
   * @see PlayerState
   */
  playerStateChange(playerState) {
    this.mediaEvents.playerStateChange(playerState);
  }

  /**
   * Notifies all video listeners that the user has performed an ad interaction.
   * @param {!InteractionType} interactionType to signal the latest user
   *   integration
   * @throws error if the supplied interaction type is undefined or null.
   */
  adUserInteraction(interactionType) {
    this.mediaEvents.adUserInteraction(interactionType);
  }
}

packageExport('OmidSessionClient.VideoEvents', VideoEvents);
exports = VideoEvents;
