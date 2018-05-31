goog.module('omid.sessionClient.OmidVersion');

const argsChecker = goog.require('omid.common.argsChecker');
const {packageExport} = goog.require('omid.common.exporter');

/**
 * Represents the Version of OMID Session Client.
 */
class OmidVersion {
  /**
   * @param {string} semanticVersion
   * @param {string} apiLevel
   * @throws error if any of the arguments is undefined, null or blank.
   */
  constructor(semanticVersion, apiLevel) {
    argsChecker.assertTruthyString(
        'OmidVersion.semanticVersion', semanticVersion);
    argsChecker.assertTruthyString('OmidVersion.apiLevel', apiLevel);
  }
}

packageExport('OmidSessionClient.OmidVersion', OmidVersion);
exports = OmidVersion;
