goog.module('omid.sessionClient.AdEvents');

const AdSession = goog.require('omid.sessionClient.AdSession');
const argsChecker = goog.require('omid.common.argsChecker');
const {packageExport} = goog.require('omid.common.exporter');

/**
 * Ad event API enabling the JS component to signal to all verification
 * providers when key events have occurred. The OM SDK JS service will allow
 * only one ad events instance to be associated with the ad session and any
 * attempt to create multiple instances will result in an error.
 */
class AdEvents {
  /**
   * @param {!AdSession} adSession instance to be associated with the ad events.
   * @throws error if the supplied ad session is null.
   * @throws error if an ad events instance has already been registered with
   *   the ad session.
   */
  constructor(adSession) {
    argsChecker.assertNotNullObject('AdEvents.adSession', adSession);

    try {
      adSession.registerAdEvents();
      this.adSession = adSession;
    } catch (error) {
      throw new Error('AdSession already has an ad events instance registered');
    }
  }

  /**
   * Notifies all verification providers that an impression event should be
   * recorded.
   * @throws error if the native ad session has not been started.
   */
  impressionOccurred() {
    this.adSession.assertSessionRunning();
    this.adSession.impressionOccurred();
    this.adSession.sendOneWayMessage('impressionOccurred');
  }
}

packageExport('OmidSessionClient.AdEvents', AdEvents);
exports = AdEvents;
