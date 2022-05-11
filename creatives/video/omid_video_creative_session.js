goog.module('omid.creatives.OmidVideoCreativeSession');

const AdEvents = goog.require('omid.sessionClient.AdEvents');
const AdSession = goog.require('omid.sessionClient.AdSession');
const Context = goog.require('omid.sessionClient.Context');
const Partner = goog.require('omid.sessionClient.Partner');
const VerificationScriptResource = goog.require('omid.sessionClient.VerificationScriptResource');
const MediaEvents = goog.require('omid.sessionClient.MediaEvents');
const {AdEventType, CreativeType, ImpressionType, VideoPlayerState, VideoPosition} = goog.require('omid.common.constants');
const {Event} = goog.require('omid.common.eventTypedefs');
const VastProperties = goog.require('omid.common.VastProperties');

/**
 * Convert dictionary objects to VerificationScriptResources.
 * @param {!Array<Object>} verificationScriptResources
 * @return {!Array<VerificationScriptResource>}
 * @private
 */
function convertVerificationScriptResources_(verificationScriptResources) {
    return verificationScriptResources.map(verificationScriptResources =>
        new VerificationScriptResource(
          verificationScriptResources['resourceUrl'],
          verificationScriptResources['vendorKey'],
          verificationScriptResources['verificationParameters']));
}

class OmidVideoCreativeSession {
    /**
    * @param {!Array<Object>} verificationScriptResources
    * @throws error if this.adClient_.isSupported && this.adClient_.isSupported() is false
    * @throws error if player element not present in html
    */
    constructor(verificationScriptResources) {
        const partner = new Partner('TestApp', '1.0');
        const context = new Context(partner,
            convertVerificationScriptResources_(verificationScriptResources));
        this.adClient_ = new AdSession(context);
        if (!(this.adClient_ && this.adClient_.isSupported && this.adClient_.isSupported())) {
            throw new Error("adSession not present");
        }

        this.player = document.getElementById('player');
        if (this.player == null) {
            throw new Error("Player not present");
        }

        this.adEvents_ = new AdEvents(this.adClient_);
        this.mediaEvents = new MediaEvents(this.adClient_);
        this.sessionActive_ = false;

        /**
         * The last observed percentage of the video element. Null until video is started playing.
         * @private {?number}
         */
        this.lastVideoPercentage = null;

        /**
         * Whether or not an impression and start events occurred before session start,
         * impression and start events should be called while session is active. 
         * Defaults to false.
         * @type {boolean}
         */
        this.shouldCallImpressionOccurredAndStart = false;
        this.isBuffering = false;
        this.isFullscreen = document.fullscreenElement === this.player;
        this.quartileEvents = { "1q": false, "2q": false, "3q": false, "4q": false };
    }

    /**
     * Create an OmidCreativeSession and start monitoring OMID events.
     * This can be called from an HTML page should load verification resources
     * or send events.
     * @param {!Array<Object>} verificationScriptResources
     * @param {string=} urlPrefix base URL to send test pings, or use default
     * @return {!OmidVideoCreativeSession} the created session
     * @export
     */
    static main(verificationScriptResources, urlPrefix = undefined) {
        const creative = new OmidVideoCreativeSession(verificationScriptResources);
        creative.start();
        return creative;
    }
    
    /**
     * Start monitoring OMID events.
     * @export
     */
    start() {
        this.setupEventListeners_();
        this.adClient_.registerSessionObserver(event => this.onSessionEvent_(event));
    }

    /**
     * @private An OMID session event was received.
     * @param {!Event} event
     */
    onSessionEvent_(event) {
        const {adSessionId, timestamp, type, data} = event;
        switch (type) {
        case AdEventType.SESSION_START:
            this.sessionActive_ = true;
            if (this.shouldCallImpressionOccurredAndStart) {
                this.callImpressionOccurredAndVideoStart();
            }
            break;
        case AdEventType.SESSION_FINISH:
            this.sessionActive_ = false;
            break;
        }
    }

