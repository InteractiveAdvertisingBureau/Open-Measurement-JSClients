goog.module('omid.test.common.InternalMessage');

const InternalMessage = goog.require('omid.common.InternalMessage');

describe('InternalMessage', () => {
  describe('isValidSerializedMessage', () => {
    it('can detect valid serialized message', () => {
      expect(InternalMessage.isValidSerializedMessage({
        'omid_message_guid': 'ae092893472354795023',
        'omid_message_method': 'VerificationScript.getVersion',
        'omid_message_version': '1.0.0',
        'omid_message_args': '[]',
      })).toEqual(true);
      expect(InternalMessage.isValidSerializedMessage({
        'omid_message_guid': 'ae092893472354795023',
        'omid_message_method': 'VerificationScript.getVersion',
        'omid_message_version': '1.0.0',
      })).toEqual(true);
    });

    it('can detect invalid serialized message', () => {
      expect(InternalMessage.isValidSerializedMessage({
        'guid': 'ae092893472354795023',
        'method': 'VerificationScript.getVersion',
        'args': '[]',
      })).toEqual(false);
      expect(InternalMessage.isValidSerializedMessage({
        'omid_message_guid': 'ae092893472354795023',
        'omid_message_args': '[]',
      })).toEqual(false);
      expect(InternalMessage.isValidSerializedMessage({
        'omid_message_guid': 'ae092893472354795023',
        'omid_message_args': '[]',
        'omid_message_method': 'VerificationService.getVersion',
      })).toEqual(false);
      expect(InternalMessage.isValidSerializedMessage({
        'omid_message_guid': 'ae092893472354795023',
        'omid_message_args': '[]',
        'omid_message_version': '1.0.0',
      })).toEqual(false);
      expect(InternalMessage.isValidSerializedMessage({
        'omid_message_args': '[]',
        'omid_message_method': 'VerificationService.getVersion',
        'omid_message_version': '1.0.0',
      })).toEqual(false);
      expect(InternalMessage.isValidSerializedMessage({
        'omid_message_method': 'VerificationScript.getVersion',
      })).toEqual(false);
      expect(InternalMessage.isValidSerializedMessage({
        'unknown': 'value',
      })).toEqual(false);
      expect(InternalMessage.isValidSerializedMessage(/** @type {?} */ (
          undefined))).toEqual(false);
    });
  });

  describe('deserialize', () => {
    it('can deserialize a valid, serialize message', () => {
      const guid = 'ae092893472354795023';
      const method = 'VerificationScript.getVersion';
      const version = '1.0.0';
      const args = '[]';
      const message = InternalMessage.deserialize({
        'omid_message_guid': guid,
        'omid_message_method': method,
        'omid_message_version': version,
        'omid_message_args': args,
      });
      expect(message.guid).toEqual(guid);
      expect(message.method).toEqual(method);
      expect(message.version).toEqual(version);
      expect(message.args).toEqual(args);
    });
    it('throws an error if the message is invalid', () => {
      expect(() => InternalMessage.deserialize(/** @type {?} */ (undefined)))
          .toThrow();
    });
  });

  describe('serialize', () => {
    it('can serialize a message', () => {
      const guid = 'ae092893472354795023';
      const method = 'VerificationScript.getVersion';
      const version = '1.0.0';
      const args = '[]';
      const testMessage = new InternalMessage(guid, method, version, args);
      expect(InternalMessage.isValidSerializedMessage(testMessage.serialize()))
          .toEqual(true);
    });
  });
});
