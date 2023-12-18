/**
 * @fileoverview @externs Definition of VerificationClient.
 * We need to preserve any function name used by our own omid client
 * because all function names are minified 
 * when using the build option compilation_level: 'ADVANCED'
 */

/** @const */
const VerificationClient = {};
VerificationClient.isSupported = function() {};
VerificationClient.registerSessionObserver = function(functionToExecute, vendorKey) {};
VerificationClient.addEventListener = function(eventType, functionToExecute) {};