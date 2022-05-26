goog.module('omid.test.sessionClient.VerificationVendor');

const {verificationVendorIdForScriptUrl, VerificationVendorId} = goog.require('omid.sessionClient.VerificationVendor');

describe('verificationVendorIdForScriptUrl', () => {
  it('correctly identifies Moat URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://cdn.moatads.com/script.js', VerificationVendorId.MOAT);
  });
  it('correctly identifies Doubleverify URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://cdn.doubleverify.com/script.js',
        VerificationVendorId.DOUBLEVERIFY);
    expectScriptUrlToMatchVendorId(
        'https://c.amazon-adsystem.com/vfw/dv/script.js',
        VerificationVendorId.DOUBLEVERIFY);
    expectScriptUrlToMatchVendorId(
        'https://www.twitch.tv/r/s/d/script.js',
        VerificationVendorId.DOUBLEVERIFY);
  });
  it('correctly identifies IAS URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://cdn.adsafeprotected.com/script.js',
        VerificationVendorId.INTEGRAL_AD_SCIENCE);
  });
  it('correctly identifies Pixelate URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://cdn.adrta.com/s/page/aa.js', VerificationVendorId.PIXELATE);
    expectScriptUrlToMatchVendorId(
        'https://cdn.rta247.com/s/page/aanf.js', VerificationVendorId.PIXELATE);
  });
  it('correctly identifies ComScore URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://cdn.voicefive.com/script.js', VerificationVendorId.COMSCORE);
    expectScriptUrlToMatchVendorId(
        'https://cdn.measuread.com/script.js', VerificationVendorId.COMSCORE);
    expectScriptUrlToMatchVendorId(
        'https://cdn.scorecardresearch.com/script.js',
        VerificationVendorId.COMSCORE);
  });
  it('correctly identifies Meetrics URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://s418.mxcdn.net/bb-serve/omid-meetrics.js',
        VerificationVendorId.MEETRICS);
  });
  it('correctly identifies Google URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://pagead2.googlesyndication.com/script.js',
        VerificationVendorId.GOOGLE);
    expectScriptUrlToMatchVendorId(
        'https://www.googletagservices.com/script.js',
        VerificationVendorId.GOOGLE);
  });
  it('returns OTHER for unrecognized URLs', () => {
    expectScriptUrlToMatchVendorId(
        'https://cdn.some-other-vendor.com/vendor.js',
        VerificationVendorId.OTHER);
    expectScriptUrlToMatchVendorId(
        'file://my-local-file.js', VerificationVendorId.OTHER);
    expectScriptUrlToMatchVendorId('not-a-url', VerificationVendorId.OTHER);
  });
});

/** Helper methods */

/**
 * Expects the given script URL to match the given id.
 * @param {string} scriptUrl
 * @param {!VerificationVendorId} expectedVerificationVendorId
 */
function expectScriptUrlToMatchVendorId(
    scriptUrl, expectedVerificationVendorId) {
  expect(verificationVendorIdForScriptUrl(scriptUrl))
      .toEqual(expectedVerificationVendorId);
}
