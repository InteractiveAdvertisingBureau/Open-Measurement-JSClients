goog.module('omid.test.common.serviceCommunication');

const DirectCommunication = goog.require('omid.common.DirectCommunication');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {isCrossOrigin, resolveGlobalContext, startSessionServiceCommunication, startVerificationServiceCommunication} = goog.require('omid.common.serviceCommunication');
const {omidGlobal} = goog.require('omid.common.OmidGlobalProvider');

describe('serviceCommunication', () => {
  describe('startSessionServiceCommunication', () => {
    it('can start direct communication with same frame service', () => {
      const mockWindow = createMockSameOriginTopWindow();
      mockWindow['omid'] = {
        'v1_SessionServiceCommunication': new DirectCommunication(),
      };

      const communication = startSessionServiceCommunication(mockWindow);
      expect(communication instanceof DirectCommunication).toBe(true);
    });

    it('can start direct communication with a same-origin top frame service',
       () => {
         const mockTopWindow = createMockSameOriginTopWindow();
         mockTopWindow['omid'] = {
           'v1_SessionServiceCommunication': new DirectCommunication(),
         };
         const mockWindow = createMockSameOriginWindow();
         mockWindow['top'] = mockTopWindow;

         const communication = startSessionServiceCommunication(mockWindow);
         expect(communication instanceof DirectCommunication).toBe(true);
       });

    it('can start post communication with a cross-origin top frame service',
       () => {
         const mockWindow = createMockSameOriginTopWindow();
         mockWindow['addEventListener'] = () => {};
         const isOmidPresent = () => true;

         const communication = startSessionServiceCommunication(
             mockWindow, /* serviceGlobal= */ undefined, isOmidPresent);
         expect(communication instanceof PostMessageCommunication).toBe(true);
       });

    it(`returns null when there's no service`, () => {
      const mockWindow = createMockSameOriginWindow();
      mockWindow['top'] = createMockCrossOriginTopWindow();
      const communication = startSessionServiceCommunication(mockWindow);
      expect(communication).toBe(null);
    });

    it('will prefer communication with an integrator-specified service window',
       () => {
         const mockWindow = createMockSameOriginWindow();
         mockWindow['top'] = createMockCrossOriginTopWindow();
         // Pretend the OMID service is available in a cross-origin window and
         // unavailable in the current window and top (the default selections).
         const mockServiceWindow = createMockCrossOriginWindow();
         mockServiceWindow['top'] = mockWindow['top'];
         const isOmidPresent = (win) => win == mockServiceWindow;

         const communication = startSessionServiceCommunication(
             mockWindow, mockServiceWindow, isOmidPresent);
         expect(communication instanceof PostMessageCommunication).toBe(true);
       });
  });

  describe('startVerificationServiceCommunication', () => {
    it('can start direct communication with same frame service', () => {
      const mockWindow = createMockSameOriginTopWindow();
      mockWindow['omid'] = {
        'v1_VerificationServiceCommunication': new DirectCommunication(),
      };

      const communication = startVerificationServiceCommunication(mockWindow);
      expect(communication instanceof DirectCommunication).toBe(true);
    });

    it('can start direct communication with a same-origin top frame service',
       () => {
         const mockTopWindow = createMockSameOriginWindow();
         mockTopWindow['omid'] = {
           'v1_VerificationServiceCommunication': new DirectCommunication(),
         };
         mockTopWindow['top'] = mockTopWindow;
         const mockWindow = createMockSameOriginWindow();
         mockWindow['top'] = mockTopWindow;

         const communication =
             startVerificationServiceCommunication(mockWindow);
         expect(communication instanceof DirectCommunication).toBe(true);
       });

    it('can start post communication with a cross-origin top frame service',
       () => {
         const mockWindow = createMockSameOriginWindow();
         mockWindow['addEventListener'] = () => {};
         const isOmidPresent = () => true;

         const communication =
             startVerificationServiceCommunication(mockWindow, isOmidPresent);
         expect(communication instanceof PostMessageCommunication).toBe(true);
       });

    it(`starts communication with a cross-origin frame specified by the
        service`,
       () => {
         // Build a hierarchy of: window -> parentWindow -> topWindow, where the
         // parent and top are cross-origin and the service is in parentWindow.
         const mockTopWindow = createMockCrossOriginTopWindow();
         const mockParentWindow = createMockCrossOriginWindow();
         mockParentWindow['parent'] = mockTopWindow;
         mockParentWindow['top'] = mockTopWindow;
         const mockWindow = createMockSameOriginWindow();
         mockWindow['addEventListener'] = () => {};
         mockWindow['parent'] = mockParentWindow;
         mockWindow['top'] = mockTopWindow;

         // Simulate the service specifying the parent window as its location.
         mockWindow['omid'] = {'serviceWindow': mockParentWindow};
         const isOmidPresent = (window) => window == mockParentWindow;

         const communication =
             startVerificationServiceCommunication(mockWindow, isOmidPresent);
         expect(communication instanceof PostMessageCommunication).toBe(true);
       });

    it(`returns null when there's no service`, () => {
      const mockWindow = createMockSameOriginWindow();
      mockWindow['top'] = createMockCrossOriginTopWindow();
      const communication = startVerificationServiceCommunication(mockWindow);
      expect(communication).toBe(null);
    });
  });

  describe('resolveGlobalContext', () => {
    it('returns window when there is a valid window object', () => {
      const mockWindow = createMockSameOriginWindow();
      mockWindow['top'] = createMockCrossOriginTopWindow();
      expect(resolveGlobalContext(mockWindow)).toEqual(mockWindow);
    });

    it('returns omidGlobal when there is no valid window object', () => {
      expect(resolveGlobalContext(undefined)).toEqual(omidGlobal);
    });

    it('returns window.top when the current context is window.top', () => {
      const mockWindow = createMockSameOriginTopWindow();
      expect(resolveGlobalContext(mockWindow)).toEqual(mockWindow);
    });
  });

  describe('isCrossOrigin', () => {
    it('returns true when accessing window properties throws an error', () => {
      // This test is intended to cover the fix for OMSDK-467 (where IE11 will
      // not throw an error when computing "typeof top.<inaccessible
      // property>").
      const mockWindow = createMockSameOriginWindow();
      const mockTopWindow = createMockSameOriginTopWindow();
      mockWindow['top'] = mockTopWindow;
      // isCrossOrigin tries to read top.x to check for access.
      Object.defineProperty(mockTopWindow, 'x', {
        get: () => {
          throw new Error;
        },
      });
      expect(isCrossOrigin(mockTopWindow)).toBe(true);
    });

    it(`returns false when properties on window that should be defined when it's
        accessible are undefined`,
       () => {
         // This test is intended to cover the fix for OMSDK-469 (where iOS <= 9
         // and older Safari will not throw an error when accessing
         // "window.<inaccessible property>").
         const mockWindow = createMockSameOriginWindow();
         mockWindow['top'] = createMockCrossOriginTopWindow();
         expect(isCrossOrigin(mockWindow['top'])).toBe(true);
       });
  });
});

// Utility methods

/**
 * @return {!Window}
 */
function createMockSameOriginWindow() {
  const window = /** @type {!Window} */ ({
    'addEventListener': () => {},
    // Simulate a same-origin window by making properties accessible.
    'location': {
      'hostname': 'example.com',
    },
  });
  return window;
}

/** @return {!Window} */
function createMockCrossOriginWindow() {
  const window = /** @type {!Window} */ ({
    'addEventListener': () => {},
    // Simulate a cross-origin window by making all properties undefined.
  });
  return window;
}

/** @return {!Window} */
function createMockCrossOriginTopWindow() {
  const window = createMockCrossOriginWindow();
  window['top'] = window;
  window['parent'] = window;
  return window;
}

/** @return {!Window} */
function createMockSameOriginTopWindow() {
  const window = createMockSameOriginWindow();
  window['top'] = window;
  window['parent'] = window;
  return window;
}
