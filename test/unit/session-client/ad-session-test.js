goog.module('omid.test.sessionClient.AdSession');

const AdSession = goog.require('omid.sessionClient.AdSession');
const argsChecker = goog.require('omid.common.argsChecker');
const Communication = goog.require('omid.common.Communication');
const PostMessageCommunication = goog.require('omid.common.PostMessageCommunication');
const InternalMessage = goog.require('omid.common.InternalMessage');
const Context = goog.require('omid.sessionClient.Context');
const Partner = goog.require('omid.sessionClient.Partner');
const Rectangle = goog.require('omid.common.Rectangle');
const {serializeMessageArgs, deserializeMessageArgs} = goog.require('omid.common.ArgsSerDe');
const {Version} = goog.require('omid.common.version');
const {VERSION_COMPATABILITY_TABLE, makeVersionRespondingCommunicationClass} = goog.require('omid.test.versionUtils');
const {asSpy} = goog.require('omid.test.typingUtils');
const {ErrorType} = goog.require('omid.common.constants');

/** @type {string} */
const CLIENT_VERSION = Version;

/** @type {!AdSession} */
let session;

/** @type {!Context} */
let context;

/** @type {!Partner} */
let partner;

/** @type{!Communication<?>} */
let communication;

/**
 * Checks that a message with a specified method has been sent.
 * @param {string} method
 */
function expectMessage(method) {
  expect(communication.sendMessage).toHaveBeenCalled();
  // Type cast to ? instead of Jasmine Spy since the .all definition is missing
  // from the Jasmine typedef.
  const methods = /** @type {?} */ (communication.sendMessage).calls.all()
      // Map from CallData to InternalMessage.
      .map((callData) => callData.args[0])
      // Map from InternalMessage to method.
      .map((message) => message && message.method);
  expect(methods).toContain(method);
}

