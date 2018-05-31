goog.module('omid.test.common.communicationTestUtils');

const Communication = goog.require('omid.common.Communication');
const InternalMessage = goog.require('omid.common.InternalMessage');

/**
 *
 * @param {!Communication} communication1
 * @param {!Communication} communication2
 * @param {function()} done
 */
function canTalkToEachOther(communication1, communication2, done) {
  const testMessage1 = new InternalMessage('guid1', 'method1', '1.0', '[123]');
  const testMessage2 = new InternalMessage('guid2', 'method2', '1.0', '[321]');
  // When communication1 receives a message from communication2, it will respond
  // with another message.
  communication1.onMessage = (message, from) => {
    expect(message.serialize()).toEqual(testMessage1.serialize());
    communication1.sendMessage(testMessage2, from);
  };
  // When the response message from communication1 is received by
  // communication2, complete the test.
  communication2.onMessage = (message, from) => {
    expect(message.serialize()).toEqual(testMessage2.serialize());
    done();
  };
  // Send a message to communication1. Once received, a response message will be
  // sent, which ultimately will complete the test. Here we use the signature
  // that uses the destination stored as instance state.
  communication2.sendMessage(testMessage1);
}

exports = {canTalkToEachOther};
