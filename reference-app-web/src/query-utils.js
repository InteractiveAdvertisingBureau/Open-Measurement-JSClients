/** @fileoverview URL query utility functions. */

import {VerificationSettings} from './typedefs.js';
import {VerificationSettingsKeys} from './constants.js';

/**
 * Builds a data object containing the keys and values from the given query
 * string.
 * @param {string} queryString
 * @return {!Object}
 */
function getQueryParams(queryString) {
  const queryParams = {};
  const queryPairs = queryString.split('&');
  queryPairs.forEach((queryPair) => {
    const splitPair = queryPair.split('=');
    queryParams[decodeURIComponent(splitPair[0])] =
        decodeURIComponent(splitPair[1]);
  });
  return queryParams;
}

/**
 * Parses verification settings in a data object into a typed object.
 * @param {!Object} queryParams
 * @return {?VerificationSettings}
 */
function parseVerificationSettings(queryParams) {
  const settings = {};
  const stringKeys = [
    VerificationSettingsKeys.ACCESS_MODE,
    VerificationSettingsKeys.MEDIA_URL,
    VerificationSettingsKeys.OMSDK_URL,
    VerificationSettingsKeys.TEST_CASE_PAGE_NAME,
    VerificationSettingsKeys.VENDOR_KEY,
    VerificationSettingsKeys.VERIFICATION_PARAMETERS,
    VerificationSettingsKeys.VERIFICATION_SCRIPT_URL,
  ];
  for (const key of stringKeys) {
    const val = queryParams[key];
    if (typeof val == 'string') {
      settings[key] = val;
    } else {
      return null;
    }
  }
  return /** @type {!VerificationSettings} */ (settings);
}

export {
  getQueryParams,
  parseVerificationSettings,
};
