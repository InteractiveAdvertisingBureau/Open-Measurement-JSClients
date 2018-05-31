goog.module('omid.test.sessionClient.VideoEvents');

const AdSession = goog.require('omid.sessionClient.AdSession');
const argsChecker = goog.require('omid.common.argsChecker');
const VastProperties = goog.require('omid.common.VastProperties');
const VideoEvents = goog.require('omid.sessionClient.VideoEvents');
const {InteractionType, VideoPlayerState, VideoPosition} = goog.require('omid.common.constants');
const {asSpy} = goog.require('omid.test.typingUtils');

/** @type {!VideoEvents} */
let videoEvents;

/** @type {!AdSession} */
let mockAdSession;

/**
 * Tests that the forwarding function forwards the method call as expected.
 * @param  {string} methodName
 * @param  {function(...?)} f Forwarding function
 * @param  {...?} args Array of arguments to pass to the function.
 */
function testForwardingFunction(methodName, f, ...args) {
  it('throws if the session is not running yet', () => {
    asSpy(mockAdSession.assertSessionRunning).and.callFake(() => {
      throw new Error();
    });
    expect(() => f.apply(videoEvents, args)).toThrow();
  });

  it('throws if an impression has not occured yet', () => {
    asSpy(mockAdSession.assertImpressionOccured).and.callFake(() => {
      throw new Error();
    });
    expect(() => f.apply(videoEvents, args)).toThrow();
  });

  it('should be relayed to the service', () => {
    f.apply(videoEvents, args);

    expect(mockAdSession.sendOneWayMessage)
        .toHaveBeenCalledWith(methodName, ...args);
  });
}

describe('VideoEventsTest', () => {
  beforeEach(() => {
    mockAdSession = jasmine.createSpyObj(
        'AdSession', [
          'registerVideoEvents',
          'registerAdEvents',
          'sendOneWayMessage',
          'assertSessionRunning',
          'assertImpressionOccured',
          'impressionOccurred']);
    spyOn(argsChecker, 'assertNotNullObject');
    spyOn(argsChecker, 'assertNumber');
    spyOn(argsChecker, 'assertNumberBetween');

    videoEvents = new VideoEvents(mockAdSession);
  });

  describe('constructor', () => {
    it('should verify adSession by calling the argsChecker', () => {
      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'VideoEvents.adSession', mockAdSession);
    });
    it('should throw an error if ad session already has video events', () => {
      asSpy(mockAdSession.registerVideoEvents).and.callFake(() => {
        throw new Error();
      });

      expect(() => new VideoEvents(mockAdSession)).toThrow();
    });
  });

  describe('loaded', () => {
    it('should verify vastProperties by calling the argsChecker', () => {
      const vastProperties = new VastProperties(
          false /* isSkippable */, 0 /* skipOffset */,
          false /* isAutoPlay */, VideoPosition.PREROLL /* position */);
      videoEvents.loaded(vastProperties);

      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'VideoEvents.loaded.vastProperties', vastProperties);
    });

    it('should be relayed to the service', () => {
      const vastProperties = new VastProperties(
          false /* isSkippable */, 0 /* skipOffset */,
          false /* isAutoPlay */, VideoPosition.PREROLL /* position */);
      videoEvents.loaded(vastProperties);

      expect(mockAdSession.sendOneWayMessage).toHaveBeenCalledWith(
          'loaded', vastProperties);
    });
  });

  describe('start', () => {
    it('should verify duration by calling the argsChecker', () => {
      const videoEvents = new VideoEvents(mockAdSession);
      videoEvents.start(5, .5);

      expect(argsChecker.assertNumber).toHaveBeenCalledWith(
          'VideoEvents.start.duration', 5);
    });

    it('should verify videoPlayerVolume by calling the argsChecker', () => {
      const videoEvents = new VideoEvents(mockAdSession);
      videoEvents.start(5, .5);

      expect(argsChecker.assertNumberBetween).toHaveBeenCalledWith(
          'VideoEvents.start.videoPlayerVolume', .5, 0, 1);
    });

    testForwardingFunction(
        'start', VideoEvents.prototype.start, 5 /* duration */,
        0.6 /* volume */);
  });

  describe('volumeChange', () => {
    it('should verify videoPlayerVolume by calling the argsChecker', () => {
      const videoEvents = new VideoEvents(mockAdSession);
      videoEvents.volumeChange(.6);

      expect(argsChecker.assertNumberBetween).toHaveBeenCalledWith(
          'VideoEvents.volumeChange.videoPlayerVolume', .6, 0, 1);
    });

    testForwardingFunction(
        'volumeChange', VideoEvents.prototype.volumeChange, 0.6 /* volume */);
  });

  describe('playerStateChange', () => {
    it('should verify playerState by calling the argsChecker', () => {
      const videoEvents = new VideoEvents(mockAdSession);
      const videoPlayerState = VideoPlayerState.FULLSCREEN;
      videoEvents.playerStateChange(videoPlayerState);

      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'VideoEvents.playerStateChange.playerState', videoPlayerState);
    });

    testForwardingFunction(
        'playerStateChange',
        VideoEvents.prototype.playerStateChange,
        VideoPlayerState.FULLSCREEN);
  });

  describe('adUserInteraction', () => {
    it('should verify adUserInteraction by calling the argsChecker', () => {
      const videoEvents = new VideoEvents(mockAdSession);
      videoEvents.adUserInteraction(InteractionType.CLICK);

      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'VideoEvents.adUserInteraction.interactionType',
          InteractionType.CLICK);
    });

    testForwardingFunction(
        'adUserInteraction',
        VideoEvents.prototype.adUserInteraction,
        InteractionType.CLICK);
  });

  describe('firstQuartile', () => {
    testForwardingFunction(
        'firstQuartile', VideoEvents.prototype.firstQuartile);
  });

  describe('midpoint', () => {
    testForwardingFunction('midpoint', VideoEvents.prototype.midpoint);
  });

  describe('thirdQuartile', () => {
    testForwardingFunction('thirdQuartile',
        VideoEvents.prototype.thirdQuartile);
  });

  describe('complete', () => {
    testForwardingFunction('complete', VideoEvents.prototype.complete);
  });

  describe('pause', () => {
    testForwardingFunction('pause', VideoEvents.prototype.pause);
  });

  describe('resume', () => {
    testForwardingFunction('resume', VideoEvents.prototype.resume);
  });

  describe('bufferStart', () => {
    testForwardingFunction('bufferStart', VideoEvents.prototype.bufferStart);
  });

  describe('bufferFinish', () => {
    testForwardingFunction('bufferFinish', VideoEvents.prototype.bufferFinish);
  });

  describe('skipped', () => {
    testForwardingFunction('skipped', VideoEvents.prototype.skipped);
  });
});
