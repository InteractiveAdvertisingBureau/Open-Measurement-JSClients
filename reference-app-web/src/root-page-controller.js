import {VerificationSettingsKeys} from './constants.js';

/**
 * Controls the view of the root page, in which the user can select settings and
 * a test case to run.
 */
class RootPageController {
  /** :nodoc: */
  constructor() {
    this.overrideTestCaseLinks_();
  }

  /**
   * Overrides the test case links so that the test case query params are
   * attached on click.
   * @private
   */
  overrideTestCaseLinks_() {
    const testCaseLinks = document.getElementsByClassName('testCaseLink');
    for (const testCaseLink of testCaseLinks) {
      testCaseLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href =
            testCaseLink.href + this.buildTestCaseQueryParams_();
      });
    }
  }

  /**
   * Gets the value for the element input with the given id.
   * @param {string} inputElementId The id of the HTML input element.
   * @return {string} The input value, or the empty string.
   * @private
   */
  getInputValue_(inputElementId) {
    const element = document.getElementById(inputElementId);
    if (!element) {
      return '';
    }
    return element.value || '';
  }

  /**
   * Builds a query string to pass on navigation to test cases.
   * @return {string} A query string containing the settings for a test case.
   * @private
   */
  buildTestCaseQueryParams_() {
    let queryString = '';
    Object.values(VerificationSettingsKeys)
        // Exclude since hardcoded.
        .filter((key) => key != VerificationSettingsKeys.TEST_CASE_PAGE_NAME)
        .forEach((key) => {
          const value = this.getInputValue_(key);
          queryString += `&${key}=${encodeURIComponent(value)}`;
        });
    return queryString;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RootPageController();
});
