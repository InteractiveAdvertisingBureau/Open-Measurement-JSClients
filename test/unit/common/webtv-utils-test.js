goog.module('omid.common.webtvUtilsTest');

const PublicWebTv = goog.require('omid.common.webtvUtils');

// device info captured from a real TV
const DEFAULT_DEVICE_INFO = '{\n    "modelName": "65QNED85UQA",\n    ' +
  '"panelType": "LCD",\n    "platformVersion": "03.30.74",\n    ' +
  '"platformVersionDot": 74,\n    "platformVersionMajor": 3,\n    ' +
  '"platformVersionMinor": 30,\n    "screenHeight": 2160,\n    ' +
  '"screenWidth": 3840\n}';

/**
 * A mock window which records intrinsic timing method calls
 * @type {!Window}
 */
let mockWindow;

describe('WebTV Utilites', () => {
  beforeEach(() => {
    mockWindow = jasmine.createSpyObj(Object, ['setTimeout']);
  });

  describe('check if the device is webOS', () => {
    it('returns true when on webOS', () => {
      mockWindow['webOSSystem'] = {
        deviceInfo: DEFAULT_DEVICE_INFO,
      };
      expect(PublicWebTv.isWebOS(mockWindow)).toEqual(true);
    });
    it('returns false when not on webOS', () => {
      delete mockWindow['webOSSystem'];
      expect(PublicWebTv.isWebOS(mockWindow)).toEqual(false);
    });
  });

  describe('check if the device is Tizen', () => {
    it('returns true when on Tizen', () => {
      mockWindow.tizen = {};
      expect(PublicWebTv.isTizen(mockWindow)).toEqual(true);
    });
    it('returns false when not on Tizen', () => {
      delete mockWindow['tizen'];
      expect(PublicWebTv.isTizen(mockWindow)).toEqual(false);
    });
  });
});
