goog.module('omid.common.constants');

/**
 * Enum for ad event types.
 * @enum {string}
 */
const AdEventType = {
  // Common ad event types
  IMPRESSION: 'impression',
  STATE_CHANGE: 'stateChange',
  GEOMETRY_CHANGE: 'geometryChange',

  // Session related event types
  SESSION_START: 'sessionStart',
  SESSION_ERROR: 'sessionError',
  SESSION_FINISH: 'sessionFinish',


  // Media ad event types
  MEDIA: 'media',
  VIDEO: 'video',
  LOADED: 'loaded',
  START: 'start',
  FIRST_QUARTILE: 'firstQuartile',
  MIDPOINT: 'midpoint',
  THIRD_QUARTILE: 'thirdQuartile',
  COMPLETE: 'complete',
  PAUSE: 'pause',
  RESUME: 'resume',
  BUFFER_START: 'bufferStart',
  BUFFER_FINISH: 'bufferFinish',
  SKIPPED: 'skipped',
  VOLUME_CHANGE: 'volumeChange',
  PLAYER_STATE_CHANGE: 'playerStateChange',
  AD_USER_INTERACTION: 'adUserInteraction',
};

/**
 * Enum for ad events type representing media events.
 * @enum {string}
 */

const MediaEventType = {
  // Media ad event types
  LOADED: 'loaded',
  START: 'start',
  FIRST_QUARTILE: 'firstQuartile',
  MIDPOINT: 'midpoint',
  THIRD_QUARTILE: 'thirdQuartile',
  COMPLETE: 'complete',
  PAUSE: 'pause',
  RESUME: 'resume',
  BUFFER_START: 'bufferStart',
  BUFFER_FINISH: 'bufferFinish',
  SKIPPED: 'skipped',
  VOLUME_CHANGE: 'volumeChange',
  PLAYER_STATE_CHANGE: 'playerStateChange',
  AD_USER_INTERACTION: 'adUserInteraction',
};

/**
 * Enum for impression type
 * @enum {string}
 */
const ImpressionType = {
  // Impression type needs to be set by JavaScript session script.
  DEFINED_BY_JAVASCRIPT: 'definedByJavaScript',
  /* The integration is not declaring the criteria for the OMID impression.
  This is the default impression type for OMID 1.2 and for integrations that
  don't set an impression type in an ad session.*/
  UNSPECIFIED: 'unspecified',
  // The integration is using count-on-download criteria for the OMID impression.
  LOADED: 'loaded',
  // The integration is uing begin-to-render criteria for the OMID impression.
  BEGIN_TO_RENDER: 'beginToRender',
  // The integration is using one-pixel criteria for the OMID impression.
  ONE_PIXEL: 'onePixel',
  /* The integration is using viewable criteria (1 second for display, 2 seconds
  for video) for the OMID impression. */
  VIEWABLE: 'viewable',
  /* The integration is using audible criteria (2 seconds of playback with
  non-zero volume) for the OMID impression. */
  AUDIBLE: 'audible',
  // The integration's criteria uses none the above for the OMID impression.
  OTHER: 'other',
};

/**
 * Enum for session error event type.
 * @enum {string}
 */
const ErrorType = {
  GENERIC: 'generic',
  VIDEO: 'video',
  MEDIA: 'media',
};

/**
 * Enum for Ad Session Type. Possible values include; "native" or "html"
 * or "javascript".
 * @enum {string}
 */
const AdSessionType = {
  NATIVE: 'native',
  HTML: 'html',
  JAVASCRIPT: 'javascript',
};

/**
 * Enum describing who owns an event type.
 * @enum {string}
 */
const EventOwner = {
  NATIVE: 'native',
  JAVASCRIPT: 'javascript',
  NONE: 'none',
};

/**
 * Enum for sandboxing mode. The default value is LIMITED. FULL implies both
 * that verification code has access to the creative element and that OMSDK will
 * provide a reference to that creative element via video/slotElement in the
 * context.
 * @enum {string}
 */
const AccessMode = {
  FULL: 'full',
  LIMITED: 'limited',
};

/**
 * Enum for state of the native app.
 * @enum {string}
 */
const AppState = {
  BACKGROUNDED: 'backgrounded',
  FOREGROUNDED: 'foregrounded',
};

