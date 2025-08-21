/** @externs */

const VerificationClient = {};
/** {function():boolean} */
VerificationClient.isSupported = (() => {});
/** {function():string} */
VerificationClient.getEnvironment = (() => {});
/** {function():string} */
VerificationClient.injectionSource = (() => {});
/** @type {function(function(), string)} */
VerificationClient.registerSessionObserver = (
      (functionToExecute, vendorKey) => {});
/** @type {function(string, function())} */
VerificationClient.addEventListener = (
      (eventType, functionToExecute) => {});
/** {function(string, function(), function())} */
VerificationClient.sendUrl = (
      (url, successCallback, failureCallback) => {});
/** {function(string, function(), function())} */
VerificationClient.injectJavaScriptResource =
      ((url, successCallback, failureCallback) => {});
/** @type {function(function(), number):number} */
VerificationClient.setTimeout = (
      (callback, timeInMillis) => {});
/** @type {function(number)} */
VerificationClient.clearTimeout = ((timeoutId) => {});
/** @type {function(function(), number):number} */
VerificationClient.setInterval = (
      (callback, timeInMillis) => {});
/** @type {function(number)} */
VerificationClient.clearInterval = ((intervalId) => {});
