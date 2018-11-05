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


  // Video ad event types
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
 * Enum for ad events type representing video events.
 * @enum {string}
 */
const VideoEventType = {
  // Video ad event types
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
 * Enum for session error event type.
 * @enum {string}
 */
const ErrorType = {
  GENERIC: 'generic',
  VIDEO: 'video',
};

/**
 * Enum for Ad Session Type. Possible values include; "native" or "html"
 * @enum {string}
 */
const AdSessionType = {
  NATIVE: 'native',
  HTML: 'html',
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
  MOBILE: 'app',
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
  ElementMarkup,
  Environment,
  EventOwner,
  ErrorType,
  InteractionType,
  MeasurementStateChangeSource,
  MediaType,
  NativeViewKeys,
  OmidImplementer,
  Reason,
  SupportedFeatures,
  VideoEventType,
  VideoPosition,
  VideoPlayerState,
};
