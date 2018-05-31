goog.module('omid.common.ArgsSerDeTest');

const {serializeMessageArgs, deserializeMessageArgs} = goog.require('omid.common.ArgsSerDe');

describe('ArgsSerDe', () => {
  const versionsBefore = ['1.0.2', '1.0.0'];
  const versionsAfter = ['1.0.3', '1.0.10', '2.0.0', '1.5.0'];
  const invalidVersions = ['invalid', '1.0', '10'];
  describe('serializeMessageArgs', () => {
    it('serializes args to string if version before 1.0.3', () => {
      versionsBefore.forEach((version) => {
        expect(serializeMessageArgs(version, [])).toEqual('[]');
        expect(serializeMessageArgs(version, {})).toEqual('{}');
        expect(serializeMessageArgs(version, {a: 5})).toEqual('{\"a\":5}');
        expect(serializeMessageArgs(version, {a: 'b'})).toEqual(
            '{\"a\":\"b\"}');
        expect(serializeMessageArgs(version, undefined)).toBeUndefined();
        expect(serializeMessageArgs(version, null)).toEqual('null');
        expect(serializeMessageArgs(version, [{a: 5}, {a: '5'}])).toEqual(
            '[{\"a\":5},{\"a\":\"5\"}]');
      });
    });
    it('serializes args to string if version is invalid', () => {
      invalidVersions.forEach((version) => {
        expect(serializeMessageArgs(version, [])).toEqual('[]');
        expect(serializeMessageArgs(version, {})).toEqual('{}');
        expect(serializeMessageArgs(version, {a: 5})).toEqual('{\"a\":5}');
        expect(serializeMessageArgs(version, {a: 'b'})).toEqual(
            '{\"a\":\"b\"}');
        expect(serializeMessageArgs(version, undefined)).toBeUndefined();
        expect(serializeMessageArgs(version, null)).toEqual('null');
        expect(serializeMessageArgs(version, [{a: 5}, {a: '5'}])).toEqual(
            '[{\"a\":5},{\"a\":\"5\"}]');
      });
    });
    it('does not serialize args if version after 1.0.3', () => {
      versionsAfter.forEach((version) => {
        expect(serializeMessageArgs(version, [])).toEqual([]);
        expect(serializeMessageArgs(version, {})).toEqual({});
        expect(serializeMessageArgs(version, {a: 5})).toEqual({a: 5});
        expect(serializeMessageArgs(version, {a: '5'})).toEqual({a: '5'});
        expect(serializeMessageArgs(version, undefined)).toBeUndefined();
        expect(serializeMessageArgs(version, null)).toEqual(null);
        expect(serializeMessageArgs(version, [{a: 5}, {a: '5'}])).toEqual(
            [{a: 5}, {a: '5'}]);
      });
    });
  });
  describe('deserializeMessageArgs', () => {
    it('deserializes strings to array args if version before 1.0.3', () => {
      versionsBefore.forEach((version) => {
        expect(deserializeMessageArgs(version, '[]')).toEqual([]);
        expect(deserializeMessageArgs(version, '{}')).toEqual({});
        expect(deserializeMessageArgs(version, '{\"a\":5}')).toEqual({a: 5});
        expect(deserializeMessageArgs(version, '{\"a\":\"5\"}')).toEqual(
            {a: '5'});
        expect(deserializeMessageArgs(version, '')).toEqual([]);
        expect(deserializeMessageArgs(version, undefined)).toEqual([]);
        expect(deserializeMessageArgs(version, null)).toEqual([]);
        expect(deserializeMessageArgs(version, 5)).toEqual([]);
      });
    });
    it('deserializes strings to array args if version is invalid', () => {
      invalidVersions.forEach((version) => {
        expect(deserializeMessageArgs(version, '[]')).toEqual([]);
        expect(deserializeMessageArgs(version, '{}')).toEqual({});
        expect(deserializeMessageArgs(version, '{\"a\":5}')).toEqual({a: 5});
        expect(deserializeMessageArgs(version, '{\"a\":\"5\"}')).toEqual(
            {a: '5'});
        expect(deserializeMessageArgs(version, '')).toEqual([]);
        expect(deserializeMessageArgs(version, undefined)).toEqual([]);
        expect(deserializeMessageArgs(version, null)).toEqual([]);
        expect(deserializeMessageArgs(version, 5)).toEqual([]);
      });
    });
    it('does not deserialize args if version is after 1.0.3', () => {
      versionsAfter.forEach((version) => {
        expect(deserializeMessageArgs(version, '[]')).toEqual('[]');
        expect(deserializeMessageArgs(version, '{}')).toEqual('{}');
        expect(deserializeMessageArgs(version, '{\"a\":5}')).toEqual(
            '{\"a\":5}');
        expect(deserializeMessageArgs(version, '{\"a\":\"5\"}')).toEqual(
            '{\"a\":\"5\"}');
        expect(deserializeMessageArgs(version, '')).toEqual([]);
        expect(deserializeMessageArgs(version, undefined)).toEqual([]);
        expect(deserializeMessageArgs(version, null)).toEqual([]);
        expect(deserializeMessageArgs(version, 5)).toEqual(5);
        expect(deserializeMessageArgs(version, {})).toEqual({});
        expect(deserializeMessageArgs(version, [])).toEqual([]);
        expect(deserializeMessageArgs(version, {a: 5})).toEqual({a: 5});
        expect(deserializeMessageArgs(version, {a: '5'})).toEqual({a: '5'});
      });
    });
  });
});