describe('AdSessionTest', () => {
  beforeEach(() => {
    spyOn(argsChecker, 'assertNotNullObject');

    // Spy on the send message method of the communication, to check when a
    // message is sent to the service. The message parsing itself is a function
    // of the SessionService, and therefore is unit tested in the SessionService
    // code, instead of here.
    communication = /** @type{!Communication<?>} */ (jasmine.createSpyObj(
        'communication', ['sendMessage', 'generateGuid', 'handleMessage',
          'isDirectCommunication']));

    partner = new Partner('partner', '1');
    context = new Context(partner, []);
    session = new AdSession(context, communication);

    // Send the version information to the AdSession.
    expect(communication.sendMessage).toHaveBeenCalled();
    asSpy(communication.isDirectCommunication).and.returnValue(true);
    const {guid} = asSpy(communication.sendMessage).calls.mostRecent().args[0];
    communication.onMessage(
        new InternalMessage(guid, 'response', CLIENT_VERSION,
            serializeMessageArgs(CLIENT_VERSION, ['1.0.0'])),
        communication);
  });

  describe('constructor', () => {
    it('should verify context by calling the argsChecker', () => {
      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'AdSession.context', context);
    });
    it('should not throw when communication is null', () => {
      expect(() => new AdSession(context, null)).not.toThrow();
    });
  });

  describe('isSupported', () => {
    it('true when communication is established', () => {
      expect(session.isSupported()).toBe(true);
    });

    it('false when communication hasn\'t been established', () => {
      session = new AdSession(context, null);
      expect(session.isSupported()).toBe(false);
    });
  });

  describe('registerSessionObserver', () => {
    it('relays registration to the service by sending a message', () => {
      const doNothing = () => {};
      session.registerSessionObserver(doNothing);
      expectMessage('SessionService.registerSessionObserver');
    });
  });

  describe('registerAdEvents', () => {
    it('checks if ad events have already been registered', () => {
      expect(() => session.registerAdEvents()).not.toThrow();
      expect(() => session.registerAdEvents()).toThrow();
    });

    it('relays registration to the service', () => {
      session.registerAdEvents();
      expectMessage('SessionService.registerAdEvents');
    });
  });

  describe('registerVideoEvents', () => {
    it('checks if video events have already been registered', () => {
      expect(() => session.registerVideoEvents()).not.toThrow();
      expect(() => session.registerVideoEvents()).toThrow();
    });

    it('relays registration to the service', () => {
      session.registerVideoEvents();
      expectMessage('SessionService.registerVideoEvents');
    });
  });

  describe('sendOneWayMessage', () => {
    it('sends a message with SessionService. appended to the method', () => {
      session.sendOneWayMessage('bob');
      expectMessage('SessionService.bob');
    });
  });

  describe('sendMessage', () => {
    it('sends a message which is received by the session service and whoes ' +
       'response is received', () => {
      // When the message is sent, fake a return message, which will invoke the
      // message handling callback.
      communication.sendMessage = (outboundMessage) => {
        communication.onMessage(
            new InternalMessage(
                outboundMessage.guid, 'response', CLIENT_VERSION,
                serializeMessageArgs(CLIENT_VERSION, [123])),
            communication);
      };

      // Perform a type unsafe cast of the Spy to the required function type.
      const responseCallback = jasmine.createSpy('responseCallback');
      session.sendMessage('bob', /** @type {?} */ (responseCallback));
      expect(responseCallback).toHaveBeenCalled();
      expect(responseCallback).toHaveBeenCalledWith(123);
    });
  });

  describe('assertSessionRunning', () => {
    it('throws if OM SDK service is unavailable', () => {
      session = new AdSession(context, null);
      expect(() => session.assertSessionRunning()).toThrow();
    });

    it('throws if OM SDK service is the wrong version', () => {
      const VersionRespondingCommunication =
          makeVersionRespondingCommunicationClass('123.0.0');
      // Create a session client using the special VersionRespondingCommunication
      // class,
      session = new AdSession(context, /** @type {!Communication<?>} */ (
          new VersionRespondingCommunication()));
      expect(() => session.assertSessionRunning()).toThrow();
    });

    it('throws if a session start has not happened yet', () => {
      session = new AdSession(context, communication);
      expect(() => session.assertSessionRunning()).toThrow();
    });
  });

  describe('assertImpressionOccured', () => {
    it('throws if the impression event has not been fired by the client yet', () => {
      expect(() => session.assertImpressionOccured()).toThrow();
    });

    it('does not throw if the impression event has been fired by the client', () => {
      session.impressionOccurred();
      expect(() => session.assertImpressionOccured()).not.toThrow();
    });
  });

  describe('error', () => {
    it('should call the session service', () => {
      session.error(ErrorType.GENERIC, 'error');
      expectMessage('SessionService.sessionError');
    });
  });
  describe('setElementBounds', () => {
    it('should call the argsChecker to check the elementBounds', () => {
      const rectangle = new Rectangle(0, 0, 320, 50);
      session.setElementBounds(rectangle);
      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'AdSession.elementBounds', rectangle);
    });
    it('should send the rectangle to the service', () => {
      const rectangle = new Rectangle(0, 0, 320, 50);
      session.setElementBounds(rectangle);
      expect(communication.sendMessage).toHaveBeenCalledWith(
          jasmine.objectContaining(
              {
                'method': 'SessionService.setElementBounds',
                'args': [rectangle],
              }
          ));
    });
  });
  describe('send{Slot,Video}Element_', () => {
    [
      {method: 'sendSlotElement_', comm_method: 'setSlotElement'},
      {method: 'sendVideoElement_', comm_method: 'setVideoElement'},
    ].forEach((testCase) => {
      const methodToCall = testCase.method;
      const communicationMethod = testCase.comm_method;
      it('should do nothing if element is null', () => {
        AdSession.prototype[methodToCall].call(session, null);
        expect(communication.sendMessage).not.toHaveBeenCalledWith(
            jasmine.objectContaining({
              'method': `SessionService.${communicationMethod}`,
            }));
      });
      it('should do nothing if element is undefined', () => {
        AdSession.prototype[methodToCall].call(session, undefined);
        expect(communication.sendMessage).not.toHaveBeenCalledWith(
            jasmine.objectContaining({
              'method': `SessionService.${communicationMethod}`,
            }));
      });
      it('should send element to service', () => {
        const element = /** @type {!HTMLElement} */ ({});
        AdSession.prototype[methodToCall].call(session, element);
        expect(communication.sendMessage).toHaveBeenCalledWith(
            jasmine.objectContaining({
              'method': `SessionService.${communicationMethod}`,
              'args': [element],
            }));
      });
      it('should fire sessionError if communication is post message', () => {
        const element = /** @type {!HTMLElement} */ ({});
        asSpy(communication.isDirectCommunication).and.returnValue(false);
        AdSession.prototype[methodToCall].call(session, element);
        expect(communication.sendMessage).not.toHaveBeenCalledWith(
            jasmine.objectContaining({
              'method': `SessionService.${communicationMethod}`,
            }));
        expect(communication.sendMessage).toHaveBeenCalledWith(
            jasmine.objectContaining({
              'method': 'SessionService.sessionError',
              'args': [
                  ErrorType.GENERIC,
                `Session Client ${communicationMethod} called when ` +
                'communication is not direct',
              ],
            }));
      });
    });
  });
});
