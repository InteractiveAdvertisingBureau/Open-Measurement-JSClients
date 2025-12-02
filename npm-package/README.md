# Open-Measurement-JS

## Overview

This NPM repository contains the client JavaScript code of Open Measurement SDK,
also known as OM SDK JS.  It has two primary components:

* OMID JS Verification Client (`omid-verification-client-v1.js`) is used by
verification scripts to communicate with OMID JS Service.  It handles situations
when the verification script runs in the same HTML document as the creative (in
the top level of the webview), or in a cross-domain iframe, or in an invisible
webview or DOM-less JavaScript execution environment for native ads.
Verification scripts include the OMID JS Verification Client source code at
build time (when the verification script is transpiled/minified).

* OMID JS Session Client (`omid-session-client-v1.js`) is used by
integration partners to perform ad session activities in the JavaScript layer.
It functions both at the top level of the webview and in a cross-domain iframe.
Ad SDKs include its source code into ad HTML at build time.

## Folder Structure


### `Session-Client/`

Contains the OMID JS Session Client binary.

omid-session-client-v1.js: Stable version of the JS Session Client.

omid-session-client-v1beta.min.js: Minified version of the JS Session Client. Has the same APIs and functionality as the stable version but is much smaller due to more aggressive minification. Currently still in beta testing.

omid-session-client-v1beta.modern.js: "Modern" version of the JS Session Client. Has the same APIs and functionality as the stable/minified versions but excludes polyfills that are included in those. You must provide your own polyfills based on your target environments. Currently still in beta testing.


### `Verification-Client/`

Contains the OMID JS Verification Client binary.

omid-verification-client-v1.js: Stable version of the JS Verification Client.

omid-verification-client-v1beta.min.js: Minified version of the JS Verification Client. Has the same APIs and functionality as the stable version but is much smaller due to more aggressive minification. Currently still in beta testing.

omid-verification-client-v1beta.modern.js: "Modern" version of the JS Verification Client. Has the same APIs and functionality as the stable/minified versions but excludes polyfills that are included in those. You must provide your own polyfills based on your target environments. Currently still in beta testing.


### `Validation-Script/`

Contains the OMID JS Validation Script binary.

omid-validation-verification-script-v1.js: The validation script creates a VerificationClient instance and registers for OMID events. It logs every event received from the OMID.


### `Compliance-Script/`

Contains the OMID JS Compliance Script binary.

omid-compliance-verification-script-v1.js: This script is used to check whether an integration is compliant with IAB OMID standards. The compliance script creates a ComplianceVerificationClient instance to register the appropriate add event listeners for specific events like impression, quartile, geometry changes, etc.
