goog.module('omid.test.sessionClient.AdEvents');

const AdEvents = goog.require('omid.sessionClient.AdEvents');
const AdSession = goog.require('omid.sessionClient.AdSession');
const VastProperties = goog.require('omid.common.VastProperties');
const argsChecker = goog.require('omid.common.argsChecker');
const {VideoPosition} = goog.require('omid.common.constants');
const {asSpy} = goog.require('omid.test.typingUtils');

const MOCK_AD_SESSION_ID = 'a1b2c3';

describe('AdEventsTest', () => {
  /** @type{!AdSession} */
  let mockAdSession;

  beforeEach(() => {
    mockAdSession = jasmine.createSpyObj(
        'AdSession', [
          'getAdSessionId',
          'registerMediaEvents',
          'registerAdEvents',
          'sendOneWayMessage',
          'assertSessionRunning',
          'impressionOccurred',
          'creativeLoaded']);
    mockAdSession.getAdSessionId.and.returnValue(MOCK_AD_SESSION_ID);
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
          .toHaveBeenCalledWith('impressionOccurred', MOCK_AD_SESSION_ID);
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
          .toHaveBeenCalledWith(
              'loaded', /* vastProperties= */ null, MOCK_AD_SESSION_ID);
    });

    it(`video creatives should send a message to the SessionService with
        VastProperties`, () => {
      const adEvents = new AdEvents(mockAdSession);
      adEvents.loaded(new VastProperties(
          /* isSkippable= */ true,
          /* skipOffset= */ 10,
          /* isAutoPlay= */ true,
          /* position= */ VideoPosition.PREROLL));

      expect(mockAdSession.sendOneWayMessage).toHaveBeenCalledWith('loaded', {
        isSkippable: true,
        skipOffset: 10,
        isAutoPlay: true,
        position: 'preroll',
      }, MOCK_AD_SESSION_ID);
    });

    it('should flag the AdSession with the loaded event', () => {
      const adEvents = new AdEvents(mockAdSession);
      adEvents.loaded();
      expect(mockAdSession.creativeLoaded).toHaveBeenCalled();
    });
  });
});
