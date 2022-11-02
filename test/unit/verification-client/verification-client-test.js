goog.module('omid.test.verificationClient.VerificationClient');

const Communication = goog.require('omid.common.Communication');
const VerificationClient = goog.require('omid.verificationClient.VerificationClient');
const MockXmlHttpRequest = goog.require('omid.test.MockXmlHttpRequest');
const {AdEventType, Environment} = goog.require('omid.common.constants');
const {VERSION_COMPATABILITY_TABLE, makeVersionRespondingCommunicationClass} = goog.require('omid.test.versionUtils');
const {asSpy} = goog.require('omid.test.typingUtils');
const {omidGlobal} = goog.require('omid.common.OmidGlobalProvider');

const doNothing = () => {};

/** @type {?VerificationClient} */
let client;

/** @type {?Communication} */
let communication;

/** @type {?Object} */
let omid3p;

const VENDOR_KEY = 'vendor.com-omid';
const INJECTION_ID = 'abc123';

class NoIntrinsicTimingClient extends VerificationClient {
  /** @override */
  hasTimeoutMethods_() {
    return false;
  }

  /** @override */
  hasIntervalMethods_() {
    return false;
  }
}

function hasWindow() {
  return typeof window !== 'undefined';
}

function expectValidatesPositiveNumber(f) {
  expect(() => f()).toThrow();
  expect(() => f(null)).toThrow();
  expect(() => f(-1)).toThrow();
  expect(() => f('not a number')).toThrow();
  expect(() => f(0)).not.toThrow();
  expect(() => f(1)).not.toThrow();
}

function expectValidatesCallback(f) {
  expect(() => f()).toThrow();
  expect(() => f(null)).toThrow();
  expect(() => f(() => {})).not.toThrow();
}

function expectValidatesString(f) {
  expect(() => f(null)).toThrow();
  expect(() => f(5)).toThrow();
  expect(() => f({})).toThrow();
  expect(() => f('string')).not.toThrow();
}

function expectCommunication(methodName, args = undefined) {
  expect(communication.sendMessage).toHaveBeenCalled();
  const callArgs = asSpy(communication.sendMessage).calls.mostRecent().args;
  const [message] = callArgs;
  expect(message).toBeTruthy();
  expect(message.method).toEqual(methodName);
  if (args) {
    expect(message.args).toEqual(args);
  }
}

function expectCalledWithArgs(f, args) {
  expect(f).toHaveBeenCalled();
  const callArgs = asSpy(f).calls.mostRecent().args;
  expect(callArgs.length).toEqual(args.length);
  callArgs.forEach((callArg, i) => {
    expect(callArg).toEqual(args[i]);
  });
}

function runSetTimeoutTest() {
  it('proxies to the native layer when it exists', () => {
    const time = 123;
    client.setTimeout(doNothing, time);

    expect(omidGlobal.setTimeout).toHaveBeenCalledWith(doNothing, time);
  });
  it('will validate the functionToExecute parameter', () => {
    expectValidatesCallback((callback) => client.setTimeout(callback, 123));
  });
  it('validates the time parameter', () => {
    expectValidatesPositiveNumber(
        (time) => client.setTimeout(doNothing, time));
  });
}

function runClearTimeoutTest() {
  it('proxies to the native layer when it exists', () => {
    const id = 321;
    client.clearTimeout(id);

    expect(omidGlobal.clearTimeout).toHaveBeenCalledWith(id);
  });
  it('validates the id parameter', () => {
    expectValidatesPositiveNumber((id) => client.clearTimeout(id));
  });
}

function runSetIntervalTest() {
  it('proxies to the native layer when it exists', () => {
    const time = 123;

    client.setInterval(doNothing, time);

    expect(omidGlobal.setInterval).toHaveBeenCalledWith(doNothing, time);
  });
  it('will validate the functionToExecute parameter', () => {
    expectValidatesCallback((callback) => client.setInterval(callback, 123));
  });
  it('validates the time parameter', () => {
    expectValidatesPositiveNumber(
        (time) => client.setInterval(doNothing, time));
  });
}

