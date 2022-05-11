goog.module('omid.test.common.FloatComparer');

const {roughlyLessThan, lessThanOrRoughlyEqual, greaterThanOrRoughlyEqual} = goog.require('omid.common.FloatComparer');

describe('FloatComparer', () => {
    describe('roughlyLessThan', () => {
        it('returns true when a number is significantly less than a second number', () => {
            expect(roughlyLessThan(1.00, 1.01)).toBeTruthy();
        });
        it('returns false when a number is not significantly less than a second number', () => {
            expect(roughlyLessThan(1.001, 1.010)).toBeFalsy();
        });
    });
    describe('lessThanOrRoughlyEqual', () => {
        it('returns true when a number is significantly less than a second number', () => {
            expect(lessThanOrRoughlyEqual(1.00, 1.01)).toBeTruthy();
        });
        it('returns true when a number is not significantly less than a second number', () => {
            expect(lessThanOrRoughlyEqual(1.001, 1.010)).toBeTruthy();
        });
        it('returns true when a number is not significantly greater than a second number', () => {
            expect(lessThanOrRoughlyEqual(1.010, 1.001)).toBeTruthy();
        });
        it('returns false when a number is significantly greater than a second number', () => {
            expect(lessThanOrRoughlyEqual(1.01, 1.00)).toBeFalsy();
        });
    });
    describe('greaterThanOrRoughlyEqual', () => {
        it('returns true when a number is significantly less than a second number', () => {
            expect(greaterThanOrRoughlyEqual(1.00, 1.01)).toBeFalsy();
        });
        it('returns true when a number is not significantly less than a second number', () => {
            expect(greaterThanOrRoughlyEqual(1.001, 1.010)).toBeTruthy();
        });
        it('returns true when a number is not significantly greater than a second number', () => {
            expect(greaterThanOrRoughlyEqual(1.010, 1.001)).toBeTruthy();
        });
        it('returns false when a number is significantly greater than a second number', () => {
            expect(greaterThanOrRoughlyEqual(1.01, 1.00)).toBeTruthy();
        });
    });
});
