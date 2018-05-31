goog.module('omid.test.MockXmlHttpRequest');

/**
 * Mock XMLHttpRequest, which records open calls.
 */
class MockXmlHttpRequest {
  /**
   * Gets the last instantiated MockXmlHttpRequest.
   * @return {!MockXmlHttpRequest}
   */
  static getLatestInstance() {
    return MockXmlHttpRequest.latestInstance_;
  }

  constructor() {
    /** @type {function()} */
    this.onreadystatechange;

    /** @type {number} */
    this.readyState;

    /** @type {number} */
    this.status;

    /** @type {string} */
    this.httpMethod_;

    /** @type {string} */
    this.url_;

    /** @type {boolean} */
    this.asynchronous_;

    // Keep track of the lastest instance.
    /** @type {!MockXmlHttpRequest} */
    MockXmlHttpRequest.latestInstance_ = this;
  }

  /**
   * Gets the http method used in the open call.
   * @return {string}
   */
  get httpMethod() {
    return this.httpMethod_;
  }

  /**
   * Gets the url used in the open call.
   * @return {string}
   */
  get url() {
    return this.url_;
  }

  /**
   * Whether the open call was asynchronous.
   * @return {boolean}
   */
  get asynchronous() {
    return this.asynchronous_;
  }

  /**
   * Prepares a URL to be opened. The URL is opened when send() is called.
   * @param {string} httpMethod HTTP method to use to open the url. e.g. GET.
   * @param {string} url
   * @param {boolean} asynchronous Whether the send call should be asynchronous.
   */
  open(httpMethod, url, asynchronous = false) {
    this.httpMethod_ = httpMethod;
    this.url_ = url;
    this.asynchronous_ = asynchronous;
  }

  /**
   * Send's the opened URL to the remote server.
   */
  send() {}

  /**
   * Invokes the ready state change handler.
   */
  readyStateChange() {
    this.onreadystatechange();
  }
}

MockXmlHttpRequest.DONE = 4;

exports = MockXmlHttpRequest;