function runClearIntervalTest() {
  it('proxies to the native layer when it exists', () => {
    const id = 321;
    client.clearInterval(id);

    expect(omidGlobal.clearInterval).toHaveBeenCalledWith(id);
  });
  it('validates the id parameter', () => {
    expectValidatesPositiveNumber((id) => client.clearInterval(id));
  });
}

function runSendUrlTest() {
  let originalCreateElement;
  beforeAll(() => {
    if (hasWindow()) {
      originalCreateElement = omidGlobal.document.createElement;
    }
  });

  afterEach(() => {
    if (hasWindow()) {
      omidGlobal.document.createElement = originalCreateElement;
    }
  });
  if (hasWindow()) {
    it('uses img element method if available', () => {
      const fakeImg = jasmine.createSpyObj('img', ['addEventListener']);
      const successCallback = jasmine.createSpy('successCallback');
      const failureCallback = jasmine.createSpy('failureCallback');
      const doc = omidGlobal.document;
      spyOn(doc, 'createElement').and.returnValue(fakeImg);
      const pingUrl = 'https://testping.com';
      client.sendUrl(
          pingUrl, successCallback, failureCallback);
      expect(doc.createElement).toHaveBeenCalled();

      const addListenerCalls = asSpy(fakeImg.addEventListener).calls;
      expect(addListenerCalls.count()).toEqual(2);
      expect(addListenerCalls.first().args[0]).toEqual('load');
      expect(addListenerCalls.mostRecent().args[0]).toEqual('error');
      // The created <img> should be stored until load/error.
      expect(client.imgCache_.length).toEqual(1);
      expect(client.imgCache_[0]).toEqual(fakeImg);

      // Fake the load event.
      const loadCallback = addListenerCalls.first().args[1];
      loadCallback();
      // Confirm <img> is removed from cache.
      expect(client.imgCache_.length).toEqual(0);
      // Confirm that only successCallback is called.
      expect(successCallback).toHaveBeenCalled();
      expect(failureCallback).not.toHaveBeenCalled();

      expect(fakeImg.src).toEqual(pingUrl);
    });
  }
  it('validates the url parameter', () => {
    expectValidatesString((url) => client.sendUrl(url));
  });
}

function runInjectJavaScriptResourceTest() {
  it('validates the url parameter', () => {
      expectValidatesString((url) => client.injectJavaScriptResource(
          url,
          doNothing /* successCallback */,
          doNothing /* failureCallback */));
  });
  if (hasWindow()) {
    it('injects it in DOM if omidGlobal is a window', () => {
      const url = 'http://safescript4realz.com/4realz.js';
      spyOn(omidGlobal.document, 'createElement').and.callThrough();
      spyOn(omidGlobal.document.body, 'appendChild').and.callThrough();

      client.injectJavaScriptResource(
          url,
          doNothing /* successCallback */,
          doNothing /* failureCallback */);

      expect(omidGlobal.document.createElement).toHaveBeenCalled();
      expect(asSpy(omidGlobal.document.createElement).calls.mostRecent()
          .args[0]).toEqual('script');
      const mostRecentAppendChildCall = asSpy(
          omidGlobal.document.body.appendChild).calls.mostRecent();
      expect(mostRecentAppendChildCall.args[0]).not.toBeUndefined();
      expect(mostRecentAppendChildCall.args[0].src).toEqual(url);
      expect(mostRecentAppendChildCall.args[0].type).toEqual(
          'application/javascript');
    });
  }
}

