goog.module('omid.creatives.OmidVideoCreativeSessionMain');

const omidCreativeVideoSession = goog.require('omid.creatives.OmidVideoCreativeSession');

const omidSession = omidCreativeVideoSession.main([{
    'resourceUrl': '[INSERT RESOURCE URL]',
    'vendorKey': 'iabtechlab.com-omid',
    'verificationParameters': ''
}]);
omidSession.setCreativeType('htmlVideo');
omidSession.setImpressionType('loaded');
omidSession.loaded();
document.getElementById("player").play();