/**
 * @fileoverview Example OMID ad session client.
 */
goog.module('omid.creatives.OmidCreativeSession');

const AdEvents = goog.require('omid.sessionClient.AdEvents');
const AdSession = goog.require('omid.sessionClient.AdSession');
const Context = goog.require('omid.sessionClient.Context');
const Partner = goog.require('omid.sessionClient.Partner');
const VerificationScriptResource = goog.require('omid.sessionClient.VerificationScriptResource');
const {AdEventType, CreativeType, ImpressionType} = goog.require('omid.common.constants');
const {Event} = goog.require('omid.common.eventTypedefs');

/**
 * Convert dictionary objects to VerificationScriptResources.
 * @param {!Array<Object>} verificationScriptResources
 * @return {!Array<VerificationScriptResource>}
 * @private
 */
function convertVerificationScriptResources_(verificationScriptResources) {
  return verificationScriptResources.map(verificationScriptResources =>
      new VerificationScriptResource(
        verificationScriptResources['resourceUrl'],
        verificationScriptResources['vendorKey'],
        verificationScriptResources['verificationParameters']));
}

class OmidCreativeSession {
  /**
   * @param {!Array<Object>} verificationScriptResources
   */
  constructor(verificationScriptResources) {
    const partner = new Partner('TestApp', '1.0');
    const context = new Context(partner,
        convertVerificationScriptResources_(verificationScriptResources));
    this.adClient_ = new AdSession(context);
    this.adEvents_ = new AdEvents(this.adClient_);
    this.sessionActive_ = false;
    this.shouldCallImpressionOccurred_ = false;
  }

  /**
   * Create an OmidCreativeSession and start monitoring OMID events.
   * This can be called from an HTML page should load verification resources
   * or send events.
   * @param {!Array<Object>} verificationScriptResources
   * @param {string=} urlPrefix base URL to send test pings, or use default
   * @return {!OmidCreativeSession} the created session
   * @export
   */
  static main(verificationScriptResources,
               urlPrefix = undefined) {
    const creative =
        new OmidCreativeSession(verificationScriptResources);
    creative.start();
    return creative;
  }

  /**
   * Start monitoring OMID events.
   * @export
   */
  start() {
    this.adClient_.registerSessionObserver(
        event => this.onSessionEvent_(event));
  }

  /**
   * @private An OMID session event was received.
   * @param {!Event} event
   */
  onSessionEvent_(event) {
    const {adSessionId, timestamp, type, data} = event;
    switch (type) {
      case AdEventType.SESSION_START:
        this.sessionActive_ = true;
        if (this.shouldCallImpressionOccurred_) {
          this.callImpressionOccurred_();
        }
        break;
      case AdEventType.SESSION_FINISH:
        this.sessionActive_ = false;
        break;
    }
  }

  /**
   * Set the CreativeType.
   * @param {!CreativeType} creativeType
   * @export
   */
  setCreativeType(creativeType) {
    this.adClient_.setCreativeType(creativeType);
  }

  /**
   * Set the ImpressionType.
   * @param {!ImpressionType} impressionType
   * @export
   */
  setImpressionType(impressionType) {
    this.adClient_.setImpressionType(impressionType);
  }

  /**
   * Register that the ad has loaded.
   * @export
   */
  loaded() {
    this.adEvents_.loaded();
  }

  /**
   * Register that an impression occurred.
   * @export
   */
  impressionOccurred() {
    // Must wait for session to start before firing impression.
    if (this.sessionActive_) {
      this.callImpressionOccurred_();
    } else {
      this.shouldCallImpressionOccurred_ = true;
    }
  }

  /**
   * @private Tell OMSDK that an impression occurred.
   * May only be called while session is active.
   */
  callImpressionOccurred_() {
    this.adEvents_.impressionOccurred();
    this.shouldCallImpressionOccurred_ = false;
  }
}

exports = OmidCreativeSession;