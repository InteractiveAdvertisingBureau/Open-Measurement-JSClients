#!/bin/bash

# Fail on any error.
set -e
# Display commands being run.
set -x

fancyPrint () {
  if [ $# == 1 ]
  then
    RED="\033[1;31m"
    NC="\033[0m"
    echo -e "\n${RED}+++++++++++++++++++++++++++++++"
    echo -e "${RED}----- $1"
    echo -e "${RED}+++++++++++++++++++++++++++++++${NC}\n"
  fi
}

{ fancyPrint "Starting build script for public OMSDK components"; } 2>/dev/null

{ fancyPrint "node and npm versions"; } 2>/dev/null
# Print node and npm versions
node -v
npm -v

# Install dependencies
{ fancyPrint "Installing npm dependencies"; } 2>/dev/null
npm install

# List actual package versions installed
{ fancyPrint "Listing installed npm packages"; } 2>/dev/null
npm list

# Run linter checks
{ fancyPrint "Running linter checks"; } 2>/dev/null
npm run lint

# Run tests
{ fancyPrint "Running unit tests for public OMSDK components"; } 2>/dev/null
npm run test

{ fancyPrint "Ensuring that documentation can be generated"; } 2>/dev/null
npm run jsdoc

# Run the build to produce final deliverables
{ fancyPrint "Building and packaging final deliverables for public OMSDK components"; } 2>/dev/null
npm run build

{ fancyPrint "Finished build script for public OMSDK components"; } 2>/dev/null
