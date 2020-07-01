/** @fileoverview Custom event types. */

/**
 * A collection of shared event types.
 * @const @enum {string}
 */
const EventTypes = {
  CLIP_RANGE: 'clipRange',
};

/** An event representing a change in the creative clipping amount. */
class ClipRangeEvent extends Event {
  /**
   * @param {number} clipRange A number from 0 to 100, decribing the amount the
   *     creative should be clipped. */
  constructor(clipRange) {
    super(EventTypes.CLIP_RANGE);

    /** @const {number} */
    this.clipRange = clipRange;
  }
}

export {
  ClipRangeEvent,
  EventTypes,
};
