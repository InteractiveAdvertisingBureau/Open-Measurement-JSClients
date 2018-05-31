goog.module('omid.test.validation.ValidationVerificationClient');

const VerificationClient = goog.require('omid.verificationClient.VerificationClient');
const ValidationVerificationClient = goog.require('omid.validationVerificationScript.ValidationVerificationClient');
const {AdEventType} = goog.require('omid.common.constants');
const {asSpy} = goog.require('omid.test.typingUtils');

describe('ValidationVerificationClient', () => {
    let verificationClient;
    let dummyVendor = 'dummyVendor';
    let validationVerificationClient;
    let fakeDate = new Date(2017, 8, 13);
    let sessionDate = new Date(2017, 7, 12);
    let geometryChangeDate = new Date(2017, 6, 14);
    let startSession;
    let fireGeometryChange;

    beforeEach(() => {
        verificationClient = jasmine.createSpyObj('VerificationClient', ['isSupported', 'registerSessionObserver', 'addEventListener', 'sendUrl']);
        asSpy(verificationClient.registerSessionObserver).and.callFake(function(callback, vendor) {
            startSession = callback;
        });
        asSpy(verificationClient.addEventListener).and.callFake(function(eventName, callback) {
            if (eventName == AdEventType.GEOMETRY_CHANGE) {
                fireGeometryChange = callback;
            }
        });
        jasmine.clock().mockDate(fakeDate);
    });

    it('isSupported is false, logs contain isSupported false message, do not register to events', () => {
        // Arrange
        asSpy(verificationClient.isSupported).and.returnValue(false);
        // Act
        validationVerificationClient = new ValidationVerificationClient(verificationClient, dummyVendor);
        // Arrange
        const expectedLog = fakeDate.toLocaleString() + '::"OmidSupported[false]"';
        expect(validationVerificationClient.getLogs()[0]).toBe(expectedLog);
        expect(verificationClient.registerSessionObserver).not.toHaveBeenCalled();
        expect(verificationClient.addEventListener).not.toHaveBeenCalled();
    });

    it('isSupported is true, logs contain isSupported true message, register to events', () => {
        // Arrange
        asSpy(verificationClient.isSupported).and.returnValue(true);
        // Act
        validationVerificationClient = new ValidationVerificationClient(verificationClient, dummyVendor);
        // Arrange
        const expectedLog = fakeDate.toLocaleString() + '::"OmidSupported[true]"';
        expect(validationVerificationClient.getLogs()[0]).toBe(expectedLog);
        expect(verificationClient.registerSessionObserver).toHaveBeenCalled();
        expect(verificationClient.addEventListener).toHaveBeenCalled();
    });

    it('fire sessionStart with serverLog, fire events to ServerLog', () => {
        // Arrange
        asSpy(verificationClient.isSupported).and.returnValue(true);
        const sessionData = {
            'adSessionId': 32423,
            'timestamp': sessionDate,
            'type': 'sessionStart',
            'data': {
                'context': {
                    'environment': 'app',
                    'adSessionType': 'html',
                    'omidNativeInfo': {'partnerName': 'SomePartner', 'partnerVersion': '1.2.3'},
                    'app': {'libraryVersion': '4.0.0', 'appId': 'app-123456789'},
                    'omidJsInfo': {'serviceVersion': '4.0.0'},
                }, 'verificationParameters': 'http://192.168.50.130/visit.jpg?message=',
            },
        };
        // Act
        validationVerificationClient = new ValidationVerificationClient(verificationClient, dummyVendor);
        startSession(sessionData);
        // Arrange
        const expectedIsSupportedUrl = `${sessionData.data.verificationParameters}${encodeURIComponent(`${fakeDate.toLocaleString()}::"OmidSupported[true]"`)}`;
        const expectedSessionStart = `${sessionData.data.verificationParameters}${encodeURIComponent(`${sessionDate.toLocaleString()}::${JSON.stringify(sessionData)}`)}`;
        expect(verificationClient.sendUrl).toHaveBeenCalledWith(expectedIsSupportedUrl);
        expect(verificationClient.sendUrl).toHaveBeenCalledWith(expectedSessionStart);
    });

    it('fire sessionStart without serverLog, fire events to defaultServer', () => {
        // Arrange
        asSpy(verificationClient.isSupported).and.returnValue(true);
        const sessionData = {
            'adSessionId': 32423,
            'timestamp': sessionDate,
            'type': 'sessionStart',
            'data': {
                'context': {
                    'environment': 'app',
                    'adSessionType': 'html',
                    'omidNativeInfo': {'partnerName': 'SomePartner', 'partnerVersion': '1.2.3'},
                    'app': {'libraryVersion': '4.0.0', 'appId': 'app-123456789'},
                    'omidJsInfo': {'serviceVersion': '4.0.0'},
                },
            },
        };
        // Act
        validationVerificationClient = new ValidationVerificationClient(verificationClient, dummyVendor);
        startSession(sessionData);
        // Arrange
        const expectedIsSupportedUrl = `http://localhost:66/sendMessage?msg=${encodeURIComponent(`${fakeDate.toLocaleString()}::"OmidSupported[true]"`)}`;
        const expectedSessionStart = `http://localhost:66/sendMessage?msg=${encodeURIComponent(`${sessionDate.toLocaleString()}::${JSON.stringify(sessionData)}`)}`;
        expect(verificationClient.sendUrl).toHaveBeenCalledWith(expectedIsSupportedUrl);
        expect(verificationClient.sendUrl).toHaveBeenCalledWith(expectedSessionStart);
    });

    it('fire geometryChange events, fire geometryChange events to server', () => {
        // Arrange
        asSpy(verificationClient.isSupported).and.returnValue(true);
        const sessionData = {
            'adSessionId': 32423,
            'timestamp': sessionDate,
            'type': 'sessionStart',
            'data': {
                'context': {
                    'environment': 'app',
                    'adSessionType': 'html',
                    'omidNativeInfo': {'partnerName': 'SomePartner', 'partnerVersion': '1.2.3'},
                    'app': {'libraryVersion': '4.0.0', 'appId': 'app-123456789'},
                    'omidJsInfo': {'serviceVersion': '4.0.0'},
                }, 'verificationParameters': 'http://192.168.50.130/visit.jpg?message=',
            },
        };

        const geometryChangeData = {
            'adSessionId': 32423,
            'timestamp': geometryChangeDate,
            'type': 'geometryChange',
            'data': {
                'viewport': {'width': 1920, 'height': 960},
                'adView': {
                    'percentageInView': 100,
                    'reasons': [],
                    'geometry': {'width': 550, 'height': 333, 'x': 16, 'y': 316},
                    'onScreenGeometry': {'width': 550, 'height': 333, 'x': 16, 'y': 316, 'obstructions': []},
                },
            },
        };
        // Act
        validationVerificationClient = new ValidationVerificationClient(verificationClient, dummyVendor);
        startSession(sessionData);
        fireGeometryChange(geometryChangeData);
        // Arrange
        const expectedGeometryChangeUrl = `${sessionData.data.verificationParameters}${encodeURIComponent(`${geometryChangeDate.toLocaleString()}::${JSON.stringify(geometryChangeData)}`)}`;
        expect(verificationClient.sendUrl).toHaveBeenCalledWith(expectedGeometryChangeUrl);
    });

    it('filter duplicate registration to video event', () => {
        // Arrange
        asSpy(verificationClient.isSupported).and.returnValue(true);
        let numOfRegistrationCalls = 0;
        // Act
        validationVerificationClient = new ValidationVerificationClient(verificationClient, dummyVendor);
        // Assert
        Object.keys(AdEventType).forEach( function(el) {
            if (AdEventType[el] === 'video') {
                expect(verificationClient.addEventListener).not.toHaveBeenCalledWith('video', jasmine.anything());
            } else {
                expect(verificationClient.addEventListener).toHaveBeenCalledWith(AdEventType[el], jasmine.anything());
                numOfRegistrationCalls++;
            }
        });
        expect(numOfRegistrationCalls).toEqual(Object.keys(AdEventType).length - 1);
    });
});
