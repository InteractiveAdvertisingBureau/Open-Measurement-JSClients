goog.module('omid.test.common.DetectOmidTest');

const {Environment} = goog.require('omid.common.constants');
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
      DetectOmid.declareOmidPresence(mockWindow, Environment.APP);
      expect(mockWindow).toEqual({});
    });

    describe('when already we have a special frame', () => {
        it('should do nothing', () => {
            const frameTagUsed = [];
            const mockWindow = /** @type {!Window} */ ({
                frames: {
                    [DetectOmid.OMID_PRESENT_FRAME_NAME_WEB]: {},
                },
                document: {
                    write: (tag) => {
                        frameTagUsed.push(tag);
                    },
                },
            });

            DetectOmid.declareOmidPresence(mockWindow, Environment.WEB);

            expect(frameTagUsed).toHaveSize(0);
        });
    });

    it('should add special frame with mutation observer if exists', () => {
      spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
          (window) => true);
      spyOn(DetectOmid, 'registerMutationObserver_').and.callFake(
          (_window, _env) => {}, // do nothing
      );

      const mockWindow = /** @type {!Window} */ ({
        document: {},
        frames: {},
      });
      DetectOmid.declareOmidPresence(mockWindow, Environment.APP);

      expect(DetectOmid.registerMutationObserver_)
          .toHaveBeenCalledWith(mockWindow, Environment.APP);
    });

    describe('and environment = web', () => {
      beforeEach(() => {
        spyOn(DetectOmid, 'getEnvironmentIframeName')
            .and.returnValue(DetectOmid.OMID_PRESENT_FRAME_NAME_WEB);
      });

      it('should add 2 special frames without mutation observer if no body' +
          ' exists',
          () => {
            spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
                (window) => false);
            spyOn(DetectOmid, 'registerMutationObserver_').and.callFake(
                (_window, _env) => {}, // do nothing
            );

            const frameTagUsed = /** @type {string[]} */ [];
            const mockDocument = {
              write: (tag) => {
                frameTagUsed.push(tag);
              },
            };
            const mockWindow = /** @type {!Window} */ ({
              document: mockDocument,
              frames: {},
            });
            DetectOmid.declareOmidPresence(mockWindow, Environment.WEB);

            expect(DetectOmid.registerMutationObserver_).not.toHaveBeenCalled();
            expect(frameTagUsed).toHaveSize(2);

            const [omidPresenceTag, omidWebPresenceTag] = frameTagUsed;

            expect(omidPresenceTag)
                .toMatch(`id="${DetectOmid.OMID_PRESENT_FRAME_NAME}"`);
            expect(omidPresenceTag)
                .toMatch(`name="${DetectOmid.OMID_PRESENT_FRAME_NAME}"`);
            expect(omidPresenceTag).toMatch('sandbox');
            expect(omidWebPresenceTag)
                .toMatch(`id="${DetectOmid.OMID_PRESENT_FRAME_NAME_WEB}"`);
            expect(omidWebPresenceTag)
                .toMatch(`name="${DetectOmid.OMID_PRESENT_FRAME_NAME_WEB}"`);
            expect(omidWebPresenceTag).toMatch('sandbox');
          });

      it('should add 2 special frames without mutation observer if body exists',
          () => {
            spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
                (window) => true);
            spyOn(DetectOmid, 'registerMutationObserver_').and.callFake((window) => {
              // do nothing
            });

            let frameTagsUsed = [];
            const mockDocument = {
              body: {
                appendChild(/** @type {!Node} */ child) {
                  frameTagsUsed.push(child);
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
            DetectOmid.declareOmidPresence(mockWindow, Environment.WEB);

            expect(DetectOmid.registerMutationObserver_).not.toHaveBeenCalled();
            expect(frameTagsUsed).toHaveSize(2);

            const [omidIframeTag, omidWebIframeTag] = frameTagsUsed;

            expect(omidIframeTag.tag).toEqual('iframe');
            expect(omidIframeTag.id)
                .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME);
            expect(omidIframeTag.name)
                .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME);
            expect(omidIframeTag.style.display).toEqual('none');
            expect(omidIframeTag.sandbox).toEqual('');

            expect(omidWebIframeTag.tag).toEqual('iframe');
            expect(omidWebIframeTag.id)
                .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME_WEB);
            expect(omidWebIframeTag.name)
                .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME_WEB);
            expect(omidWebIframeTag.style.display).toEqual('none');
            expect(omidWebIframeTag.sandbox).toEqual('');
          });
    });

    describe('and environment = app', () => {
      beforeEach(() => {
          spyOn(DetectOmid, 'getEnvironmentIframeName')
              .and.returnValue(DetectOmid.OMID_PRESENT_FRAME_NAME_APP);
      });

        it('should add 2 special frames without mutation observer if no body' +
            ' exists',
            () => {
                spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
                    (window) => false);
                spyOn(DetectOmid, 'registerMutationObserver_')
                    .and.callFake((window) => {
                    // do nothing
                });

                const frameTagUsed = /** @type {string[]} */ [];
                const mockDocument = {
                    write: (tag) => {
                        frameTagUsed.push(tag);
                    },
                };
                const mockWindow = /** @type {!Window} */ ({
                    document: mockDocument,
                    frames: {},
                });
                DetectOmid.declareOmidPresence(mockWindow, Environment.APP);

                expect(frameTagUsed).toHaveSize(2);

                const [omidPresenceTag, omidAppWebPresenceTag] = frameTagUsed;

                expect(omidPresenceTag).toMatch(
                    `id="${DetectOmid.OMID_PRESENT_FRAME_NAME}"`);
                expect(omidPresenceTag).toMatch(
                    `name="${DetectOmid.OMID_PRESENT_FRAME_NAME}"`);
                expect(omidPresenceTag).toMatch('sandbox');
                expect(omidAppWebPresenceTag).toMatch(
                    `id="${DetectOmid.OMID_PRESENT_FRAME_NAME_APP}"`);
                expect(omidAppWebPresenceTag).toMatch(
                    `name="${DetectOmid.OMID_PRESENT_FRAME_NAME_APP}"`);
                expect(omidAppWebPresenceTag).toMatch('sandbox');
            });

        it('should add 2 special frames without mutation observer ' +
            'if body exists',
            () => {
                spyOn(DetectOmid, 'isMutationObserverAvailable_').and.callFake(
                    (window) => true);
                spyOn(DetectOmid, 'registerMutationObserver_')
                    .and.callFake((window) => {
                    // do nothing
                });

                let frameTagsUsed = [];
                const mockDocument = {
                    body: {
                        appendChild(/** @type {!Node} */ child) {
                            frameTagsUsed.push(child);
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
                DetectOmid.declareOmidPresence(mockWindow, Environment.APP);

                expect(DetectOmid.registerMutationObserver_)
                    .not.toHaveBeenCalled();
                expect(frameTagsUsed).toHaveSize(2);

                const [omidFrameTag, omidAppFrameTag] = frameTagsUsed;

                expect(omidFrameTag.tag).toEqual('iframe');
                expect(omidFrameTag.id)
                    .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME);
                expect(omidFrameTag.name)
                    .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME);
                expect(omidFrameTag.style.display).toEqual('none');
                expect(omidFrameTag.sandbox).toEqual('');

                expect(omidAppFrameTag.tag).toEqual('iframe');
                expect(omidAppFrameTag.id)
                    .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME_APP);
                expect(omidAppFrameTag.name)
                    .toEqual(DetectOmid.OMID_PRESENT_FRAME_NAME_APP);
                expect(omidAppFrameTag.style.display).toEqual('none');
                expect(omidAppFrameTag.sandbox).toEqual('');
            });
    });
  });

  describe('getOmidEnvironment', () => {
    it('detects the App environment', () => {
      const mockWindow = /** @type {!Window} */ ({
        'frames': {[DetectOmid.OMID_PRESENT_FRAME_NAME_APP]: {}},
      });
      expect(DetectOmid.getOmidEnvironment(mockWindow))
          .toEqual(Environment.APP);
    });

    it('detects the Web environment', () => {
      const mockWindow = /** @type {!Window} */ ({
        'frames': {[DetectOmid.OMID_PRESENT_FRAME_NAME_WEB]: {}},
      });
      expect(DetectOmid.getOmidEnvironment(mockWindow))
          .toEqual(Environment.WEB);
    });

    it('returns null if the environment cannot be detected', () => {
      const mockWindow = /** @type {!Window} */ ({
        'frames': {[DetectOmid.OMID_PRESENT_FRAME_NAME]: {}},
      });
      expect(DetectOmid.getOmidEnvironment(mockWindow)).toBeNull();
    });
  });
});
