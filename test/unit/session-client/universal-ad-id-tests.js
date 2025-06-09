goog.module('omid.test.sessionClient.UniversalAdId');

const UniversalAdId = goog.require('omid.sessionClient.UniversalAdId');
const argsChecker = goog.require('omid.common.argsChecker');

const ID_VALUE = 'CNPA0484000H';
const ID_REGISTRY = 'universal.id.org';

describe('UniversalAdIdTests', () => {
    describe('constructor', () => {
        it('should throw when value is empty', () => {
            expect(() =>
                new UniversalAdId('', ID_REGISTRY))
                .toThrow(new Error(
                    'Value for UniversalAdId.value is undefined, null or blank.'));
        });

        it('should throw when value is null', () => {
            expect(() =>
                new UniversalAdId(null, ID_REGISTRY))
                .toThrow(new Error(
                    'Value for UniversalAdId.value is undefined, null or blank.'));
        });

        it('should throw when idRegistry is empty', () => {
            expect(() =>
                new UniversalAdId(ID_VALUE, ''))
                .toThrow(new Error(
                    'Value for UniversalAdId.idRegistry is undefined, null or blank.'));
        });

        it('should throw when idRegistry is null', () => {
            expect(() =>
                new UniversalAdId(ID_VALUE, null))
                .toThrow(new Error(
                    'Value for UniversalAdId.idRegistry is undefined, null or blank.'));
        });

        it('should create not null instance with valid values', () => {
            const universalAdId = new UniversalAdId(ID_VALUE, ID_REGISTRY);
            expect(universalAdId).not.toBeNull();
        });
    });

    describe('toSerialisedValue', () => {
        it('should return joined values', () => {
            const EXPECTED = ID_VALUE + '; ' + ID_REGISTRY;
            const universalAdId = new UniversalAdId(ID_VALUE, ID_REGISTRY);
            expect(universalAdId.toSerialisedValue()).toBe(EXPECTED);
        });
    });
});
