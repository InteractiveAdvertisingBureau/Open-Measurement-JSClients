goog.module('omid.test.common.DirectCommunication');

const DirectCommunication = goog.require('omid.common.DirectCommunication');
const {canTalkToEachOther} = goog.require('omid.test.common.communicationTestUtils');

describe('DirectCommunication', () => {
  it('exports a handle to the message handler, for other communications to use',
     () => {
    expect(DirectCommunication.prototype['handleExportedMessage'])
        .toBe(DirectCommunication.prototype.handleExportedMessage);
  });
  describe('sendMessage', () => {
    it('can communicate to another communication', (done) => {
      const communication1 = new DirectCommunication();
      const communication2 = new DirectCommunication(communication1);
      canTalkToEachOther(communication1, communication2, done);
    });
  });
});
