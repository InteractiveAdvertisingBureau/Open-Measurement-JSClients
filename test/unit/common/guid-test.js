goog.module('omid.test.common.guid');

const {
  generateGuid,
  generateSecureGuid,
  generateFallbackGuid,
  isCryptoAvailable,
} = goog.require('omid.common.guid');

// RFC4122 version 4 UUID regex with proper variant validation
// Position 14 must be '4' (version), position 19 must be 8, 9, a, or b
const uuidV4Regex =
    /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;

/**
 * Runs the standard GUID generation test suite against a given generator.
 * @param {string} name The name of the generator for test descriptions.
 * @param {function(): string} generator The GUID generator function to test.
 */
function testGuidGenerator(name, generator) {
  describe(name, () => {
    it('generated guid has the correct format', () => {
      expect(generator().match(uuidV4Regex)).toBeTruthy();
    });

    it('generated guids do not collide', () => {
      expect(generator()).not.toEqual(generator());
    });

    it('generates multiple unique guids', () => {
      const guids = new Set();
      for (let i = 0; i < 100; i++) {
        guids.add(generator());
      }
      expect(guids.size).toBe(100);
    });

    it('all generated guids have correct format', () => {
      for (let i = 0; i < 100; i++) {
        expect(generator().match(uuidV4Regex)).toBeTruthy();
      }
    });
  });
}

// Test the main generateGuid function
testGuidGenerator('generateGuid', generateGuid);

// Test the secure generator (only if crypto is available)
if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
  testGuidGenerator('generateSecureGuid', generateSecureGuid);
}

// Test the fallback generator
testGuidGenerator('generateFallbackGuid', generateFallbackGuid);

describe('isCryptoAvailable', () => {
  it('returns a boolean', () => {
    expect(typeof isCryptoAvailable()).toBe('boolean');
  });

  it('returns true in modern browsers', () => {
    // In a modern browser test environment, crypto should be available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      expect(isCryptoAvailable()).toBe(true);
    }
  });
});
