goog.module('omid.test.versionUtils');

const Communication = goog.require('omid.common.Communication');
const InternalMessage = goog.require('omid.common.InternalMessage');

/** @type{!Array<{version: string, compatible: boolean}>} */
const VERSION_COMPATABILITY_TABLE = [
  {version: '1.0.0', compatible: true},
  {version: '1.3', compatible: true},
  {version: '1.3.0', compatible: true},
  {version: '1.102.123', compatible: true},
  {version: '1.0.543', compatible: true},
  {version: '0.0.0', compatible: false},
  {version: '2.0.0', compatible: false},
  {version: '2.4', compatible: false},
  {version: '45', compatible: false},
  {version: '45.0.0', compatible: false},
];

/**
 * Create a communication class which knows how to respond instantly to version
 * requests. The class responds with the provided version. This allows the test
 * to spoof different service versions.
 * @param {string} responseVersion
 * @return {function(new: ?)}
 */
function makeVersionRespondingCommunicationClass(responseVersion) {
  /** @extends {Communication<?Object>} */
  class VersionRespondingCommunication extends Communication {
    /** @override */
    sendMessage(message, to = null) {
      // Only respond to version requests.
      if (message.method.split('.')[1] !== 'getVersion') {
        return;
      }

      // Respond to the version request with the version specified in
      // the responseVersion variable.
      const jsonedVersion = JSON.stringify([responseVersion]);
      this.handleMessage(
          new InternalMessage(message.guid, 'response', '1.0.0', jsonedVersion),
          to);
    }
  }
  return VersionRespondingCommunication;
}

exports = {
  VERSION_COMPATABILITY_TABLE,
  makeVersionRespondingCommunicationClass,
};
