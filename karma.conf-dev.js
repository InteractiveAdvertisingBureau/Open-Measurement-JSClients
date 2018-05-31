// Karma configuration
const baseConfig = require('./karma.conf');
module.exports = (config) => {
  baseConfig(config);
  config.set({
    // Development mode - leave source code available after each test run
    client: {
      clearContext: false,
    },

    // enable / disable watching file and executing tests whenever any file
    // changes
    autoWatch: true,

    // Development mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Development mode - run Chrome instance
    // start these browsers
    // available browser launchers:
    // https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    reporters: ['kjhtml'],
  })
};
