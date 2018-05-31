goog.module('omid.common.VastProperties');

const {VideoPosition} = goog.require('omid.common.constants');

/**
 * Captures key VAST properties so they can be shared with all registered
 * verification providers.
 * @unrestricted
 */
class VastProperties {
  /**
   * @param {boolean} isSkippable indicating whether the video player will
   *   allow the video content to be skipped.
   * @param {number} skipOffset indicating when the skip button will be
   *   displayed if the video content is skippable.
   * @param {boolean} isAutoPlay whether the video will auto-play content,
   * @param {!VideoPosition} position of the video in relation to other content.
   */
  constructor(isSkippable, skipOffset, isAutoPlay, position) {
    this.isSkippable = isSkippable;
    this.skipOffset = skipOffset;
    this.isAutoPlay = isAutoPlay;
    this.position = position;
  }
}

exports = VastProperties;
