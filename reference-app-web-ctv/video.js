const videoElement = document.getElementById('videoElement');
const progressBar = document.getElementById('progressBar');

const mediaUrl = videoElement.src; // https://omsdk-demo-files.s3.us-west-2.amazonaws.com/creative/MANIA.mp4
const verificationScriptUrl = "./bin/omid-validation-verification-script-v1.js";
const verificationParameters = "campaignId=1234";
const vendorKey = "iabtechlab.com-test";
const accessMode = "full";

document.getElementById('mediaUrl').value = mediaUrl;        
document.getElementById('verificationScriptUrl').value = verificationScriptUrl;
document.getElementById('verificationParameters').value = verificationParameters;
document.getElementById('vendorKey').value = vendorKey;
document.getElementById('accessMode').value = accessMode;

// Samsung TV running Tizen
const tizenUtil = {
  appId: function() {
    return tizen.application.getCurrentApplication().appInfo.id;
  },
  deviceCategory: function() {
    if (typeof tizen.tvinputdevice === 'object') {
      return "ctv";
    }
  },
  deviceType: function() {
    return tizen.systeminfo.getCapability('http://tizen.org/system/model_name');
  },
  osType: function() {
    if (typeof tizen === 'object') {
      return "tizen";
    }
  },
  osVersion: function() {
    return tizen.systeminfo.getCapability('http://tizen.org/feature/platform.version');
  },
  keyCode: {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    BACK: 10009,
  },
};

// LG TV running WebOS
const webOsUtil = {
  appId: function() {
    return webOSSystem.identifier;
  },
  deviceCategory: function() {
    if (typeof webOSSystem === 'object') {
      return "ctv";
    }
  },
  deviceType: function() {
    return this.nativeInfo().modelName;
  },
  nativeInfo: function() {
    return JSON.parse(webOSSystem.deviceInfo);
  },
  osType: function() {
    if (typeof webOSSystem === 'object') {
      return "webOS";
    }
  },
  osVersion: function() {
    return this.nativeInfo().platformVersion;
  },
  keyCode: {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    BACK: 461,
  },
};

const tvUtil = {
  get: function() {
    if (typeof webOSSystem === 'object') {
      return webOsUtil;
    } else if (typeof tizen === 'object') {
      return tizenUtil;
    }
  }
};

// TV Info
const tv = tvUtil.get();
if (tv) {
  document.getElementById('appId').value = tv.appId();
  document.getElementById('deviceCategory').value = tv.deviceCategory();
  document.getElementById('deviceType').value = tv.deviceType();
  document.getElementById('osType').value = tv.osType();
  document.getElementById('osVersion').value = tv.osVersion();
}

// Remote Control / Input Monitor
const remoteControl = {
  timeoutId: 0,
  monitor: function(value) {
    document.getElementById('remoteCode').value = value;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      document.getElementById('remoteCode').value = "";
    }, 1000);
  },
};

// Video Player Controls
const videoControl = {
  started: false,
  isPlaying: false,
  isFullscreen: false,
  progress: 0,
  quartilesReached: [],

  // Playback controls
  togglePlay: function() {
    if (!this.isPlaying) {
      this.play();
    } else {
      this.pause();
    }
  },

  play: function() {    
    if (!this.started) {
      this.start();
    }
    videoElement.play();
    this.isPlaying = true;
    this.onPlay();
  },

  start: function() {
    videoElement.addEventListener('timeupdate', () => {
      if (videoElement.duration > 0) { 
        this.progress = videoElement.currentTime / videoElement.duration;
      }
      progressBar.value = this.progress * 100;
      const quartile = Math.floor(this.progress * 4);
      if (!this.quartilesReached.includes(quartile)) {
        this.quartilesReached.push(quartile);
        this.onQuartile(quartile);
      }
    });
    this.started = true;
    this.onStart();
  },

  pause: function() {
    videoElement.pause();
    this.isPlaying = false;
    this.onPause();
  },
  
  // Fullscreen controls
  enterFullscreen: function() {
    if (this.isFullscreen) {
      return;
    }
    if (typeof videoElement.requestFullscreen === 'function') {
      videoElement.requestFullscreen();
    }
    videoElement.classList.add('fullscreen');
    this.isFullscreen = true;
    this.onToggleFullscreen(this.isFullscreen);
  },

  exitFullscreen: function() {
    if (!this.isFullscreen) {
      return;
    }
    if (typeof videoElement.exitFullscreen === 'function') {
      videoElement.exitFullscreen();
    } 
    videoElement.classList.remove('fullscreen');
    this.isFullscreen = false;
    this.onToggleFullscreen(this.isFullscreen);
  },

  // Clipping controls (for demonstration only)
  offset: function(px)  {
    const x = parseInt(getComputedStyle(videoElement).paddingLeft);
    videoElement.style.paddingLeft = (x + px) + "px";
  },
  
  // Session client callbacks (for OM integration below)
  onStart: () => { /* to be overwritten */ },
  onPlay: () => { /* to be overwritten */ },
  onPause: () => { /* to be overwritten */ },
  onQuartile: (quartile) => { /* to be overwritten */ },
  onToggleFullscreen: (isFullscreen) => { /* to be overwritten */ }
};

