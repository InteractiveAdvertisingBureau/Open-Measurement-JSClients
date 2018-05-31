goog.module('omid.test.common.serviceCommunication');

const DirectCommunication = goog.require('omid.common.DirectCommunication');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {startServiceCommunication} = goog.require('omid.common.serviceCommunication');

describe('serviceCommunication', () => {
  describe('startServiceCommunication', () => {
    it('can start communication with same frame service', () => {
      const exportedCommunication = new DirectCommunication();
      const mockWindow = /** @type {!Window} */ ({
        'omid': {'VerificationServiceCommunication': exportedCommunication},
      });
      const communication = startServiceCommunication(
          mockWindow, ['omid', 'VerificationServiceCommunication']);
      expect(communication instanceof DirectCommunication).toBe(true);
    });

    it('can start communication with same frame service', () => {
      const mockWindow = /** @type {!Window} */ ({
        top: /** @type {!Window} */ ({
          addEventListener: () => {},
        }),
        addEventListener: () => {},
      });
      const isOmidPresent = () => true;
      const communication =
          startServiceCommunication(mockWindow, ['n/a'], isOmidPresent);
      expect(communication instanceof PostMessageCommunication).toBe(true);
    });

    it('returns null when there\'s no service', () => {
      const mockWindow = /** @type {!Window} */ ({});
      const communication = startServiceCommunication(mockWindow, ['n/a']);
      expect(communication).toBe(null);
    });
  });
});
