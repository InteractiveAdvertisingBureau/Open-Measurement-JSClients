goog.module('omid.creatives.VisibilityMeasurementClientMain');

const VerificationClient = goog.require('omid.verificationClient.VerificationClient');
const VisibilityMeasurementClient = goog.require('omid.creatives.VisibilityMeasurementClient');

new VisibilityMeasurementClient(new VerificationClient());