document.body.addEventListener('keydown', (event) => { 
  switch (event.keyCode) {
  case tv.keyCode.UP:
    remoteControl.monitor('\u{2191}');
    videoControl.enterFullscreen();
    break;
  case tv.keyCode.DOWN:
    remoteControl.monitor('\u{2193}');
    videoControl.exitFullscreen();
    break;
  case tv.keyCode.LEFT:
    remoteControl.monitor('\u{2190}');
    videoControl.offset(-200);
    break;
  case tv.keyCode.RIGHT:
    remoteControl.monitor('\u{2192}');
    videoControl.offset(200);
    break;
  case tv.keyCode.ENTER:
    remoteControl.monitor('\u{23EF}');
    videoControl.togglePlay();
    break;
  case tv.keyCode.BACK:
    remoteControl.monitor('\u{27F3}');
    setTimeout(() => {location.reload()}, 500); // For testing purposes only!
    break;
  default:
    remoteControl.monitor("Unknown (" + event.keyCode + ")");
    break;
  } 
});

/* OM SDK INTEGRATION */

// Obtain the SessionClient Classes
let sessionClient = OmidSessionClient['default'];

const AdSession = sessionClient.AdSession;
const Partner = sessionClient.Partner;
const Context = sessionClient.Context;
const VerificationScriptResource = sessionClient.VerificationScriptResource;
const AdEvents = sessionClient.AdEvents;
const VastProperties = sessionClient.VastProperties;
const MediaEvents = sessionClient.MediaEvents;

// Identify the integration
const CONTENT_URL = 'https://example.com/articles/2019/lottery-winner';
const PARTNER_NAME = 'ExamplePartnerName';
const PARTNER_VERSION = '1.0.4';

const partner = new Partner(PARTNER_NAME, PARTNER_VERSION);

window.onload = () => {
  const resources = [
    new VerificationScriptResource(verificationScriptUrl, vendorKey, 
      verificationParameters, accessMode),
  ];

  const context = new Context(partner, resources, CONTENT_URL);
  context.setVideoElement(videoElement);
  context.setServiceWindow(window.top);

  // Create the AdSession
  const adSession = new AdSession(context);
  adSession.setCreativeType('video');
  adSession.setImpressionType('beginToRender');

  // OMID Partner event signals
  const adEvents = new AdEvents(adSession); // Ad lifecycle
  const mediaEvents = new MediaEvents(adSession); // Video/Audio playback

  if (adSession.isSupported()) {
    adSession.start();
  } else {
    console.log('AdSession.isSupported() is false');
    return;
  }

  adSession.registerSessionObserver((event) => {
    if (event.type === 'sessionStart') {
      // Loaded event
      const vastProperties = new VastProperties(
        /* isSkippable */ false, 
        /* skipOffset */ 0,
        /* isAutoPlay= */ false, 
        /* position= */ 'preroll');
      adEvents.loaded(vastProperties);

      // Impression event
      videoControl.onStart = () => {
        // signal the impression event
        adEvents.impressionOccurred();
      };
    } else if (event.type === 'sessionError') {
      // handle error
      console.error('SessionError', event);
    } else if (event.type === 'sessionFinish') {
      // clean up
      console.log('sessionFinish');
    }
  });

  videoControl.onPlay = () => {
    mediaEvents.resume();
  };

  videoControl.onPause = () => {
    mediaEvents.pause();
  };

  videoControl.onQuartile = (quartile) => {
    switch (quartile) {
      case 0:
        console.log('AdVideoStart');
        mediaEvents.start(videoElement.duration, videoElement.volume);
        break;
      case 1:
        console.log('AdVideoFirstQuartile');
        mediaEvents.firstQuartile();
        break;
      case 2:
        console.log('AdVideoMidpoint');
        mediaEvents.midpoint();
        break;
      case 3:
        console.log('AdVideoThirdQuartile');
        mediaEvents.thirdQuartile();
        break;
      case 4:
        console.log('AdVideoComplete');
        mediaEvents.complete();
        adSession.finish();
        break;
      default:
        console.error('Invalid quartile', quartile);
        break;
    }
  };
  
  videoControl.onToggleFullscreen = (isFullscreen) => {
    const playerState = isFullscreen ?
      /* VideoPlayerState.FULLSCREEN */ 'fullscreen' :
      /* VideoPlayerState.NORMAL */ 'normal';
    console.log('playerState', playerState);
    mediaEvents.playerStateChange(playerState);
  };
  
  videoElement.addEventListener('click', () => {
    console.log('click');
    mediaEvents.adUserInteraction(/* InteractionType.CLICK */ 'click');
  });
};
