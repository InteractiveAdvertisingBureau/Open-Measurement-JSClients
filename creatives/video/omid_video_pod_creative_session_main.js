goog.module('omid.creatives.OmidVideoPodCreativeSessionMain');

const {CreativeType, ImpressionType} = goog.require('omid.common.constants');
const omidCreativeVideoSession = goog.require('omid.creatives.OmidVideoCreativeSession');

const adVideoUrls = [
  "https://compliance.iabtechnologylab.com/omsdk-demo-files/ra_1.3/IABTL_VAST_Intro_30s.mp4",
  "https://compliance.iabtechnologylab.com/omsdk-demo-files/creative/MANIA.mp4",
]

let omidSession;

function startSession() {
  omidSession = omidCreativeVideoSession.main([{
    'resourceUrl': '[INSERT RESOURCE URL]',
    'vendorKey': 'iabtechlab.com-omid',
    'verificationParameters': '',
  }]);
  omidSession.setCreativeType(CreativeType.VIDEO);
  omidSession.setImpressionType(ImpressionType.LOADED);
  omidSession.startSession();
  omidSession.loaded();
}

function finishSession() {
  omidSession.finishSession();
}

let currentAdIndex = 0;

function startNextAd() {
  const nextAdUrl = adVideoUrls[currentAdIndex];
  if (!nextAdUrl) return;
  const player = document.getElementById("player");
  player.src = nextAdUrl;
  player.addEventListener("playing", () => {
    startSession();
  }, {once: true})
  player.addEventListener("ended", () => {
    currentAdIndex++;
    finishSession();
    startNextAd();
  }, {once: true});
  player.play();
}

// Set an immediate timeout before starting the first ad so that the native
// layer will not wait for the video file to load before considering the web
// view to be loaded.
setTimeout(() => startNextAd());
