goog.module('omid.common.VersionUtilsTest');

const {isValidVersion, versionGreaterOrEqual} = goog.require('omid.common.VersionUtils');

describe('VersionUtils', () => {
  describe('isValidVersion', () => {
    it('should pass full version string', () => {
      expect(isValidVersion('1.2.3-iab123')).toBeTruthy();
    });
    it('should pass version string without build version', () => {
      expect(isValidVersion('1.2.3')).toBeTruthy();
    });
    it('should fail version string with 2 semver sections', () => {
      expect(isValidVersion('1.2')).toBeFalsy();
    });
    it('should fail undefined', () => {
      expect(isValidVersion(undefined)).toBeFalsy();
    });
    it('should fail undefined', () => {
      expect(isValidVersion(undefined)).toBeFalsy();
    });
    it('should fail empty string', () => {
      expect(isValidVersion('')).toBeFalsy();
    });
    it('should fail empty object', () => {
      expect(isValidVersion({})).toBeFalsy();
    });
    it('should fail array', () => {
      expect(isValidVersion({})).toBeFalsy();
    });
    it('should fail number', () => {
      expect(isValidVersion('123')).toBeFalsy();
    });
    it('should fail number with trailing comma', () => {
      expect(isValidVersion('1.')).toBeFalsy();
    });
    it('should fail 2 semver sections with trailing comma', () => {
      expect(isValidVersion('1.5.')).toBeFalsy();
    });
  });
  describe('versionGreaterOrEqual', () => {
    it('should return true when exactly the same', () => {
      expect(versionGreaterOrEqual('1.2.3', '1.2.3')).toBeTruthy();
      expect(versionGreaterOrEqual('1.2.33', '1.2.33')).toBeTruthy();
    });
    it('should return true when first patch higher', () => {
      expect(versionGreaterOrEqual('1.2.5', '1.2.3')).toBeTruthy();
      expect(versionGreaterOrEqual('1.2.52', '1.2.48')).toBeTruthy();
    });
    it('should return true when first minor higher', () => {
      expect(versionGreaterOrEqual('1.5.3', '1.2.3')).toBeTruthy();
      expect(versionGreaterOrEqual('1.67.3', '1.58.3')).toBeTruthy();
    });
    it('should return true when first major higher', () => {
      expect(versionGreaterOrEqual('2.1.2', '1.2.3')).toBeTruthy();
      expect(versionGreaterOrEqual('21.1.2', '20.2.3')).toBeTruthy();
    });
    it('should return false when first major lower', () => {
      expect(versionGreaterOrEqual('1.8.9', '2.1.2')).toBeFalsy();
      expect(versionGreaterOrEqual('10.8.9', '11.1.2')).toBeFalsy();
    });
    it('should return false when first minor lower', () => {
      expect(versionGreaterOrEqual('1.2.9', '1.3.1')).toBeFalsy();
      expect(versionGreaterOrEqual('1.28.9', '1.29.1')).toBeFalsy();
    });
    it('should return false when first patch lower', () => {
      expect(versionGreaterOrEqual('1.2.3', '1.2.4')).toBeFalsy();
      expect(versionGreaterOrEqual('1.2.32', '1.2.33')).toBeFalsy();
    });
    it('should ignore build version portion', () => {
      expect(versionGreaterOrEqual('1.2.3-iab5', '1.2.2-iab10')).toBeTruthy();
      expect(versionGreaterOrEqual('1.2.31-iab5', '1.2.2-iab10')).toBeTruthy();
    });
  });
});
