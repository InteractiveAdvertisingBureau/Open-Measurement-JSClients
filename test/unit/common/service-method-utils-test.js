goog.module('omid.test.common.serviceMethodUtils');

const {getPrefixedSessionServiceMethod, getPrefixedVerificationServiceMethod, getUnprefixedSessionServiceMethod, getUnprefixedVerificationServiceMethod, isPrefixedSessionServiceMethod, isPrefixedVerificationServiceMethod} = goog.require('omid.common.serviceMethodUtils');

describe('serviceMethodUtils', () => {
  describe('getPrefixedSessionServiceMethod', () => {
    it('should create a prefixed session service method', () => {
      expect(getPrefixedSessionServiceMethod('foo'))
          .toEqual('SessionService.foo');
    });
  });

  describe('getPrefixedVerificationServiceMethod', () => {
    it('should create a prefixed verification service method', () => {
      expect(getPrefixedVerificationServiceMethod('foo'))
          .toEqual('VerificationService.foo');
    });
  });

  describe('getUnprefixedSessionServiceMethod', () => {
    it('should extract an unprefixed session service method', () => {
      expect(getUnprefixedSessionServiceMethod('SessionService.bar'))
          .toEqual('bar');
    });

    it('should return `null` for non-session service methods', () => {
      expect(getUnprefixedSessionServiceMethod('VerificationService.bar'))
          .toBe(null);
    });
  });

  describe('getUnprefixedVerificationServiceMethod', () => {
    it('should extract an unprefixed verification service method', () => {
      expect(getUnprefixedVerificationServiceMethod('VerificationService.bar'))
          .toEqual('bar');
    });

    it('should return `null` for non-verification service methods', () => {
      expect(getUnprefixedVerificationServiceMethod('SessionService.bar'))
          .toBe(null);
    });
  });

  describe('isPrefixedSessionServiceMethod', () => {
    it('should return true for prefixed session service methods', () => {
      expect(isPrefixedSessionServiceMethod('SessionService.baz')).toBe(true);
    });

    it('should return false for non-session service methods', () => {
      expect(isPrefixedSessionServiceMethod('VerificationService.baz'))
          .toBe(false);
    });
  });

  describe('isPrefixedVerificationServiceMethod', () => {
    it('should return true for prefixed verification service methods', () => {
      expect(isPrefixedVerificationServiceMethod('VerificationService.baz'))
          .toBe(true);
    });

    it('should return false for non-verification service methods', () => {
      expect(isPrefixedVerificationServiceMethod('SessionService.baz'))
          .toBe(false);
    });
  });
});
