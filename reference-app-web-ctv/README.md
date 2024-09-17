# Open Measurement Reference App for Web CTV

## Overview
A sample CTV web application to showcase an OM SDK for Web CTV integration.

# Usage

## Prerequisites
* Node v18.16.0
* NPM v9.5.1

[nvm] is recommended for installing and managing Node and NPM.
* `nvm use lts/hydrogen`

## Getting Started
1. Install dependencies with `npm install`
1. Run `npm run build`.
1. Copy the dependencies into `bin/`:
    - Change to `cd public/reference-app-web-ctv`
    - Run `./copy_binaries.sh`=
1. Open project in WebOS Studio or Tizen Studio (follow instructions provided by
LG and Samsung, respectively).
1. Build and run on CTV device (note: Tizen and WebOS simulators offer limited
measurement functionality and are not suitable for running OM SDK).

# Clarifications
This demo app does not implement parsing of VAST or any other ad response
formats. Asset URLs, verification script URLs and parameters are specified as
constants instead. Please refer to [IAB Tech Lab] for details regarding how
verification resources are represented in various ad formats.

# Additional Information
* [Open Measurement SDK on IAB Tech Lab]


[nvm]: https://github.com/nvm-sh/nvm
[IAB Tech Lab]: https://iabtechlab.com/standards/open-measurement-sdk/
[Open Measurement SDK on IAB Tech Lab]: https://iabtechlab.com/standards/open-measurement-sdk/