    /**
     * Set event listeners for player
     * @private
     */
    setupEventListeners_() {
        this.player.addEventListener("play", () => {
            if (this.player.currentTime != 0) {
                this.mediaEvents.resume();
            }
        });
        this.player.addEventListener("pause", () => {
            if (!this.player.ended) {
                this.mediaEvents.pause();
            }
        });
        this.player.addEventListener("waiting", () => {
            this.isBuffering = true;
            this.mediaEvents.bufferStart();
        });
        this.player.addEventListener("timeupdate", () => {
            if (this.isBuffering) {
                this.isBuffering = false;
                this.mediaEvents.bufferFinish();
            }
            if (this.player.duration > 0) {
                const percentProgress = this.player.currentTime / this.player.duration;
                if (percentProgress >= 0 && this.lastVideoPercentage == null) {
                    this.callImpressionOccurredAndVideoStart();
                } else if (percentProgress >= .25 && !this.quartileEvents["1q"]) {
                    this.quartileEvents["1q"] = true;
                    this.mediaEvents.firstQuartile();
                } else if (percentProgress >= .50 && !this.quartileEvents["2q"]) {
                    this.quartileEvents["2q"] = true;
                    this.mediaEvents.midpoint();
                } else if (percentProgress >= .75 && !this.quartileEvents["3q"]) {
                    this.quartileEvents["3q"] = true;
                    this.mediaEvents.thirdQuartile();
                } else if (percentProgress >= .99 && !this.quartileEvents["4q"]) {
                    this.quartileEvents["4q"] = true;
                    this.mediaEvents.complete();
                }
                
                this.lastVideoPercentage = percentProgress;
            }
        });
        this.player.addEventListener("volumechange", () => {
            this.mediaEvents.volumeChange(this.player.muted ? 0 : this.player.volume);
        });

        // event listeners for ios
        this.player.addEventListener('webkitendfullscreen', () => {
            this.mediaEvents.playerStateChange(VideoPlayerState.NORMAL);
        });
        this.player.addEventListener('webkitbeginfullscreen', () => {
                this.mediaEvents.playerStateChange(VideoPlayerState.FULLSCREEN);
        });
        this.player.onfullscreenchange = (ev) => {
            console.log("fullscreen change");
            if (document.fullscreenElement) {
                this.mediaEvents.playerStateChange(VideoPlayerState.FULLSCREEN);
            } else {
                this.mediaEvents.playerStateChange(VideoPlayerState.NORMAL);
            }
        };
    }

    /**
     * Set the CreativeType.
     * @param {!CreativeType} creativeType
     * @export
     */
    setCreativeType(creativeType) {
        this.adClient_.setCreativeType(creativeType);
    }

    /**
     * Set the ImpressionType.
     * @param {!ImpressionType} impressionType
     * @export
     */
    setImpressionType(impressionType) {
        this.adClient_.setImpressionType(impressionType);
    }

    /**
     * Register that the ad has loaded.
     * @export
     */
    loaded() {
        const vastProperties = new VastProperties(
            /* isSkippable= */ false, 
            /* skipOffset= */ 0, 
            /* isAutoPlay= */ true,
            /* position= */ VideoPosition.STANDALONE);
        this.adEvents_.loaded(vastProperties);
    }

    impressionOccurredAndVideoStart() {
        // Must wait for session to start before firing impression and start.
        if (this.sessionActive_) {
            this.adEvents_.impressionOccurred();
            this.mediaEvents.start(this.player.duration, this.player.muted ? 0 : this.player.volume);
        } else {
            this.shouldCallImpressionOccurredAndStart = true;
        }
    }

    callImpressionOccurredAndVideoStart() {
        this.impressionOccurredAndVideoStart();
        this.shouldCallImpressionOccurredAndStart = false;
    }
}

exports = OmidVideoCreativeSession;