/**
 * Enum for Environment OM SDK JS is running in.
 * @enum {string}
 */
const Environment = {
  APP: 'app',
  WEB: 'web',
};

/**
 * Enum for user interaction types with ads in a video player.
 * @enum {string}
 */
const InteractionType = {
  CLICK: 'click',
  INVITATION_ACCEPT: 'invitationAccept',
};

/**
 * Type of Ad creative.
 * @enum {string}
 */
const CreativeType = {
  // Creative type needs to be set by JavaScript session script.
  DEFINED_BY_JAVASCRIPT: 'definedByJavaScript',
  // Remaining values set creative type in native or JavaScript layer.
  HTML_DISPLAY: 'htmlDisplay',
  NATIVE_DISPLAY: 'nativeDisplay',
  VIDEO: 'video',
  AUDIO: 'audio',
};

/**
 * Type of ad media.
 * @enum {string}
 */
const MediaType = {
  DISPLAY: 'display',
  VIDEO: 'video',
};

/**
 * Enum for reasons for viewability calculation results.
 * @enum {string}
 */
const Reason = {
  NOT_FOUND: 'notFound',
  HIDDEN: 'hidden',
  BACKGROUNDED: 'backgrounded',
  VIEWPORT: 'viewport',
  OBSTRUCTED: 'obstructed',
  CLIPPED: 'clipped',
};

/**
 * Enum for features supported by OM SDK JS.
 * @enum {string}
 */
const SupportedFeatures = {
  CONTAINER: 'clid',
  VIDEO: 'vlid',
};

/**
 * Enum for video position, used to set the position in loaded event.
 * @enum {string}
 */
const VideoPosition = {
  PREROLL: 'preroll',
  MIDROLL: 'midroll',
  POSTROLL: 'postroll',
  STANDALONE: 'standalone',
};

/**
 * Enum for video player states.
 * @enum {string}
 */
const VideoPlayerState = {
  MINIMIZED: 'minimized',
  COLLAPSED: 'collapsed',
  NORMAL: 'normal',
  EXPANDED: 'expanded',
  FULLSCREEN: 'fullscreen',
};

/** @enum {string} */
const NativeViewKeys = {
  X: 'x',
  LEFT: 'left', // From DOMRect
  Y: 'y',
  TOP: 'top', // From DOMRect
  WIDTH: 'width',
  HEIGHT: 'height',
  AD_SESSION_ID: 'adSessionId',
  IS_FRIENDLY_OBSTRUCTION_FOR: 'isFriendlyObstructionFor',
  CLIPS_TO_BOUNDS: 'clipsToBounds',
  CHILD_VIEWS: 'childViews',
  END_X: 'endX',
  END_Y: 'endY',
  OBSTRUCTIONS: 'obstructions',
  OBSTRUCTION_CLASS: 'obstructionClass',
  OBSTRUCTION_PURPOSE: 'obstructionPurpose',
  OBSTRUCTION_REASON: 'obstructionReason',
  PIXELS: 'pixels',
};

/**
 * Enum for state change sources.
 * @enum {string}
 */
const MeasurementStateChangeSource = {
  CONTAINER: 'container',
  CREATIVE: 'creative',
};

/**
 * Mark-up for DOM elements.
 * @enum {string}
 */
const ElementMarkup = {
  OMID_ELEMENT_CLASS_NAME: 'omid-element',
};

/** @enum {string} */
const CommunicationType = {
  NONE: 'NONE',
  DIRECT: 'DIRECT',
  POST_MESSAGE: 'POST_MESSAGE',
};

/**
 * Identifier of party providing OMID.
 * @enum {string}
 */
const OmidImplementer = {
  OMSDK: 'omsdk',
};

exports = {
  AccessMode,
  AdEventType,
  AdSessionType,
  AppState,
  CommunicationType,
  CreativeType,
  ElementMarkup,
  Environment,
  EventOwner,
  ErrorType,
  ImpressionType,
  InteractionType,
  MeasurementStateChangeSource,
  MediaType,
  NativeViewKeys,
  OmidImplementer,
  Reason,
  SupportedFeatures,
  MediaEventType,
  VideoPosition,
  VideoPlayerState,
};
