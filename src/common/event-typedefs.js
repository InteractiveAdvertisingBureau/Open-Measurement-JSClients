goog.module('omid.common.eventTypedefs');

const constants = goog.require('omid.common.constants');

/**
 * Represents an ad event that verification partners can subscribe to. This is
 * the definition of what the partner will get back from OMID JS, when the
 * corresponding event has been triggered.
 * @typedef {{
 *   adSessionId: string,
 *   timestamp: number,
 *   type: !constants.AdEventType,
 *   data: ?,
 * }}
 */
let Event;

/**
 * Represents the native app or web TV app running OM SDK, and the
 * OM SDK library version where applicable.
 * @typedef {{
 *   libraryVersion: (string|undefined),
 *   appId: string,
 * }}
 */
let App;

/**
 * Contains version information about the OMID JS.
 * @typedef {{
 *   omidImplementer: string,
 *   serviceVersion: string,
 *   sessionClientVersion: (string|undefined),
 *   partnerName: (string|undefined),
 *   partnerVersion: (string|undefined),
 * }}
 */
let OmidJsInfo;

/**
 * Identifies an integration partner by name and version of the code.
 * @typedef {{
 *   partnerName: string,
 *   partnerVersion: string,
 * }}
 */
let OmidNativeInfo;

/**
 * Identifies the device the native layer of the OM SDK is running on.
 * @typedef {{
  *   deviceType: string,
  *   os: string,
  *   osVersion: string,
  * }}
  */
 let DeviceInfo;

// All of the keys of the following object are undefined initially, except for
// omidJsInfo which will contain the version number of the service.
/**
 * @typedef {{
 *   apiVersion: (string|undefined),
 *   environment: (!constants.Environment|undefined),
 *   accessMode: (!constants.AccessMode|undefined),
 *   adSessionType: (!constants.AdSessionType|undefined),
 *   sessionOwner: (!constants.SessionOwner|undefined),
 *   supports: (!Array<constants.SupportedFeatures>|undefined),
 *   omidNativeInfo: (!OmidNativeInfo|undefined),
 *   omidJsInfo: !OmidJsInfo,
 *   app: (!App|undefined),
 *   deviceInfo: (!DeviceInfo|undefined),
 *   deviceCategory: (!constants.DeviceCategory|undefined),
 *   customReferenceData: (?Object|undefined),
 *   canMeasureVisibility: (boolean|undefined),
 *   underEvaluation: (boolean|undefined),
 *   universalAdId: (?Object|undefined),
 * }}
 */
let Context;

/**
 * The ad session configuration is a JSON object containing all key data about
 * native ad session. The ad session configuration structure has been detailed
 * below;
 * @typedef {{
 *   impressionOwner: !constants.EventOwner,
 *   videoEventsOwner: (!constants.EventOwner|undefined),
 *   mediaEventsOwner: (!constants.EventOwner|undefined),
 *   creativeType: (!constants.CreativeType|undefined),
 *   impressionType: (!constants.ImpressionType|undefined),
 *   isolateVerificationScripts: boolean,
 * }}
 */
let AdSessionConfiguration;

/**
 * @typedef {{
 *   viewport: !Viewport,
 *   adView: !AdViewEventData,
 * }}
 */
let GeometryChangeEventData;

/**
 * Represents geometry data of an ad view after processing all parent views to
 * check whether the ad view has been clipped.
 * @typedef {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height : number,
 *   pixels: number,
 * }}
 */
let Geometry;

/**
 * @typedef {{
 *   eventViewport: !Viewport,
 *   eventAdView: !AdViewEventData,
 *   creativeType: !constants.CreativeType,
 *   mediaType: !constants.MediaType,
 *   videoEventAdaptorType: (string|undefined),
 *   videoEventAdaptorVersion: (string|undefined),
 *   impressionType: !constants.ImpressionType,
 * }}
 */
let ImpressionEventData;

/**
 * Represents geometry data of an on screen ad view after processing all parent
 * views to check whether the ad view has been clipped or obstructed.
 * @typedef {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 *   pixels: number,
 *   obstructions: !Array,
 * }}
 */
