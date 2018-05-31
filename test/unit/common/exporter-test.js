goog.module('omid.tests.common.exporter');

const {packageExport} = goog.require('omid.common.exporter');

describe('exporter', () => {
  describe('packageExport', () => {
    it('can export', () => {
      const omidExports = /** @type {?} */ ({});
      const a = /** @type {?} */ ({});
      packageExport('a', a, omidExports);
      expect(omidExports.a).toBe(a);
    });

    it('does nothing when export object is non existent', () => {
      const a = /** @type {?} */ ({});
      expect(() => packageExport('a', a, null /* globalExports */))
          .not.toThrow();
    });

    it('can export to non existant deep name', () => {
      const omidExports = /** @type {?} */ ({});
      const a = /** @type {?} */ ({});
      packageExport('c.b.a', a, omidExports);
      expect(omidExports.c.b.a).toBe(a);
    });

    it('can export to deep name', () => {
      const A = /** @type {?} */ ({});
      const omidExports = /** @type {?} */ ({c: {b: {A}}});
      const B = /** @type {?} */ ({});
      packageExport('c.b.B', B, omidExports);

      // Make sure that A is not overriden in addation to making sure the name
      // was exported.
      // NOTE: There is a weird bug in closure that complains about B not being
      // defined on b, despite omidExports being defined as untyped (see above).
      expect(omidExports.c.b.A).toBe(A);
      expect(omidExports.c.b['B']).toBe(B);
      expect(omidExports.c.b.A).not.toBe(B);
      expect(omidExports.c.b['B']).not.toBe(A);
    });
  });
});
