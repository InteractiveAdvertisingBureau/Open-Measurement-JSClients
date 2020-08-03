goog.module('omid.creatives.OmidCreativeSessionMain');

const OmidCreativeSession = goog.require('omid.creatives.OmidCreativeSession');

const omidSession = OmidCreativeSession.main([{
  'resourceUrl': '[INSERT RESOURCE URL]',
    'vendorKey': 'ignored',
    'verificationParameters': 'ignored'
}, {
  'resourceUrl': 'https://s3-us-west-2.amazonaws.com/omsdk-files/js/verification-measurement-script.js',
  'vendorKey': null,
  'verificationParameters': null
}]);
omidSession.setCreativeType('htmlDisplay');
omidSession.setImpressionType('loaded');
omidSession.loaded();
omidSession.impressionOccurred();
