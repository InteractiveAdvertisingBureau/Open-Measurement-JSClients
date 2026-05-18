goog.module('omid.test.common.windowUtils');

const {evaluatePageUrl, isCrossOrigin, prepareVerificationEventForSerialization, resolveGlobalContext} = goog.require('omid.common.windowUtils');
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

  describe('prepareVerificationEventForSerialization', () => {
    it('event with nested numeric data: rounded copy, original unchanged', () => {
      const event = {
        'type': 'geometryChange',
        'data': {
          'viewport': {'width': 402, 'height': 874.1234567},
          'adView': {
            'pixelsInView': 581.0000000000582,
            'geometry': {'height': 714.6666666666667, 'y': 76.33333333333331},
            'onScreenGeometry': {
              'obstructions': [{'width': 17.33333333333333, 'height': 12}],
            },
            'declaredFriendlyObstructions': 6,
          },
        },
      };
      const serializationInput = prepareVerificationEventForSerialization(event);
      expect(serializationInput).not.toBe(event);
      expect(event['data']['adView']['pixelsInView']).toBe(581.0000000000582);
      expect(serializationInput['data']['adView']['pixelsInView']).toBe(581);
      expect(serializationInput['data']['viewport']['height']).toBe(874.12);
      expect(serializationInput['data']['adView']['geometry']['height']).toBe(714.67);
      expect(serializationInput['data']['adView']['onScreenGeometry']['obstructions'][0]['width']).toBe(17.33);
      expect(serializationInput['data']['adView']['declaredFriendlyObstructions']).toBe(6);
    });

    it('event with numeric data: rounded copy, original unchanged', () => {
      const event = {
        'type': 'volumeChange',
        'data': {'mediaPlayerVolume': 0.7333333333333, 'deviceVolume': 1},
      };
      const serializationInput = prepareVerificationEventForSerialization(event);
      expect(serializationInput).not.toBe(event);
      expect(event['data']['mediaPlayerVolume']).toBe(0.7333333333333);
      expect(serializationInput['data']['mediaPlayerVolume']).toBe(0.73);
      expect(serializationInput['data']['deviceVolume']).toBe(1);
    });

    it('primitive log line unchanged', () => {
      expect(prepareVerificationEventForSerialization('OmidSupported[true]'))
          .toBe('OmidSupported[true]');
    });

    it('event without object data unchanged', () => {
      expect(prepareVerificationEventForSerialization({'type': 'x'})).toEqual({'type': 'x'});
      expect(prepareVerificationEventForSerialization({'type': 'x', 'data': null}))
          .toEqual({'type': 'x', 'data': null});
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
