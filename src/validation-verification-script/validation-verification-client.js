goog.module('omid.validationVerificationScript.ValidationVerificationClient');
const {packageExport} = goog.require('omid.common.exporter');
const {AdEventType} = goog.require('omid.common.constants');
const VerificationClient = goog.require('omid.verificationClient.VerificationClient');
const {resolveGlobalContext} = goog.require('omid.common.windowUtils');

/**
 * OMID ValidationVerificationClient.
 * Simple validation script example.
 * The script creates VerificationClient instance and register to the OMID events.
 * The script fires logs for every event that is received by the OMID.
 */
class ValidationVerificationClient {
    /**
     * Simple ValidationVerificationClient
     *  - log if support is true
     *  - register to sessionObserver
     *  - register a callback to all AdEventType, except additional registration to media events
     * @param {VerificationClient} verificationClient instance for communication with OMID server
     * @param {string} vendorKey - should be the same when calling sessionStart in order to get verificationParameters
     */
    constructor(verificationClient, vendorKey) {
        /** @private {VerificationClient} */
        this.verificationClient_ = verificationClient;
        const isSupported = this.verificationClient_.isSupported();
        const supplyParter = this.getSupplyParter();
        this.sendBeacon_("omid_loaded", supplyParter);

        if (isSupported) {
            this.verificationClient_.addEventListener(AdEventType.IMPRESSION, (event) => {
                this.sendBeacon_("omid_imp", supplyParter);
            });
            let pixelInView = false;
            let onScreenGeometry = false;
            this.verificationClient_.addEventListener(AdEventType.GEOMETRY_CHANGE, (event) => {
                if (!pixelInView && event.data && event.data.adView && event.data.adView.pixelsInView) {
                    this.sendBeacon_("omid_pixel", supplyParter);
                    pixelInView = true;
                }
                if (!onScreenGeometry && event.data && event.data.adView && event.data.adView.onScreenGeometry &&
                    event.data.adView.onScreenGeometry.height > 0 && event.data.adView.onScreenGeometry.width > 0) {
                    this.sendBeacon_("omid_geo", supplyParter);
                    onScreenGeometry = true;
                }
            });
        } else {
            this.sendBeacon_("omid_no", supplyParter);
        }
    }

    getSupplyParter() {
        const global = resolveGlobalContext();
        if (global && global.document && global.document.currentScript && global.document.currentScript.getAttribute('data-ox-sp')) {
            return global.document.currentScript.getAttribute('data-ox-sp');
        } else {
            return "dds"
        }
    }

    sendBeacon_(type, supplyParter) {
        this.verificationClient_.sendUrl("https://rtb.openx.net/test/"+supplyParter+"?s="+type);
    }
}
exports = ValidationVerificationClient;
