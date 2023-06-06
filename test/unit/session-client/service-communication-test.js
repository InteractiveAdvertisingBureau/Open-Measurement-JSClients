goog.module('omid.test.sessionClient.ServiceCommunication');

const InternalMessage = goog.require('omid.common.InternalMessage');
const windowUtils = goog.require('omid.common.windowUtils');
const {MessageMethod} = goog.require('omid.common.constants');
const {listenForServiceWindow} = goog.require('omid.sessionClient.ServiceCommunication');
const {resolveGlobalContext} = goog.require('omid.common.windowUtils');

class MockWindow {
  constructor() {
    /** @type {function(...?): ?} */
    this.onPostMessage;
  }

  postMessage(message, source) {
    if (this.onPostMessage) {
      this.onPostMessage({
        data: message,
        source,
      });
    }
  }

  addEventListener(event, callback) {
    if (event === 'message') {
      this.onPostMessage = callback;
    }
  }
}

describe('listenForServiceWindow', () => {
  it('calls the callback with the service window when identified', () => {
    const mockSessionClientWindow = new MockWindow();
    const mockServiceWindow = new MockWindow();
    spyOn(windowUtils, 'resolveGlobalContext')
        .and.returnValue(mockSessionClientWindow);

    const callback = jasmine.createSpy();
    listenForServiceWindow(callback);

    // Messages other than IDENTIFY_SERVICE_WINDOW are ignored.
    const otherMessage = new InternalMessage('guid', 'someMethod', '1.0.3');
    mockSessionClientWindow.postMessage(
        otherMessage.serialize(), /* source= */ mockServiceWindow);
    expect(callback).not.toHaveBeenCalled();

    const message = new InternalMessage(
        'guid', MessageMethod.IDENTIFY_SERVICE_WINDOW, '1.0.3');
    mockSessionClientWindow.postMessage(
        message.serialize(), /* source= */ mockServiceWindow);
    expect(callback).toHaveBeenCalledWith(mockServiceWindow);
  });
});