let OnScreenGeometry;

/**
 * @typedef {{
 *   timestamp: number,
 * }}
 */
let ActivityEventData;

/**
 * @typedef {{
 *   context: !Context,
 *   verificationParameters: (string|undefined),
 *   supportsLoadedEvent: (boolean|undefined),
 *   impressionType: !constants.ImpressionType,
 *   creativeType: !constants.CreativeType,
 *   mediaType: !constants.MediaType,
 *   pageUrl: ?string,
 *   contentUrl: ?string,
 *   lastActivity: ?ActivityEventData
 * }}
 */
let SessionStartEventData;

/**
 * Captures key VAST properties so they can be shared with all registered
 * verification providers.
 * @typedef {{
 *   isSkippable: boolean,
 *   skipOffset: number,
 *   isAutoPlay: boolean,
 *   position: !constants.VideoPosition,
 * }}
 */
let VastProperties;

/**
 * Represents the device viewport.
 * @typedef {{
 *   width: number,
 *   height: number,
 * }}
 */
let Viewport;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 *   adSessionId: (string|undefined),
 *   isFriendlyObstructionFor: (string|undefined),
 *   clipToBounds: (boolean|undefined),
 *   notVisibleReason: (string|undefined),
 *   childViews: (Array<!NativeViewInfo>|undefined),
 * }}
 */
let NativeViewInfo;

/**
 * @typedef {{
 *   skippable: boolean,
 *   skipOffset: (number|undefined),
 *   autoPlay: boolean,
 *   position: !constants.VideoPosition,
 *   creativeType: !constants.CreativeType,
 *   mediaType: !constants.MediaType,
 *   impressionType: !constants.ImpressionType,
 * }}
 */
let LoadedVideoEventData;

/**
 * @typedef {{
 *   creativeType: !constants.CreativeType,
 *   mediaType: !constants.MediaType,
 *   impressionType: !constants.ImpressionType,
 * }}
 */
let LoadedDisplayEventData;

/**
 * @typedef {{
 *   duration: number,
 *   mediaPlayerVolume: number,
 *   videoPlayerVolume: number,
 *   deviceVolume: number,
 * }}
 */
let StartVideoEventData;

/**
 * @typedef {{
 *   mediaPlayerVolume: number,
 *   videoPlayerVolume: number,
 *   deviceVolume: number,
 * }}
 */
let VolumeChangedEventData;

/**
 * @typedef {{
 *   state: !constants.VideoPlayerState,
 * }}
 */
let PlayerStateChangedEventData;

/**
 * @typedef {{
 *   interactionType: !constants.InteractionType,
 * }}
 */
let AdUserInteraction;

/**
 * @typedef {{
 *   message: string,
 * }}
 */
let Error;

/**
 * @typedef {
 *   !LoadedVideoEventData|
 *   !StartVideoEventData|
 *   !VolumeChangedEventData|
 *   !PlayerStateChangedEventData|
 *   !AdUserInteraction|
 *   !Error
 * }
 */
let VideoEventData;

/**
 * @typedef {function(!GeometricEvent)}
 */
let GeometryChangeCallback;

/**
 * @typedef {function(!ImpressionEvent)}
 */
let ImpressionCallback;

/**
 * Handles when a session lifecycle event has been triggered.
 * @typedef {function(!SessionStartEvent)}
 */
let SessionObserverCallback;

/**
 * Callback for attestation mechanism responses.
 * @typedef {function(boolean, (string|undefined))} AttestCallback
 * param 1 - A boolean indicating, whether request was successfully sent
 *     to the attestation mechanism
 * param 2 - A string - Response code indicating result statuses like:
 *     TOO_MANY_REQUESTS - Multiple attempts in single session
 *     UNSUPPORTED_MECHANISM - Attestation not supported
 *     FAILED_TO_TRIGGER - Could not initiate attestation
 *     SAMPLING_REJECTED - Request was rejected while sampling to next stage
 *     SESSION_ATTESTATION_LIMIT_EXCEEDED - Request is rejected as the threshold
 *           for the number of attest calls per session has already been reached
 *     SUCCESS - Request for attestation made to native layer successfully
 */
