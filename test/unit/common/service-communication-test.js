goog.module('omid.test.common.serviceCommunication');

const DirectCommunication = goog.require('omid.common.DirectCommunication');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {startServiceCommunication, resolveTopWindowContext} = goog.require('omid.common.serviceCommunication');
const {omidGlobal} = goog.require('omid.common.OmidGlobalProvider');

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

  describe('resolveTopWindowContext', () => {
    it('returns window.top when it is accessible from current window context', () => {
      const mockWindow = /** @type {!Window} */ ({
        top: /** @type {!Window} */ ({
          location: {
            hostname: 'omid.com',
          },
        }),
      });
      const topWindowContext = resolveTopWindowContext(mockWindow);
      expect(topWindowContext).toEqual(mockWindow.top);
    });

    it('returns omidGlobal when there is no valid window object', () => {
      const topWindowContext = resolveTopWindowContext(null);
      expect(topWindowContext).toEqual(omidGlobal);
    });

    it('returns window when access to window.top is not permitted from the current context', () => {
      const mockWindow = /** @type {!Window} */ ({
        top: /** @type {!Window} */ ({
        }),
      });
      const topWindowContext = resolveTopWindowContext(mockWindow);
      expect(topWindowContext).toEqual(mockWindow);
    });

    it('returns window.top when the current context is window.top', () => {
      const mockWindow = /** @type {!Window} */ ({});
      mockWindow.top = mockWindow;
      const topWindowContext = resolveTopWindowContext(mockWindow);
      expect(topWindowContext).toEqual(mockWindow);
    });
  });
});
