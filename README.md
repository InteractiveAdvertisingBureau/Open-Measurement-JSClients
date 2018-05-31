# Open-Measurement-JSClients

## Overview

This repository contains the client JavaScript code of Open Measurement SDK,
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

### `/`
Contains the files covered under Apache License 2.0.

### `src/`
Contains the source code.

### `src/common/`
Contains source code files that are shared across multiple binaries.

### `src/externs/`
Contains externs declarations used by Google Closure compiler when building
OMID JS client binaries.

### `src/session-client/`
Contains all source code files that comprise the OMID JS Session Client and go
into the `omid-session-client-v1.js` binary.

### `src/validation-verification-script/`
Contains source code files that comprise the example verification script and go
into the `omid-validation-verification-script-v1.js` binary.

### `src/verification-client/`
Contains all source code files that comprise the OMID JS Verification Client and
go into the `omid-verification-client-v1.js` binary.

### `test/unit/`
Contains utility files as well as subdirectories of source code files used for
unit tests.

### `test/unit/common/`
Contains source code files used for unit tests of shared code (`src/common/`).

### `test/unit/session-client/`
Contains source code files used for unit tests related to the OMID JS Session
Client (`src/session-client/`).

### `test/unit/verification-client/`
Contains source code files used for unit tests related to the OMID JS
Verification Client (`src/verification-client/`).

### `test/validation-verification-script/`
Contains source code files used for unit tests related to
`src/validation-verification-script/`.

### `bin/`
This folder will be ignored for code submissions (through `.gitignore`).
The OMID JS Session Client binary (`omid-session-client-v1.js`) and the OMID JS
Verification Client binary (`omid-verification-client-v1.js`) are generated here
during a build.

### `package.json`
npm configuration and build file.

## Developer Setup

The JavaScript tools are managed using an [NPM](https://www.npmjs.com/) project.
[Google Closure](https://developers.google.com/closure/compiler/) compiler
composes modules together and minifies the output JavaScript binary.  Builds are
automated with [Gulp](https://gulpjs.com/).  Tests are written with
[Jasmine](https://jasmine.github.io/) and executed with
[Karma](https://karma-runner.github.io/).

### Prerequisites

* [Node version 8.4.0 or later](https://nodejs.org/en/)
* [NPM version 5.3.0](https://www.npmjs.com/). Specifically use v5.3.0 because newer versions have issues.
* [Java Runtime environment](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html)

### Clone the Repository

```sh
git clone git@github.com:InteractiveAdvertisingBureau/Open-Measurement-JSClients.git
cd Open-Measurement-JSClients
```

### Install Tools

Running the following command will download and install the dependencies
locally, into `./node_modules/`:

```sh
npm install
```

Run `npm list` to see the tree of installed dependencies. Note: If you are
experiencing issues here, check your version of npm via `npm -v`, specifically,
ensure that you are using npm version 5.3.0. See "Prerequisites" above.
After this step, the repo is ready to be built.

## Building

Running the following command builds `omid-session-client-v1.js` and
`omid-verification-client-v1.js` locally in a new `./bin/` folder. Note
that running `build` will always first remove any and all existing content in
`./bin/` prior to producing the output bundles.

```sh
npm run build
```

## Consuming
The build products `omid-session-client-v1.js` and `omid-verification-client-v1.js`
are [UMD modules](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/).
Therefore, they can be consumed in CommonJS, Google Closure, and generic
environments. The following examples show how the VerificationClient can
be imported. The same logic can be applied to the SessionClient.

### CommonJS
Make sure the require statement reflects the path to the
`omid-verification-client-v1.js` file. The following example works when the
`omid-verification-client-v1.js` file sits in the same directory as the example
source file.

```js
const Omid = require('./omid-verification-client-v1');
const {OmidVerificationClient} = Omid;
```

### Google Closure
Add the OMID source files to the Google Closure compiler. For the verification client
these are:

  - `public/src/common/**.js`
  - `public/src/verification-client/**.js`

For the session client these are:

  - `public/src/common/**.js`
  - `public/src/session-client/**.js`

And the code for the verification client (similar pattern for the session
client):

```js
const OmidVerificationClient = goog.require('omid.verificationClient.VerificationClient');
```

### Globals (generic approach)
Prior to running the example code, the `omid-verification-client-v1.js` must
have already been loaded and run in the current context. This is what causes the
global to be exported. One way of doing this is by using a `<script\>` tag.

```html
<html>
  <head>
    <script src="./omid-verification-client-v1.js"></script>
    <script src="./your-verification-script.js"></script>
  </head>
  <body></body>
</html>
```

Another way to do this is by concatenating `omid-verification-client-v1.js`
into the top of `your-verification-script.js`.

To access the VerificationClient API in `your-verification-script.js`, use the
following:

```js
const OmidVerificationClient =
    OmidVerificationClient && OmidVerificationClient['4.0.0'];
```

## Testing

### Unit Tests

To run all unit tests:

```sh
npm run test
```

or the shorthand alias:

```sh
npm t
```

It will bring up a Chrome instance orchestrated by the Karma runner, which will
run the tests once, print the results, and exit.

#### Continuously Run Unit Tests

In order to have Karma runner loop forever, waiting for any changes in the
production code or test code, use the following command.

```sh
npm run watch-unit-tests
```

## Tracking Changes

During each release (in other words, a version number increase), a single commit
is made to this repository with all of the changes.  For a more readable summary
of changes, consult the
[CHANGELOG.md](https://github.com/InteractiveAdvertisingBureau/Open-Measurement-JSClients/blob/master/CHANGELOG.md).
