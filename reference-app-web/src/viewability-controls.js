import ExtendableEventTarget from './extendable-event-target.js';
import {ClipRangeEvent} from './events.js';

/** Container for viewability-altering controls. */
class ViewabilityControls extends ExtendableEventTarget {
  /**
   * @param {!Element} clipRangeInput A slider for modifying creative clipping.
   * @param {!Element} clipRangeValueLabel A label for displaying the clipping
   *    amount.
   */
  constructor(clipRangeInput, clipRangeValueLabel) {
    super();

    /** @private @const {!Element} */
    this.clipRangeValueLabel_ = clipRangeValueLabel;

    clipRangeInput.addEventListener(
        'input', () => this.clipRangeDidChange_(clipRangeInput.value));
  }

  /**
   * @param {number} clipRange
   * @private
   */
  clipRangeDidChange_(clipRange) {
    const scrollOffset = `${clipRange}%`;
    this.clipRangeValueLabel_.innerText = scrollOffset;
    this.dispatchEvent(new ClipRangeEvent(clipRange));
  }
}

export default ViewabilityControls;
