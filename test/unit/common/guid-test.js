goog.module('omid.test.common.guid');

const {generateGuid} = goog.require('omid.common.guid');

describe('generateGuid', () => {
  it('generated guid has the correct format', () => {
    const uuidV4Regex =
        /[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[a-f\d]{4}-[a-f\d]{12}/i;
    expect(generateGuid().match(uuidV4Regex)).toBeTruthy();
  });
  it('generated guids do not collide', () => {
    expect(generateGuid()).not.toEqual(generateGuid());
  });
});
