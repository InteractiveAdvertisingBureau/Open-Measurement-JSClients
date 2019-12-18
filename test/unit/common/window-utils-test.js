goog.module('omid.test.common.windowUtils');

const {evaluatePageUrl, isCrossOrigin, resolveGlobalContext} = goog.require('omid.common.windowUtils');
const {omidGlobal} = goog.require('omid.common.OmidGlobalProvider');

describe('serviceCommunication', () => {
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

  describe('evaluatePageUrl', () => {
    it('should be null if OMSDK is in cross-domain iframe where window.top is blocked', () => {
      const omsdkFrame = createMockCrossOriginTopWindow();
      omsdkFrame.location = {
        'href': () => {
          throw new Error('Blocked a frame from accessing a cross origin frame');
        },
      };

      expect(evaluatePageUrl(omsdkFrame)).toBe(null);
    });

    it('should be null if OMSDK is a cross-domain iframe', () => {
      const omsdkFrame = createMockCrossOriginTopWindow();

      expect(evaluatePageUrl(omsdkFrame)).toBe(null);
    });

    it('should be null if OMSDK is in a cross-domain iframe', () => {
      const topFrame = createMockCrossOriginTopWindow();

      const omsdkFrame = createMockSameOriginWindow();
      omsdkFrame.top = topFrame;
      omsdkFrame.parent = topFrame;
      omsdkFrame.location.href = 'https://www.example.com/child';

      expect(evaluatePageUrl(omsdkFrame)).toBe(null);
    });

    it('should return pageUrl if OMSDK is NOT in iframe', () => {
      const omsdkFrame = createMockSameOriginTopWindow();
      expect(evaluatePageUrl(omsdkFrame))
        .toBe(omsdkFrame.location.href);
    });

    it('should return pageUrl if OMSDK is in same-domain iframe', () => {
      const topFrame = createMockSameOriginTopWindow();

      const omsdkFrame = createMockSameOriginWindow();
      omsdkFrame.top = topFrame;
      omsdkFrame.parent = topFrame;
      omsdkFrame.location.href = 'https://www.example.com/child';

      expect(evaluatePageUrl(omsdkFrame)).toBe(topFrame.location.href);
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
