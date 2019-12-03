# Changelog for Open Measurement SDK JavaScript clients

## 1.2.22 - 2019-12-01
### Changed
- Stop clearing session events on finish for native AdSessionTypes to allow late loading verification scrips to receive past events.

## 1.2.21 - 2019-11-11
### Fixed
- Use injectionId on sessionStart when available
- Capture injectedResources from native layer
- Inject and store injectionId

## 1.2.20 - 2019-09-30
### Fixed
- Send video/slotElement to verification scripts in creative access mode.

## 1.2.19 - 2019-09-10
### Fixed
- Measure window.top viewport in GeometricViewabilityListener
- Update IntersectionObserverViewabilityListener to capture measurement when using same element in subsequent session

## 1.2.18 - 2019-08-29
### Fixed
- Update to accurately report 'hidden' or 'notFound' for non visible ad views and include geometry.
- Add resource-level isolation in service script
- Add JS event registration
- Cache all video events from JS layer before Ad session is initialized from the native layer

## 1.2.17 - 2019-07-22
### Fixed
- Implement ResizeObserver to listen for size changes if the ad is 0-area.
- Remove 'goog.require' from omid-js-session-interface.js from externs file.
- Add resource-level isolation in service script.

## 1.2.16 - 2019-06-24
### Fixed
- Remove ES6 arrow from JavaScript library wrapper, ensuring that verification
  and session client libraries run on iOS 8 and Android API 16-23.

## 1.2.15 - 2019-05-24
### Fixed
- Rename Environment.MOBILE to Environment.APP.
- Add Environment.WEB and fix environment at compile time
- Split out SessionService communication into OmidJsBridge
- Refactor fullstack tests
- Split build process in two for app and web

## 1.2.14 - 2019-04-11
### Fixed
- Refactor how full-stack tests are configured
- Cache all video events then re-publish once session starts

## 1.2.13 - 2019-03-22
- Update version to match JS Service, Android, and iOS SDKs; no changes from 1.2.12.

## 1.2.12 - 2019-02-13
### Fixed
- Additional non-zero area check for IntersectionObserver
- Remove non-deterministic behavior for IntersectionObserver

## 1.2.11 - 2019-01-23
### Fixed
- Start IntersectionObserver after creative has non-zero area

## 1.2.10 - 2019-01-11
### Fixed
- VerificationClient crashes on creation inside cross-domain iframe on iOS 9

## 1.2.9 - 2018-12-10
### Fixed
- Fix crash related to resolveTopWindowContext on IE11.

## 1.2.8 - 2018-12-05
- Update version to match JS Service, Android, and iOS SDKs; no changes from 1.2.7.

## 1.2.7 - 2018-11-27
### Fixed
- Allow elementBounds to be passed for non-IFrame cases
- OmidSessionClient to include 'default' version key

## 1.2.6 - 2018-11-01
### Fixed
- Added logic to support older Chromium versions
- 'const' changed to 'var' in verification client for IE<11

## 1.2.5 - 2018-10-10
- Update version to match JS Service, Android, and iOS SDKs; no changes from 1.2.4.

## 1.2.4 - 2018-08-29
### Fixed
- Make sure cached loaded event has session ID when republishing

## 1.2.3 - 2018-07-17
### Fixed
- Fix JS Clients audit errors by upgrading Gulp and Karma
- Set the adView from the creative measurement, if it's available

## 1.2.2 - 2018-08-02
### Changed
- Update LICENSE

## 1.2.1 - 2018-07-18
- Update version to match JS Service, Android, and iOS SDKs; no changes from 1.2.0.

## 1.2.0 - 2018-07-03
### Fixed
- Use direct communication instead of post message when verification script is in a friendly iframe.
- Fix validation script to fire the default measurement URL in presence of verification parameters.

### Changed
- Change default vendor name from 'dummyVendor' to 'iabtechlab.com-omid' in validation verification script.
- Change default log server domain name from 'localhost' to 'iabtechlab.com' in validation verification script.

### Removed
- Remove restriction that impression event must be sent before other events can be sent.

## 1.1.4 - 2018-06-20
### Fixed
- Purge stale version files before regenerating files in npm prebuild.

### Added
- Add support for using window.omid3p in VerificationClient.

## 1.1.3 - 2018-05-29
### Changed
- Make OM SDK JS client code available in public GitHub repository.
- Add build files, README, and CHANGELOG to OM SDK JS client repository.

## 1.1.2 - 2018-05-08
### Fixed
- Dispatch device volume change video events for HTML video ad formats.
- Fix validation verification script to no longer register multiple observers for video events.

## 1.1.1 - 2018-04-24
### Added
- Include validation-verification script in OM SDK JS distribution ZIP.
- Add new properties to session context for compatibility with OMID for Web.

## 1.1.0 - 2018-03-29

First General Availability release of OM SDK JavaScript.