let AttestCallback;

/**
 * @typedef {function(!VideoEvent)}
 */
let VideoCallback;

/**
 * @typedef {Event<!AdViewEventData>}
 */
let AdViewEvent;

/**
 * @typedef {Event<!SessionStartEventData>}
 */
let SessionStartEvent;

/**
 * @typedef {Event<!GeometryChangeEventData>}
 */
let GeometricEvent;

/**
 * @typedef {Event<!ImpressionEventData>}
 */
let ImpressionEvent;

/**
 * @typedef {Event<!VideoEventData>}
 */
let VideoEvent;

/**
 * @typedef {
 *   !AdViewEventData|
 *   !SessionStartEventData|
 *   !GeometryChangeEventData|
 *   !LoadedDisplayEventData|
 *   !ImpressionEventData|
 *   !VideoEventData|
 *   undefined
 * }
 */
let EventData;

/**
 * Provides information about the ad container geometry.
 * @typedef {{
 *   percentageInView: number,
 *   pixelsInView: number,
 *   geometry: !Geometry,
 *   onScreenGeometry: !OnScreenGeometry,
 *   reasons: !Array<!constants.Reason>,
 *   measuringElement: (boolean|undefined),
 * }}
 */
let AdViewEventData;

/**
 * Represents a single verification vendor script.
 * @typedef {{
  *   resourceUrl: string,
  *   vendorKey: (string|undefined),
  *   verificationParameters: (string|undefined),
  *   accessMode: (string|undefined),
  * }}
  */
 let VerificationScriptResource;

/**
 * Represents a payload structure for the Attest API request.
 * Fields:
 * - mechanism: Attestation mechanism name to be used
 *    (e.g., 'FireTVFOSDAT', 'ApplePAT')
 * - version: Specific version of the attestation mechanism
 * - payload: Map containing key-value pairs of mechanism specific data
 * @typedef {{
 *   mechanism: string,
 *   version: string,
 *   payload: !Map<string, string>,
 * }}
 * @example
 * const attestPayload = {
 *   mechanism: 'FireTVFOSDAT',
 *   version: '1.0',
 *   payload: new Map([
 *     ['verifierUrl', 'https://xyz-verifier.com'],
 *   ])
 * };
 */
let AttestRequestPayload;

/**
 * Represents the structure of an attestation mechanism exposed to
 * verification clients.
 * Fields:
 * - mechanism: Name of the supported attestation mechanism
 *    (e.g., 'FireTVFOSDAT', 'ApplePAT')
 * - version: Version of the supported attestation mechanism
 * @typedef {{
 *   mechanism: string,
 *   version: string,
 * }}
 */
let SupportedAttestationMechanism;

/**
 * Represents a list of supported attestation mechanisms in a device exposed to
 * verification clients.
 * Fields:
 * - supportedAttestationMechanisms: List of supported attestation
 *   mechanisms as exposed to client
 * @typedef {{
 *   supportedAttestationMechanisms: !Array<!SupportedAttestationMechanism>,
 * }}
 */
let SupportedAttestationsEventData;

exports = {
  AdSessionConfiguration,
  AdViewEventData,
  App,
  OmidJsInfo,
  OmidNativeInfo,
  DeviceInfo,
  Context,
  Event,
  GeometryChangeEventData,
  Geometry,
  ImpressionEventData,
  OnScreenGeometry,
  SessionStartEventData,
  VastProperties,
  Viewport,
  NativeViewInfo,
  LoadedDisplayEventData,
  LoadedVideoEventData,
  StartVideoEventData,
  VolumeChangedEventData,
  PlayerStateChangedEventData,
  AdUserInteraction,
  Error,
  VideoEventData,
  GeometryChangeCallback,
  ImpressionCallback,
  SessionObserverCallback,
  AttestCallback,
  VideoCallback,
  AdViewEvent,
  SessionStartEvent,
  GeometricEvent,
  ImpressionEvent,
  VideoEvent,
  EventData,
  VerificationScriptResource,
  ActivityEventData,
  AttestRequestPayload,
  SupportedAttestationsEventData,
};
