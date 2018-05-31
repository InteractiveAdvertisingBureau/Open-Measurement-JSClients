goog.module('omid.sessionClient.VerificationScriptResource');

const argsChecker = goog.require('omid.common.argsChecker');
const {packageExport} = goog.require('omid.common.exporter');

/**
 * Represents a verification script resource that comes in a VAST extension for
 * VAST versions <= 3 or a verification node for VAST versions >= 4
 */
class VerificationScriptResource {
  /**
   * Creates new verification script resource instance which requires vendor
   * specific verification parameters.
   * @param {string} resourceUrl
   * @param {string=} vendorKey
   * @param {string=} verificationParameters
   * @throws error if either the vendorKey or resourceUrl is undefined, null or
   *   blank.
   */
  constructor(resourceUrl, vendorKey = undefined,
      verificationParameters = undefined) {
    argsChecker.assertTruthyString('VerificationScriptResource.resourceUrl',
        resourceUrl);

    this.resourceUrl = resourceUrl;
    this.vendorKey = vendorKey;
    this.verificationParameters = verificationParameters;
  }
}

packageExport('OmidSessionClient.VerificationScriptResource',
       VerificationScriptResource);
exports = VerificationScriptResource;
