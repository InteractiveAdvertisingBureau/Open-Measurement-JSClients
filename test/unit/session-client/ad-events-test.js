goog.module('omid.test.sessionClient.AdEvents');

const AdEvents = goog.require('omid.sessionClient.AdEvents');
const AdSession = goog.require('omid.sessionClient.AdSession');
const VastProperties = goog.require('omid.common.VastProperties');
const argsChecker = goog.require('omid.common.argsChecker');
const {VideoPosition} = goog.require('omid.common.constants');
const {asSpy} = goog.require('omid.test.typingUtils');

describe('AdEventsTest', () => {
  /** @type{!AdSession} */
  let mockAdSession;

  beforeEach(() => {
    mockAdSession = jasmine.createSpyObj(
        'AdSession', [
          'registerMediaEvents',
          'registerAdEvents',
          'sendOneWayMessage',
          'assertSessionRunning',
          'impressionOccurred',
          'creativeLoaded']);
    spyOn(argsChecker, 'assertTruthyString');
    spyOn(argsChecker, 'assertNotNullObject');
  });

  describe('constructor', () => {
    it('should verify the adSession by calling the argsChecker', () => {
      new AdEvents(mockAdSession);

      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'AdEvents.adSession', mockAdSession);
    });

    it('should throw an error if `adSession.registerAdEvents` fails', () => {
      asSpy(mockAdSession.registerAdEvents).and.callFake(() => {
        throw new Error();
      });

      expect(() => new AdEvents(mockAdSession)).toThrow();
    });
  });

  describe('impressionOccurred', () => {
    it('should send a message to the SessionService', () => {
      const adEvents = new AdEvents(mockAdSession);
      adEvents.impressionOccurred();
      expect(mockAdSession.sendOneWayMessage)
          .toHaveBeenCalledWith('impressionOccurred');
    });

    it('should flag the AdSession with the impression event', () => {
      const adEvents = new AdEvents(mockAdSession);
      adEvents.impressionOccurred();
      expect(mockAdSession.impressionOccurred).toHaveBeenCalled();
    });
  });

  describe('loaded', () => {
    it('should call AdSession.creativeLoaded', () => {
      const adEvents = new AdEvents(mockAdSession);
      adEvents.loaded();
      expect(mockAdSession.creativeLoaded).toHaveBeenCalled();
    });

    it('display creatives should send a message to the SessionService' +
      'with null', () => {
      const adEvents = new AdEvents(mockAdSession);
      adEvents.loaded(null);
      expect(mockAdSession.sendOneWayMessage)
          .toHaveBeenCalledWith('loaded');
    });

    it('video creatives should send a message to the SessionService' +
      'with VastProperties', () => {
      const vastProperties = new VastProperties(
          false /* isSkippable */, 0 /* skipOffset */,
          false /* isAutoPlay */, VideoPosition.PREROLL /* position */);
      const adEvents = new AdEvents(mockAdSession);
      adEvents.loaded(vastProperties);
      expect(mockAdSession.sendOneWayMessage)
          .toHaveBeenCalledWith('loaded', vastProperties);
    });

    it('should flag the AdSession with the loaded event', () => {
      const adEvents = new AdEvents(mockAdSession);
      adEvents.loaded();
      expect(mockAdSession.creativeLoaded).toHaveBeenCalled();
    });
  });
});
