goog.module('omid.creatives.OmidCreativeSessionMain');

const OmidCreativeSession = goog.require('omid.creatives.OmidCreativeSession');

const omidSession = OmidCreativeSession.main([{
  'resourceUrl': '[INSERT RESOURCE URL]',
    'vendorKey': 'ignored',
    'verificationParameters': 'ignored'
}]);
omidSession.setCreativeType('htmlDisplay');
omidSession.setImpressionType('loaded');
omidSession.loaded();
omidSession.impressionOccurred();