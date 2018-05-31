goog.module('omid.validationVerificationScript.ValidationVerificationClient');
const {packageExport} = goog.require('omid.common.exporter');
const {AdEventType} = goog.require('omid.common.constants');
const VerificationClient = goog.require('omid.verificationClient.VerificationClient');
/** @const {string} the default address for the logs. will be use in case verificationParameters is not specified */
const DefaultLogServer = 'http://localhost:66/sendMessage?msg=';

/**
 * OMID ValidationVerificationClient.
 * Simple validation script example.
 * The script creates VerificationClient instance and register to the OMID events.
 * The script fires logs for every event that recived by the OMID .
 */
class ValidationVerificationClient {
    /**
     * Simple ValidationVerificationClient
     *  - log if support is true
     *  - register to sessionObserver
     *  - register a callback to all AdEventType, except additional registration to video events
     * @param {VerificationClient} verificationClient instance for communication with OMID server
     * @param {string} vendorKey - should be the same when calling sessionStart in order to get verificationParameters.logServer
     */
    constructor(verificationClient, vendorKey) {
        /** @private {string} */
        this.vendorKey_ = vendorKey;
        /** @private {string} */
        this.logServer_ = DefaultLogServer;
        /** @private {boolean} */
        this.sessionStart_ = false;
        /** @private {Array.<string>} */
        this.logs_ = [];
        /** @private {VerificationClient} */
        this.verificationClient_ = verificationClient;
        const isSupported = this.verificationClient_.isSupported();
        this.logMessage_('OmidSupported['+isSupported+']', (new Date()).getTime());
        if (isSupported) {
            const self = this;
            this.verificationClient_.registerSessionObserver((event) => this.sessionObserverCallback_(event), this.vendorKey_);
            Object.keys(AdEventType).filter((el) => el !== 'VIDEO').forEach( function(el) {
                self.verificationClient_.addEventListener(AdEventType[el], (event) => self.omidEventListenerCallback_(event));
            });
        }
    }

    /**
     * Log message to the server
     * Message will have the format: <Date> :: <Message>
     * For example: 10/8/2017, 10:41:11 AM::"OmidSupported[true]"
     * In case SessionStart already called - immediately send the message
     *  In case SessionStart didn't called - keep the the message on array until SessionStart called
     * @param {Object|string} message to send to the server
     * @param {number} timestamp of the event
     */
    logMessage_(message, timestamp) {
        const log = (new Date(timestamp)).toLocaleString()+ '::' + JSON.stringify(message);
        if (this.sessionStart_) {
            this.sendUrl_(log);
        } else {
            this.logs_.push(log);
        }
    }

    /**
     * Call verificationClient sendUrl for message with the correct logServer
     * @param {string} message to send to the server
     */
    sendUrl_(message) {
        const url = (this.logServer_ + encodeURIComponent(message));
        this.verificationClient_.sendUrl(url);
    }

    /**
     * Callback for addEventListener.
     * sending event logs to the server
     * @param {Object} event data
     */
    omidEventListenerCallback_(event) {
        this.logMessage_(event, event.timestamp);
    }

    /**
     * Send all the events that received before SessionStart was called
     */
    sendPreviousLogs_() {
        this.logs_.forEach( function(logIndex) {
            this.sendUrl_(logIndex);
        }.bind(this));
    }

    /**
     * Callback for registerSessionObserver.
     * In case of AdEventType.SESSION_START:
     * - check if verificationParameters exists and use it if needed
     * - if verificationParameters don't exists - use the default server
     * - start sending the logs to the server
     * @param {Object} event data
     */
    sessionObserverCallback_(event) {
        if (event.type == AdEventType.SESSION_START) {
            this.sessionStart_ = true;
            const verificationParameters = event.data.verificationParameters;
            if (verificationParameters != null) {
                this.logServer_ = verificationParameters;
            }
            this.sendPreviousLogs_();
        }
        this.logMessage_(event, event.timestamp);
    }

    /**
     * @return {Array.<string>} return all the current unsent logs
     */
    getLogs() {
        return this.logs_;
    }
}
exports = ValidationVerificationClient;
