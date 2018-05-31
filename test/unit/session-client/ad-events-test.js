goog.module('omid.test.sessionClient.AdEvents');

const AdEvents = goog.require('omid.sessionClient.AdEvents');
const AdSession = goog.require('omid.sessionClient.AdSession');
const argsChecker = goog.require('omid.common.argsChecker');
const {asSpy} = goog.require('omid.test.typingUtils');

describe('AdEventsTest', () => {
  /** @type{!AdSession} */
  let mockAdSession;

  beforeEach(() => {
    mockAdSession = jasmine.createSpyObj(
        'AdSession', [
          'registerVideoEvents',
          'registerAdEvents',
          'sendOneWayMessage',
          'assertSessionRunning',
          'assertImpressionOccured',
          'impressionOccurred']);
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
});
