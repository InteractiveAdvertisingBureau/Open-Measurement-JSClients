# Open Measurement Reference App for Web

## Overview
A sample web application built to showcase a canonical OM SDK for Web integration.

# Usage

## Prerequisites
* Node v10.16
* NPM v6.9.0

[nvm] is recommended for installing and managing Node and NPM.

## Getting Started
1. Copy the OM for Web SDK into `./static/omweb-v1.js`
1. Copy the OM Domain Loader into `./static/.well-known/omid/omloader-v1.html`
1. Install dependencies with `npm install`
1. Run the dev server by running `npm run start`
1. Open http://localhost:8080 in a browser

## Advanced
If you'd like to specify your own default settings, override the values in `./templates/.settings.default.json`.

# Screenshots

Home and test case pages on iPhone X:

<p float="left">
<img src="screenshots/iphone-root.png" width="226px"></img>
<img src="screenshots/iphone-video.png" width="226px"></img>
</p>

# Clarifications
This demo app does not implement parsing of VAST or any other ad response
formats. Asset URLs, verification script URLs and parameters are specified as
constants instead. Please refer to [IAB Tech Lab] for details regarding how
verification resources are represented in various ad formats.

# TODO
* Automate copying of the SDK and Domain Loader
* Use the public versions of private client APIs once they're released
* Use the validation verification script

# Additional Information
* [Open Measurement SDK on IAB Tech Lab]


[nvm]: https://github.com/nvm-sh/nvm
[IAB Tech Lab]: https://iabtechlab.com/standards/open-measurement-sdk/
[Open Measurement SDK on IAB Tech Lab]: https://iabtechlab.com/standards/open-measurement-sdk/
