goog.module('omid.test.common.PostMessageCommunication');

const InternalMessage = goog.require('omid.common.InternalMessage');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const {canTalkToEachOther} = goog.require('omid.test.common.communicationTestUtils');
const {asWindow} = goog.require('omid.test.typingUtils');

class PostMessageWindow {
  constructor() {
    /** @type {!PostMessageWindow} */
    this.postMessageSource;

    /** @type {function(...?): ?} */
    this.onPostMessage;
  }
  setSourceOfPostMessages(source) {
    this.postMessageSource = source;
  }
  postMessage(message, destinationOrigin) {
    expect(destinationOrigin).toEqual('*');

    if (this.onPostMessage) {
      this.onPostMessage({
        data: message,
        source: this.postMessageSource,
      });
    }
  }

  addEventListener(event, callback) {
    if (event === 'message') {
      this.onPostMessage = callback;
    }
  }
}

describe('PostMessageCommunication', () => {
  describe('sendMessage', () => {
    it('canCommunicateToAnother', (done) => {
      const window1 = new PostMessageWindow();
      const window2 = new PostMessageWindow();
      window1.setSourceOfPostMessages(window2);
      window2.setSourceOfPostMessages(window1);

      const communication1 = new PostMessageCommunication(asWindow(window1));
      const communication2 = new PostMessageCommunication(
          asWindow(window2), asWindow(window1));
      canTalkToEachOther(communication1, communication2, done);
    });
  });

  describe('protocol', () => {
    it('ignoresNonOmSdk', (done) => {
      const window1 = new PostMessageWindow();
      const window2 = new PostMessageWindow();
      window1.setSourceOfPostMessages(window2);

      const communication1 = new PostMessageCommunication(asWindow(window1));

      const message = new InternalMessage('guid1', 'method1', '1.0', '[123]');
      const serializedMessage = 'ima://' + JSON.stringify(message.serialize());

      // We do not expect messages not prefixed with the OM SDK protocol to be
      // received, so we fail immediately if we receive one.
      communication1.onMessage = (message, from) => {
        window['fail']('Non om-sdk message received.');
      };

      // Conclude the test after the window1 message event handler has been
      // handled by all event listeners. Since event listeners are fired in the
      // order they are added, this will be fired last. However, just to be
      // safe, a setTimeout 0 is used to defer the conclusion till the current
      // thread is idle.
      window1.addEventListener('message', (event) => {
        if (event.data === serializedMessage) {
          setTimeout(done, 0);
        }
      });

      // Send a message to communication1. This will ultimately result in done
      // being called by the message event handler, above.
      window1.postMessage(serializedMessage, '*');
    });
  });
});