describe('VerificationClient', () => {
  beforeEach(() => {
    omidGlobal.setTimeout = (callback, timeInMillis) => {};
    omidGlobal.clearTimeout = (timeoutId) => {};
    omidGlobal.setInterval = (callback, timeInMillis) => {};
    omidGlobal.clearInterval = (intervalId) => {};
    omidGlobal.omidVerificationProperties = {
      injectionId: INJECTION_ID,
    };
    // Spy on the intrinsic methods that will be used when available.
    spyOn(omidGlobal, 'setTimeout').and.callThrough();
    spyOn(omidGlobal, 'clearTimeout').and.callThrough();
    spyOn(omidGlobal, 'setInterval').and.callThrough();
    spyOn(omidGlobal, 'clearInterval').and.callThrough();
  });

  describe('using communication', () => {
    beforeEach(() => {
      // Spy on the send message method of the communication, to check when
      // a message is sent to the service. The message parsing itself is a
      // function of the VerificationService, and therefore is unit tested in
      // the VerificationService code, instead of here.
      communication = jasmine.createSpyObj(
          'communication', ['sendMessage', 'generateGuid']);
      client = new VerificationClient(communication);
    });

    describe('constructor', () => {
      it('should not throw if communication is null', () => {
        expect(() => new VerificationClient(null)).not.toThrow();
      });
    });

    describe('setTimeout', () => {
      runSetTimeoutTest();
      it('proxies to the service when the native layer does not exist', () => {
        client = new NoIntrinsicTimingClient(communication);
        client.setTimeout(doNothing, 123 /* timeInMillis */);

        expectCommunication('VerificationService.setTimeout');
      });
    });

    describe('clearTimeout', () => {
      runClearTimeoutTest();
      it('proxies to the service when the native layer does not exist', () => {
        client = new NoIntrinsicTimingClient(communication);
        const id = 321;
        client.clearTimeout(id);

        expectCommunication('VerificationService.clearTimeout');
      });
    });

    describe('setInterval', () => {
      runSetIntervalTest();
      it('proxies to the service when the native layer does not exist', () => {
        client = new NoIntrinsicTimingClient(communication);
        client.setInterval(doNothing, 123 /* timeInMillis */);

        expectCommunication('VerificationService.setInterval');
      });
    });

    describe('clearInterval', () => {
      runClearIntervalTest();
      it('proxies to the service when the native layer does not exist', () => {
        client = new NoIntrinsicTimingClient(communication);
        const id = 321;
        client.clearInterval(id);

        expectCommunication('VerificationService.clearInterval');
      });
    });

    describe('addSessionListener', () => {
      it('proxies to the service', () => {
        client.registerSessionObserver(doNothing, VENDOR_KEY);
        expectCommunication(
            'VerificationService.addSessionListener',
            [VENDOR_KEY, INJECTION_ID]);
      });
      it('works when injectionId is unavailable', () => {
        omidGlobal.omidVerificationProperties = undefined;
        client = new VerificationClient(communication);
        client.registerSessionObserver(doNothing, VENDOR_KEY);
        expectCommunication(
            'VerificationService.addSessionListener', [VENDOR_KEY, undefined]);
      });
      it('works when vendor key is not provided', () => {
        client.registerSessionObserver(doNothing);
        expectCommunication(
          'VerificationService.addSessionListener',
          [undefined, INJECTION_ID]);
      });
    });

    describe('addEventListener', () => {
      it('proxies to the service', () => {
        const eventType = AdEventType.SESSION_START;
        client.addEventListener(eventType, doNothing);
        expectCommunication('VerificationService.addEventListener');
      });
      it('validates the eventType parameter', () => {
        expectValidatesString(
            (eventType) => client.addEventListener(eventType, doNothing));
      });
    });

    describe('sendUrl', () => {
      runSendUrlTest();
      it('proxies to the service', () => {
        if (hasWindow()) {
          omidGlobal.document.createElement = undefined;
        }
        client.sendUrl(
            'http://test.com/',
            doNothing /* successCallback */,
            doNothing /* failureCallback */);
        expectCommunication('VerificationService.sendUrl');
      });
    });

    describe('injectJavaScriptResource', () => {
      runInjectJavaScriptResourceTest();
      if (!hasWindow()) {
        it('proxies to the service if omidGlobal is not a window', () => {
          client.injectJavaScriptResource(
              'http://test.com/',
              doNothing /* successCallback */,
              doNothing /* failureCallback */);
          expectCommunication('VerificationService.injectJavaScriptResource');
        });
      }
    });

    describe('isSupported', () => {
      it('communication exists', () => {
        expect(client.isSupported()).toEqual(true);
      });
      it('communication does not exist', () => {
        delete client.communication;
        expect(client.isSupported()).toEqual(false);
      });
    });

    describe('injectionSource', () => {
      it('should return "web" when web service injected client', () => {
        omidGlobal.omidVerificationProperties.injectionSource = Environment.WEB;
        expect(client.injectionSource()).toEqual('web');
      });
      it('should return "app" when app service injected client', () => {
        omidGlobal.omidVerificationProperties.injectionSource = Environment.APP;
        expect(client.injectionSource()).toEqual('app');
      });
      it('should return undefined when unknown service injected client', () => {
        delete omidGlobal.omidVerificationProperties.injectionSource;
        expect(client.injectionSource()).toBeUndefined();
      });
    });
  });

  describe('using omid3p', () => {
    beforeEach(() => {
      // Create a VerificationClient with no communication where omid3p is
      // available in the global context.
      omid3p = jasmine.createSpyObj(
          'omid3p', ['registerSessionObserver', 'addEventListener']);
      omidGlobal.omid3p = omid3p;
      client = new VerificationClient();
    });

    afterEach(() => {
      delete omidGlobal.omid3p;
    });

    describe('constructor', () => {
      it('should use omid3p and not initialize communication', () => {
        expect(client.communication).toBeNull();
        expect(client.omid3p).not.toBeNull();
      });
      it('should not throw if communication and omid3p are null', () => {
        delete omidGlobal.omid3p;
        expect(() => new VerificationClient(null)).not.toThrow();
      });
    });

    describe('setTimeout', runSetTimeoutTest);
    describe('clearTimeout', runClearTimeoutTest);
    describe('setInterval', runSetIntervalTest);
    describe('clearInterval', runClearIntervalTest);
    describe('sendUrl', runSendUrlTest);
    describe('injectJavaScriptResource', runInjectJavaScriptResourceTest);

    describe('addEventListener', () => {
      it('validates the eventType parameter', () => {
        expectValidatesString(
            (eventType) => client.addEventListener(eventType, doNothing));
      });
      it('should pass arguments to omid3p implementation', () => {
        const eventType = AdEventType.START;
        client.addEventListener(eventType, doNothing);
        expectCalledWithArgs(omid3p.addEventListener, [eventType, doNothing]);
      });
    });

    describe('registerSessionObserver', () => {
      it('should pass arguments to the omid3p implementation', () => {
        client.registerSessionObserver(doNothing, VENDOR_KEY);
        expectCalledWithArgs(
          omid3p.registerSessionObserver,
          [doNothing, VENDOR_KEY, INJECTION_ID]);
      });
      it('should pass arguments when injectionId is unavailable', () => {
        omidGlobal.omidVerificationProperties = undefined;
        client = new VerificationClient();
        client.registerSessionObserver(doNothing, VENDOR_KEY);
        expectCalledWithArgs(
            omid3p.registerSessionObserver, [doNothing, VENDOR_KEY, undefined]);
      });
      it('should pass arguments when no vendorKey is used', () => {
        client.registerSessionObserver(doNothing);
        expectCalledWithArgs(
            omid3p.registerSessionObserver,
            [doNothing, undefined, INJECTION_ID]);
      });
    });

    describe('isSupported', () => {
      it('omid3p is available', () => {
        expect(client.isSupported()).toEqual(true);
      });
      it('omid3p is not available', () => {
        client.omid3p = undefined;
        expect(client.isSupported()).toEqual(false);
      });
    });

    describe('injectionSource', () => {
      it('should return "web" when web service injected client', () => {
        omidGlobal.omidVerificationProperties.injectionSource = Environment.WEB;
        expect(client.injectionSource()).toEqual('web');
      });
      it('should return "app" when app service injected client', () => {
        omidGlobal.omidVerificationProperties.injectionSource = Environment.APP;
        expect(client.injectionSource()).toEqual('app');
      });
      it('should return undefined when unknown service injected client', () => {
        delete omidGlobal.omidVerificationProperties.injectionSource;
        expect(client.injectionSource()).toBeUndefined();
      });
    });
  });
});
