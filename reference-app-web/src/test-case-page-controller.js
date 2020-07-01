import CreativeIframeHost from './creative-iframe-host.js';
import ViewabilityControls from './viewability-controls.js';
import {ClipRangeEvent, EventTypes} from './events.js';
import {getQueryParams, parseVerificationSettings} from './query-utils.js';
import {VerificationSettings} from './typedefs.js';

/** Controls the view of a generic test case page. */
class TestCasePageController {
  /**
   * @param {!Element} creativeContainer The element in which to contain the
   *     creative iframe.
   * @param {!ViewabilityControls} viewabilityControls Controls for manipulating
   *     viewability.
   * @param {!VerificationSettings} verificationSettings The settings to use for
   *     the creative and its measurement.
   */
  constructor(
      creativeContainer, viewabilityControls, verificationSettings) {
    /** @private @const {!Element} */
    this.creativeContainer_ = creativeContainer;

    /**
     * Builds and hosts the creative's iframe.
     * @private @const {!CreativeIframeHost}
     */
    this.creativeIframeHost_ = new CreativeIframeHost(verificationSettings);
    this.creativeContainer_.appendChild(this.creativeIframeHost_.iframe);

    viewabilityControls.addEventListener(
        EventTypes.CLIP_RANGE,
        (event) =>
            this.clipRangeDidChange_(/** @type {!ClipRangeEvent} */ (event)));
  }

  /**
   * Handles a change in the clipping slider, then clipping the creative by that
   * amount.
   * @param {!ClipRangeEvent} event
   * @private
   */
  clipRangeDidChange_(event) {
    const scrollOffset = `${event.clipRange}%`;
    this.creativeIframeHost_.iframe.style.left = scrollOffset;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const clipRangeInput = document.getElementById('clipControl');
  const clipRangeValueLabel = document.getElementById('clipControlValue');
  if (!clipRangeInput || !clipRangeValueLabel) {
    throw new Error('Could not find viewability controls elements.');
  }
  const creativeContainer = document.getElementById('creativeContainer');
  if (!creativeContainer) {
    throw new Error('Could not find creative container elements.');
  }
  const queryParams = getQueryParams(document.location.search.substring(1));
  const verificationSettings = parseVerificationSettings(queryParams);
  if (!verificationSettings) {
    throw new Error('Could not parse settings from URL.');
  }

  const viewabilityControls =
      new ViewabilityControls(clipRangeInput, clipRangeValueLabel);
  new TestCasePageController(
      creativeContainer, viewabilityControls, verificationSettings);
});
