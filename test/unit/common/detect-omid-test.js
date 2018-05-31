goog.module('omid.test.common.DetectOmidTest');

const DetectOmid = goog.require('omid.common.DetectOmid');

describe('DetectOmidTest', () => {
  describe('isOmidPresent', () => {
    it('should be false for no local OMID and no frames', () => {
      const mockWindow = /** @type {!Window} */ ({});
      expect(DetectOmid.isOmidPresent(mockWindow)).toBe(false);
    });

    it('should be false for no local OMID and no matching frame', () => {
      const mockWindow = /** @type {!Window} */ ({
        'frames': {'some-frame': {}},
      });
      expect(DetectOmid.isOmidPresent(mockWindow)).toBe(false);
    });

    it('should be false for local OMID', () => {
      const mockWindow = /** @type {!Window} */ ({
        'omid': {},
      });
      expect(DetectOmid.isOmidPresent(mockWindow)).toBe(false);
    });

    it('should be false when frame is null', () => {
      const mockWindow = /** @type {!Window} */ ({
        'frames': {
          [DetectOmid.OMID_PRESENT_FRAME_NAME]: null,
        },
      });
      expect(DetectOmid.isOmidPresent(mockWindow)).toBe(false);
    });

    it('should be false when frame is undefined', () => {
      const mockWindow = /** @type {!Window} */ ({
        'frames': {
          [DetectOmid.OMID_PRESENT_FRAME_NAME]: undefined,
        },
      });
      expect(DetectOmid.isOmidPresent(mockWindow)).toBe(false);
    });

    it('should be true for matching frame', () => {
      const mockWindow = /** @type {!Window} */ ({'frames': {
        'some-frame': {},
        [DetectOmid.OMID_PRESENT_FRAME_NAME]: {},
      }});
      expect(DetectOmid.isOmidPresent(mockWindow)).toBe(true);
    });
  });

  describe('declareOmidPresence', () => {
    it('should do nothing when running in DOM-less context', () => {
      const mockWindow = /** @type {!Window} */ ({});
      DetectOmid.declareOmidPresence(mockWindow);
      expect(mockWindow).toEqual({});
    });

    it('should add special frame with mutation observer if exists', () => {
      spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
          (window) => true);
      spyOn(DetectOmid, 'registerMutationObserver_').and.callFake((window) => {
        // do nothing
      });

      const mockWindow = /** @type {!Window} */ ({
        document: {},
        frames: {},
      });
      DetectOmid.declareOmidPresence(mockWindow);

      expect(DetectOmid.registerMutationObserver_).toHaveBeenCalledWith(
          mockWindow);
    });

    it('should add special frame without mutation observer if not exists',
        () => {
      spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
          (window) => false);
      spyOn(DetectOmid, 'registerMutationObserver_').and.callFake((window) => {
        // do nothing
      });

      let frameTagUsed = '';
      const mockDocument = {
        write: (tag) => {
          frameTagUsed = tag;
        },
      };
      const mockWindow = /** @type {!Window} */ ({
        document: mockDocument,
        frames: {},
      });
      DetectOmid.declareOmidPresence(mockWindow);

      expect(DetectOmid.registerMutationObserver_).not.toHaveBeenCalled();
      expect(frameTagUsed).toMatch(
          `id="${DetectOmid.OMID_PRESENT_FRAME_NAME}"`);
      expect(frameTagUsed).toMatch(
          `name="${DetectOmid.OMID_PRESENT_FRAME_NAME}"`);
    });

    it('should add special frame without mutation observer if body exists',
        () => {
          spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
              (window) => true);
          spyOn(DetectOmid, 'registerMutationObserver_').and.callFake((window) => {
            // do nothing
          });

          let frameTagUsed = {};
          const mockDocument = {
            body: {
             appendChild(/** @type {!Node} */ child) {
               frameTagUsed = child;
             },
            },
            createElement: (/** @type {string} */ tagName) => {
              return {
                tag: tagName,
                id: '',
                name: '',
                style: {
                  display: '',
                },
              };
            },
          };
          const mockWindow = /** @type {!Window} */ ({
            document: mockDocument,
            frames: {},
          });
          DetectOmid.declareOmidPresence(mockWindow);

          expect(DetectOmid.registerMutationObserver_).not.toHaveBeenCalled();
          expect(frameTagUsed.tag).toEqual('iframe');
          expect(frameTagUsed.id).toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME);
          expect(frameTagUsed.name).toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME);
          expect(frameTagUsed.style.display).toEqual('none');
        });
  });
});
