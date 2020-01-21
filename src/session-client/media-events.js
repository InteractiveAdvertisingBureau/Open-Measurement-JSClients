goog.module('omid.sessionClient.MediaEvents');

const AdSession = goog.require('omid.sessionClient.AdSession');
const argsChecker = goog.require('omid.common.argsChecker');
const {InteractionType, VideoPlayerState} = goog.require('omid.common.constants');
const {VastProperties} = goog.require('omid.common.eventTypedefs');
const {packageExport} = goog.require('omid.common.exporter');

/**
 * Provides a complete list of supported JS media events. Using this event API
 * assumes the media player is fully responsible for communicating all media
 * events at the appropriate times. Only one media events implementation can be
 * associated with the ad session and any attempt to create multiple instances
 * will result in an error. The same rules apply to both multiple JS media
 * events and any attempt to register a JS media events instance when a native
 * instance has already been registered via the native bridge.
 */
class MediaEvents {
  /**
   * @param {!AdSession} adSession associated with the media events.
   * @throws error if the supplied ad session is undefined or null.
   */
  constructor(adSession) {
    argsChecker.assertNotNullObject('MediaEvents.adSession', adSession);

    try {
      adSession.registerMediaEvents();
      this.adSession = adSession;
    } catch (error) {
      throw new Error(
          'AdSession already has a media events instance registered');
    }
  }

  /**
   * Note: This method will be deprecated in OMSDK 1.3.2 release.
   * Use AdEvents.loaded().
   *
   * Notifies all media listeners that media content has been loaded and ready
   * to start playing.
   * @param {!VastProperties} vastProperties containing static information
   *   about the media placement.
   * @throws error if the supplied VAST properties is undefined or null.
   * @see VastProperties
   */
  loaded(vastProperties) {
    argsChecker.assertNotNullObject(
        'MediaEvents.loaded.vastProperties', vastProperties);
    this.adSession.sendOneWayMessage('loaded', vastProperties.toJSON());
  }


  /**
   * Notifies all media listeners that media content has started playing.
   * @param {number} duration of the selected media media (in seconds).
   * @param {number} mediaPlayerVolume from the native media player with a
   *   range between 0 and 1.
   * @throws error if an invalid duration or mediaPlayerVolume has been
   *   supplied.
   */
  start(duration, mediaPlayerVolume) {
    argsChecker.assertNumber('MediaEvents.start.duration', duration);
    argsChecker.assertNumberBetween('MediaEvents.start.mediaPlayerVolume',
        mediaPlayerVolume, 0, 1);
    this.adSession.sendOneWayMessage('start', duration, mediaPlayerVolume);
  }

  /**
   * Notifies all media listeners that media playback has reached the first
   * quartile.
   */
  firstQuartile() {
    this.adSession.sendOneWayMessage('firstQuartile');
  }

  /**
   * Notifies all media listeners that media playback has reached the midpoint.
   */
  midpoint() {
    this.adSession.sendOneWayMessage('midpoint');
  }

  /**
   * Notifies all media listeners that media playback has reached the third
   * quartile.
   */
  thirdQuartile() {
    this.adSession.sendOneWayMessage('thirdQuartile');
  }

  /**
   * Notifies all media listeners that media playback is complete.
   */
  complete() {
    this.adSession.sendOneWayMessage('complete');
  }

  /**
   * Notifies all media listeners that media playback has paused after a user
   * interaction.
   */
  pause() {
    this.adSession.sendOneWayMessage('pause');
  }

  /**
   * Notifies all media listeners that media playback has resumed (after being
   * paused) after a user interaction.
   */
  resume() {
    this.adSession.sendOneWayMessage('resume');
  }

  /**
   * Notifies all media listeners that media playback has stopped and started
   * buffering.
   */
  bufferStart() {
    this.adSession.sendOneWayMessage('bufferStart');
  }

  /**
   * Notifies all media listeners that buffering has finished and media playback
   * has resumed.
   */
  bufferFinish() {
    this.adSession.sendOneWayMessage('bufferFinish');
  }

  /**
   * Notifies all media listeners that media playback has stopped as a user skip
   * interaction. Once skipped media it should not be possible for the media to
   * resume playing content.
   */
  skipped() {
    this.adSession.sendOneWayMessage('skipped');
  }

  /**
   * Notifies all media listeners that the media player volume has changed.
   * @param {number} mediaPlayerVolume from the native media player.
   * @throws error if an invalid mediaPlayerVolume has been supplied.
   */
  volumeChange(mediaPlayerVolume) {
    argsChecker.assertNumberBetween(
        'MediaEvents.volumeChange.mediaPlayerVolume', mediaPlayerVolume, 0, 1);
    this.adSession.sendOneWayMessage('volumeChange', mediaPlayerVolume);
  }

  /**
   * Notifies all media listeners that media player state has changed.
   * @param {!VideoPlayerState} playerState to signal the latest media player
   *   state
   * @throws error if the supplied player state is undefined or null.
   * @see PlayerState
   */
  playerStateChange(playerState) {
    argsChecker.assertNotNullObject(
        'MediaEvents.playerStateChange.playerState', playerState);
    this.adSession.sendOneWayMessage('playerStateChange', playerState);
  }

  /**
   * Notifies all media listeners that the user has performed an ad interaction.
   * @param {!InteractionType} interactionType to signal the latest user
   *   integration
   * @throws error if the supplied interaction type is undefined or null.
   */
  adUserInteraction(interactionType) {
    argsChecker.assertNotNullObject(
        'MediaEvents.adUserInteraction.interactionType', interactionType);
    this.adSession.sendOneWayMessage('adUserInteraction', interactionType);
  }
}

packageExport('OmidSessionClient.MediaEvents', MediaEvents);
exports = MediaEvents;
