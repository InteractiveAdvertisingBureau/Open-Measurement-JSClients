// Karma configuration
// Generated on Tue Jul 11 2017 18:09:23 GMT-0700 (PDT)
module.exports = (config) => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bin/Omid-Unit-Tests.js',
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values:
    // config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN ||
    //    config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Continuous Integration mode - run headless instance of Chrome
    // start these browsers
    // available browser launchers:
    // https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['custom_chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Custom Chrome launcher (disable GPU, it causes issues with Travis)
    customLaunchers: {
      custom_chrome: {
        base: 'ChromeHeadless',
        flags: [
            '--disable-gpu',
        ],
      },
    },
  });
};
