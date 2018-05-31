goog.module('omid.test.common.Communication');

const Communication = goog.require('omid.common.Communication');
const InternalMessage = goog.require('omid.common.InternalMessage');

class TestCommunication extends Communication {
  /** @override */
  sendMessage(message, to) {}
}

/** @type {!Communication} */
let communication;

describe('Communication', () => {
  beforeEach(() => {
    communication = new TestCommunication();
  });

  describe('handleMessage', () => {
    it('invokes onMessage', () => {
      communication.onMessage =
          /** @type{?} */ (jasmine.createSpy('onMessage'));
      communication.handleMessage(new InternalMessage('', '', '', ''),
          undefined);
      expect(communication.onMessage).toHaveBeenCalled();
    });
  });

  describe('generateGuid', () => {
    it('generated guid has the correct format', () => {
      const uuidV4Regex =
          /[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[a-f\d]{4}-[a-f\d]{12}/i;
      expect(communication.generateGuid().match(uuidV4Regex)).toBeTruthy();
    });
    it('generated guids do not collide', () => {
      expect(communication.generateGuid())
          .not.toEqual(communication.generateGuid());
    });
  });

  describe('serialize', () => {
    it('serializes to JSON', () => {
      let x = {test: 123};
      expect(communication.serialize(x)).toEqual(JSON.stringify(x));
      x = {y: {z: true}};
      expect(communication.serialize(x)).toEqual(JSON.stringify(x));
      x = /** @type {?} */ (null);
      expect(communication.serialize(x)).toEqual(JSON.stringify(x));
      x = [null, 0, '0', 0.1, false];
      expect(communication.serialize(x)).toEqual(JSON.stringify(x));
      x = {test: undefined, a: 1};
      expect(communication.serialize(x)).toEqual(JSON.stringify({a: 1}));
      x = /** @type {?} */ (undefined);
      expect(communication.serialize(x)).toBeUndefined();
    });
  });

  describe('deserialize', () => {
    it('deserializes json', () => {
      let x = `{"test": 123}`;
      expect(communication.deserialize(x)).toEqual(JSON.parse(x));
      x = `{"y": {"z": true}}`;
      expect(communication.deserialize(x)).toEqual(JSON.parse(x));
      x = `null`;
      expect(communication.deserialize(x)).toEqual(JSON.parse(x));
      x = `[null, 0, "0", 0.1, false]`;
      expect(communication.deserialize(x)).toEqual(JSON.parse(x));
      expect(() => communication.deserialize(/** @type {?} */ (undefined))).toThrow();
    });
  });
});
