goog.module('omid.common.guid');

/**
 * Checks if the Web Crypto API is available for secure random generation.
 * @return {boolean} True if crypto.getRandomValues is available.
 */
function isCryptoAvailable() {
  return typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function';
}

/**
 * Generates an RFC4122 compliant GUID using cryptographically secure random
 * values when available, falling back to Math.random() otherwise.
 * @return {string} Unique RFC4122 version 4 GUID string.
 */
function generateGuid() {
  if (isCryptoAvailable()) {
    return generateSecureGuid();
  }
  return generateFallbackGuid();
}

/**
 * Generates a GUID using the Web Crypto API for cryptographically secure
 * random values.
 * @return {string} Unique RFC4122 version 4 GUID string.
 */
function generateSecureGuid() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version 4 (random) in bits 12-15 of time_hi_and_version
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant (10) in bits 6-7 of clock_seq_hi_and_reserved
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // Convert to hex string with dashes in the correct positions
  const hex = [];
  for (let i = 0; i < 16; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'));
  }

  return hex[0] + hex[1] + hex[2] + hex[3] + '-' +
      hex[4] + hex[5] + '-' +
      hex[6] + hex[7] + '-' +
      hex[8] + hex[9] + '-' +
      hex[10] + hex[11] + hex[12] + hex[13] + hex[14] + hex[15];
}

/**
 * Generates a GUID using Math.random(). This is NOT cryptographically secure
 * and should only be used as a fallback when the Web Crypto API is unavailable.
 * @return {string} Unique RFC4122 version 4 GUID string.
 */
function generateFallbackGuid() {
  const digit = (containsClockSeqHiAndReserved) => {
    const randomNumber = Math.random() * 16 | 0;
    // This digit contains the clock sequence high and reserved bits, so we
    // must set them in the return value.
    if (containsClockSeqHiAndReserved) {
      return (randomNumber & 0x3 | 0x8).toString(16);
    }
    return randomNumber.toString(16);
  };

  // Mark the digit that contains the clock sequence high and reserved bits
  // so that the algorithm sets them appropriately. Also set version 4 in the
  // string directly.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g, (character) => digit(character === 'y'));
}

exports = {
  generateGuid,
  generateSecureGuid,
  generateFallbackGuid,
  isCryptoAvailable,
};
