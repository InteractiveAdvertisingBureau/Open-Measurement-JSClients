goog.module('omid.test.verificationClient.VerificationClient');

const Communication = goog.require('omid.common.Communication');
const VerificationClient = goog.require('omid.verificationClient.VerificationClient');
const MockXmlHttpRequest = goog.require('omid.test.MockXmlHttpRequest');
const {AdEventType} = goog.require('omid.common.constants');
const {VERSION_COMPATABILITY_TABLE, makeVersionRespondingCommunicationClass} = goog.require('omid.test.versionUtils');
const {asSpy} = goog.require('omid.test.typingUtils');

const doNothing = () => {};

/** @type {?VerificationClient} */
let client;

/** @type {?Communication} */
let communication;

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

function expectCommunication(methodName) {
  expect(communication.sendMessage).toHaveBeenCalled();
  const callArgs = asSpy(communication.sendMessage).calls.mostRecent().args;
  const [message] = callArgs;
  expect(message).toBeTruthy();
  expect(message.method).toEqual(methodName);
}

describe('VerificationClient', () => {
  beforeEach(() => {
    // Spy on the send message method of the communication, to check when
    // a message is sent to the service. The message parsing itself is a
    // function of the VerificationService, and therefore is unit tested in
    // the VerificationService code, instead of here.
    omidGlobal.setTimeout = (callback, timeInMillis) => {};
    omidGlobal.clearTimeout = (timeoutId) => {};
    omidGlobal.setInterval = (callback, timeInMillis) => {};
    omidGlobal.clearInterval = (intervalId) => {};
    communication = jasmine.createSpyObj(
        'communication', ['sendMessage', 'generateGuid']);
    client = new VerificationClient(communication);
    // Spy on the intrinsic methods that will be used when available.
    spyOn(omidGlobal, 'setTimeout').and.callThrough();
    spyOn(omidGlobal, 'clearTimeout').and.callThrough();
    spyOn(omidGlobal, 'setInterval').and.callThrough();
    spyOn(omidGlobal, 'clearInterval').and.callThrough();
  });

  describe('constructor', () => {
    it('should not throw if communication is null', () => {
      expect(() => new VerificationClient(null)).not.toThrow();
    });
  });

  describe('setTimeout', () => {
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
    it('proxies to the service when the native layer does not exist', () => {
      client = new NoIntrinsicTimingClient(communication);
      client.setTimeout(doNothing, 123 /* timeInMillis */);

      expectCommunication('VerificationService.setTimeout');
    });
  });

  describe('clearTimeout', () => {
    it('proxies to the native layer when it exists', () => {
      const id = 321;
      client.clearTimeout(id);

      expect(omidGlobal.clearTimeout).toHaveBeenCalledWith(id);
    });
    it('validates the id parameter', () => {
      expectValidatesPositiveNumber((id) => client.clearTimeout(id));
    });
    it('proxies to the service when the native layer does not exist', () => {
      client = new NoIntrinsicTimingClient(communication);
      const id = 321;
      client.clearTimeout(id);

      expectCommunication('VerificationService.clearTimeout');
    });
  });

  describe('setInterval', () => {
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
    it('proxies to the service when the native layer does not exist', () => {
      client = new NoIntrinsicTimingClient(communication);
      client.setInterval(doNothing, 123 /* timeInMillis */);

      expectCommunication('VerificationService.setInterval');
    });
  });

  describe('clearInterval', () => {
    it('proxies to the native layer when it exists', () => {
      const id = 321;
      client.clearInterval(id);

      expect(omidGlobal.clearInterval).toHaveBeenCalledWith(id);
    });
    it('validates the id parameter', () => {
      expectValidatesPositiveNumber((id) => client.clearInterval(id));
    });
    it('proxies to the service when the native layer does not exist', () => {
      client = new NoIntrinsicTimingClient(communication);
      const id = 321;
      client.clearInterval(id);

      expectCommunication('VerificationService.clearInterval');
    });
  });

  describe('addSessionListener', () => {
    it('proxies to the service', () => {
      const vendorKey = 'abc123';
      client.registerSessionObserver(doNothing, vendorKey);
      expectCommunication('VerificationService.addSessionListener');
    });
    it('works when vendor key is not provided', () => {
      client.registerSessionObserver(doNothing);
      expectCommunication('VerificationService.addSessionListener');
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
    it('proxies to the service', () => {
      client.sendUrl(
          'http://test.com/',
          doNothing /* successCallback */,
          doNothing /* failureCallback */);
      expectCommunication('VerificationService.sendUrl');
    });
    it('validates the url parameter', () => {
      expectValidatesString((url) => client.sendUrl(url));
    });
  });

  describe('injectJavaScriptResource', () => {
    const hasWindow = typeof window !== 'undefined';
    if (hasWindow) {
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
    } else {
      it('proxies to the service if omidGlobal is not a window', () => {
        client.injectJavaScriptResource(
            'http://test.com/',
            doNothing /* successCallback */,
            doNothing /* failureCallback */);
        expectCommunication('VerificationService.injectJavaScriptResource');
      });
    }
    it('validates the url parameter', () => {
        expectValidatesString((url) => client.injectJavaScriptResource(
            url,
            doNothing /* successCallback */,
            doNothing /* failureCallback */));
    });
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
});
