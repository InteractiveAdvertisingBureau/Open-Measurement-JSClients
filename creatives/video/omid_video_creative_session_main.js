goog.module('omid.creatives.OmidVideoCreativeSessionMain');

const omidCreativeVideoSession = goog.require('omid.creatives.OmidVideoCreativeSession');

const omidSession = omidCreativeVideoSession.main([{
    'resourceUrl': '[INSERT RESOURCE URL]',
    'vendorKey': 'iabtechlab.com-omid',
    'verificationParameters': ''
}, {
    'resourceUrl': 'https://s3-us-west-2.amazonaws.com/omsdk-files/js/verification-measurement-script.js',
    'vendorKey': null,
    'verificationParameters': null
  }]);
omidSession.setCreativeType('video');
omidSession.setImpressionType('loaded');
omidSession.loaded();
document.getElementById("player").play();
