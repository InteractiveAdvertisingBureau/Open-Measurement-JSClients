goog.module('omid.common.ArgsCheckerTest');

const argsChecker = goog.require('omid.common.argsChecker');

describe('TestArgsChecker', () => {
  describe('#assertTruthyString', () => {
    describe('when provided with empty string', () => {
      it('should throw an error', () => {
        const emptyString = '';

        expect(() =>
            argsChecker.assertTruthyString('emptyString', emptyString))
            .toThrow(
                new Error('Value for emptyString is undefined, null or blank.'));
      });
    });
    describe('when provided with a null string', () => {
      it('should throw an error', () => {
        const nullString = null;

        expect(() => argsChecker.assertTruthyString('nullString', nullString))
            .toThrow(
                new Error('Value for nullString is undefined, null or blank.'));
      });
    });
    describe('when provided with an undefined string', () => {
      it('should throw an error', () => {
        const undefinedString = null;

        expect(() =>
            argsChecker.assertTruthyString('undefinedString', undefinedString))
            .toThrow(new Error(
                'Value for undefinedString is undefined, null or blank.'));
      });
    });
    describe('when provided with an empty string', () => {
      it('should throw an error', () => {
        const emptyString = '   ';

        expect(() =>
            argsChecker.assertTruthyString('emptyString', emptyString))
            .toThrow(new Error(
                'Value for emptyString is empty string.'));
      });
    });
    describe('when provided with a valid string', () => {
      it('should not throw an error', () => {
        const validString = 'Oh so valid!';

        expect(() => argsChecker.assertTruthyString('validString', validString))
            .not.toThrow(new Error());
      });
    });
  });
  describe('#assertNotNullObject', () => {
    describe('when provided with a null object', () => {
      it('should throw an error', () => {
        const nullObject = null;

        expect(() => argsChecker.assertNotNullObject('nullObject', nullObject))
            .toThrow(new Error('Value for nullObject is undefined or null'));
      });
    });
    describe('when provided with an undefined object', () => {
      it('should throw an error', () => {
        const undefinedObject = null;

        expect(() =>
            argsChecker.assertNotNullObject('undefinedObject', undefinedObject))
            .toThrow(
                new Error('Value for undefinedObject is undefined or null'));
      });
    });
    describe('when provided with a valid object', () => {
      it('should not throw an error', () => {
        const validObject = {};

        expect(() => argsChecker.assertNotNullObject('validObject', validObject))
            .not.toThrow(new Error());
      });
    });
  });
  describe('#assertNumber', () => {
    const functionUnderTest = (name, value) => {
      argsChecker.assertNumber(name, value);
    };
    commonAssertNumberTests(functionUnderTest);
  });
  describe('#assertNumberBetween', () => {
    describe('should check type of value', () => {
      const functionUnderTest = (name, value) => {
        argsChecker.assertNumberBetween(name, value, 0, 1);
      };
      commonAssertNumberTests(functionUnderTest);
    });
    describe('when provided with a number below the range', () => {
      it('should throw an error', () => {
       const lowerValue = -0.1;

        expect(() => argsChecker.assertNumberBetween('lower', lowerValue, 0, 1))
            .toThrow(new Error('Value for lower is outside the range [0,1]'));
      });
    });
    describe('when provided with a number above the range', () => {
      it('should throw an error', () => {
        const higherValue = 1.1;

        expect(() => argsChecker.assertNumberBetween('higher', higherValue, 0, 1))
            .toThrow(new Error('Value for higher is outside the range [0,1]'));
      });
    });
    describe('when provided with a number within the range', () => {
      it('should not throw an error', () => {
        const valid = 0.5;

        expect(() => argsChecker.assertNumberBetween('valid', valid, 0, 1)).not
            .toThrow(new Error());
      });
    });
  });

  function commonAssertNumberTests(functionUnderTest) {
    describe('when provided with a value that is not of type number', () => {
      it('should throw an error', () => {
        const stringValue = 'Iam not a number';
        expect(() => functionUnderTest('stringValue', stringValue))
            .toThrow(new Error('Value for stringValue is not a number'));
      });
    });
    describe('when provided with NaN', () => {
      it('should throw an error', () => {
        expect(() => functionUnderTest('NaN', NaN))
            .toThrow(new Error('Value for NaN is not a number'));
      });
    });
    describe('when provided with a valid number', () => {
      it('should not throw an error', () => {
        expect(() => functionUnderTest('valid', 5)).not.toThrow(new Error());
      });
    });
  }
});
