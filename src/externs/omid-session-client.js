/** @externs */

const AdEvents = {};
/** @type {function():void} */
AdEvents.impressionOccurred = (() => {});
/** @type {function(?Object=):void} */
AdEvents.loaded = (() => {});

const AdSession = {};
/** @type {function(string, string):void} */
AdSession.error = (() => {});
/** @type {function():void} */
AdSession.finish = (() => {});
/** @type {function():string} */
AdSession.getAdSessionId = (() => {});
/** @type {function():boolean} */
AdSession.isSupported = (() => {});
/** @type {function(function(!Event)):void} */
AdSession.registerSessionObserver = (() => {});
/** @type {function(string):void} */
AdSession.setCreativeType = (() => {});
/** @type {function(?Object):void} */
AdSession.setElementBounds = (() => {});
/** @type {function(string):void} */
AdSession.setImpressionType = (() => {});
/** @type {function():void} */
AdSession.start = (() => {});

const Context = {};
/** @type {function(!Window):void} */
Context.setServiceWindow = (() => {});
/** @type {function(?HTMLElement):void} */
Context.setSlotElement = (() => {});
/** @type {function(?HTMLVideoElement):void} */
Context.setVideoElement = (() => {});

const MediaEvents = {};
/** @type {function(string):void} */
MediaEvents.adUserInteraction = (() => {});
/** @type {function():void} */
MediaEvents.bufferFinish = (() => {});
/** @type {function():void} */
MediaEvents.bufferStart = (() => {});
/** @type {function():void} */
MediaEvents.complete = (() => {});
/** @type {function():void} */
MediaEvents.firstQuartile = (() => {});
/** @type {function():void} */
MediaEvents.midpoint = (() => {});
/** @type {function():void} */
MediaEvents.pause = (() => {});
/** @type {function(string):void} */
MediaEvents.playerStateChange = (() => {});
/** @type {function():void} */
MediaEvents.resume = (() => {});
/** @type {function():void} */
MediaEvents.skipped = (() => {});
/** @type {function(number, number):void} */
MediaEvents.start = (() => {});
/** @type {function():void} */
MediaEvents.thirdQuartile = (() => {});
/** @type {function(number):void} */
MediaEvents.volumeChange = (() => {});
