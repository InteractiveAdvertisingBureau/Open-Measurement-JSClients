goog.module('omid.creatives.VisibilityMeasurementClient');

const VerificationClient = goog.require('omid.verificationClient.VerificationClient');
const { AdEventType } = goog.require('omid.common.constants');

/**
 * OMID VisibilityMeasurementClient.
 * Simple visibility measurement script example.
 * The script creates VisibilityMeasurementClient instance and register to the OMID events
 * The script will determine creative's percent visible and reflect that by modifying the creative's HTML
 */
class VisibilityMeasurementClient {
    /**
     * Simple VisibilityMeasurementClient
     * @param {VerificationClient} verificationClient instance for communication with OMID server
     */
    constructor(verificationClient) {
        /** @private {VerificationClient} */
        this.verificationClient_ = verificationClient;
        if (!this.verificationClient_.isSupported()) {
            console.log('Omid was not available for client to call')
        }
        this.verificationClient_.registerSessionObserver("vendor1", this.handleSessionObserverEvent_);
        this.verificationClient_.addEventListener('geometryChange', this.handleGeometryChangeEvent_);
    }

    /**
     * @private Handles the sessionOberserEvent
     * @param {Object} data 
     */
    handleSessionObserverEvent_(data) {
        if (data.type === AdEventType.SESSION_START) {
            window.top.document.getElementById('omidId').innerText = data.adSessionId;
        }
    }

    /**
     * @private Handles the geometryChange events sent back. First updates percentageInView in creative, 
     *  then call @function setBackgroundColor to set the background color with respect to the 
     *  value of creative's percentage visible
     * @param {Object} data 
     */
    handleGeometryChangeEvent_(data) {
        console.log("handleGeometryChangeEvent, percentageInView = [" + data.data.adView.percentageInView + "]");
        const percentageInView = data.data.adView.percentageInView;

        window.top.document.getElementById('percentageInView').innerText = (percentageInView + "%");

        window.top.document.body.style['backgroundColor'] = this.setBackgroundColor_(percentageInView);
    }

    /**
     * @private Use the given percentageVisible to determine backgorund color
     * @param {Integer} percentageVisible 
     */
    setBackgroundColor_(percentageVisible) {
        if (percentageVisible >= 75) {
            return 'Green';
        } else if (percentageVisible >= 50) {
            return 'PaleGreen';
        } else if (percentageVisible >= 25) {
            return 'PaleVioletRed';
        } else {
            return 'Red';
        }
    }
}
exports = VisibilityMeasurementClient;
