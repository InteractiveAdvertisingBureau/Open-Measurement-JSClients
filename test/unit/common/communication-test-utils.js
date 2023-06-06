goog.module('omid.test.common.communicationTestUtils');

const Communication = goog.require('omid.common.Communication');
const InternalMessage = goog.require('omid.common.InternalMessage');

/**
 *
 * @param {!Communication} communication1
 * @param {!Communication} communication2
 */
function expectTwoWayCommunication(communication1, communication2) {
  const testMessage1 = new InternalMessage('guid1', 'method1', '1.0', '[123]');
  const testMessage2 = new InternalMessage('guid2', 'method2', '1.0', '[321]');

  let spy = {
    communication1Received: (message, from) => {
      // When communication1 receives a message from communication2, respond
      // with another message.
      expect(message.serialize()).toEqual(testMessage1.serialize());
      communication1.sendMessage(testMessage2, from);
    },
    communication2Received: (message, from) => {
      // When the response message from communication1 is received by
      // communication2, complete the test.
      expect(message.serialize()).toEqual(testMessage2.serialize());
    },
  };
  spyOn(spy, 'communication1Received');
  spyOn(spy, 'communication2Received');

  communication1.onMessage = (message, from) => spy.communication1Received();
  communication2.onMessage = (message, from) => spy.communication2Received();

  // Send a message to communication1.
  communication2.sendMessage(testMessage1);

  expect(spy.communication1Received).toHaveBeenCalled;
  expect(spy.communication2Received).toHaveBeenCalled;
}

exports = {expectTwoWayCommunication};
