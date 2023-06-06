goog.module('omid.test.common.PostMessageCommunication');

const InternalMessage = goog.require('omid.common.InternalMessage');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {expectTwoWayCommunication} = goog.require('omid.test.common.communicationTestUtils');
const {asWindow} = goog.require('omid.test.typingUtils');

class PostMessageWindow {
  constructor() {
    /** @type {!PostMessageWindow} */
    this.postMessageSource;

    /** @type {function(...?): ?} [] */
    this.onPostMessage = [];
  }

  setSourceOfPostMessages(source) {
    this.postMessageSource = source;
  }

  postMessage(message, destinationOrigin) {
    expect(destinationOrigin).toEqual('*');

    for (let i = 0; i < this.onPostMessage.length; i++) {
      this.onPostMessage[i]({
        data: message,
        source: this.postMessageSource,
      });
    }
  }

  addEventListener(event, callback) {
    if (event === 'message') {
      this.onPostMessage.push(callback);
    }
  }
}

describe('PostMessageCommunication', () => {
  describe('sendMessage', () => {
    it('can perform two-way communication', () => {
      const window1 = new PostMessageWindow();
      const window2 = new PostMessageWindow();
      window1.setSourceOfPostMessages(window2);
      window2.setSourceOfPostMessages(window1);

      const communication1 = new PostMessageCommunication(asWindow(window1));
      const communication2 = new PostMessageCommunication(
          asWindow(window2), asWindow(window1));
      expectTwoWayCommunication(communication1, communication2);
    });
  });

  describe('protocol', () => {
    it('ignores messages not from OMSDK', () => {
      const window1 = new PostMessageWindow();
      const window2 = new PostMessageWindow();
      window1.setSourceOfPostMessages(window2);
      const communication1 = new PostMessageCommunication(asWindow(window1));

      let spy = {
        windowReceived: (message, from) => {},
        communicationReceived: (message, from) => {},
      };
      spyOn(spy, 'windowReceived');
      spyOn(spy, 'communicationReceived');

      window1.addEventListener('message',
        (message, from) => spy.windowReceived());

      communication1.onMessage = (message, from) => spy.communicationReceived();

      // Send a non-OMSDK message.
      const message = new InternalMessage('guid1', 'method1', '1.0', '[123]');
      const serializedMessage = 'ima://' + JSON.stringify(message.serialize());
      window1.postMessage(serializedMessage, '*');

      // The PostMessageWindow mock should invoke all callbacks synchronously.
      expect(spy.windowReceived).toHaveBeenCalled();

      // Non OM SDK message should not pass through.
      expect(spy.communicationReceived).not.toHaveBeenCalled();
    });
  });
});
