const compilerPackage = require('google-closure-compiler');
const gulp = require('gulp');
const inject = require('gulp-inject');
const {gulpOperationIf} = require('./gulp_utils');

const closureCompiler = compilerPackage.gulp();

const commonConfig = {
  compilation_level: 'SIMPLE',
  formatting: 'PRETTY_PRINT',
  warning_level: 'VERBOSE',
  language_in: 'ECMASCRIPT_2017',
  language_out: 'ECMASCRIPT5_STRICT',
  externs: [
    './src/externs/closure.js',
    './src/externs/omid-global.js',
  ],
  output_wrapper_file: './lightweight-bootstrapper.js',
};

const UMD_BOOTSTRAPPER = './umd-bootstrapper.js';
const UMD_BOOTSTRAPPER_WITH_DEFAULT = './umd-bootstrapper-with-default.js';

// Package files into directory with version number.
const VERSION_NUMBER = process.env.VERSION_NUMBER;
const PACKAGE_NAME = `omsdk-js-${VERSION_NUMBER}`;
const PACKAGE_DIR = `bin/${PACKAGE_NAME}`;

const SESSION_CLIENT_SRC = [
  './src/session-client/**.js',
  './src/common/**.js',
];

gulp.task('build-session-client', () => {
  const taskConfig = {
    js: SESSION_CLIENT_SRC,
    js_output_file: 'omid-session-client-v1.js',
    output_wrapper_file: UMD_BOOTSTRAPPER_WITH_DEFAULT,
    externs: [
      ...commonConfig.externs,
      './src/externs/omid-exports.js',
      './src/externs/omid-jasmine.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'))
});

const SESSION_CLIENT_ZIP_SRC = [
  './bin/omid-session-client-v1.js',
  './LICENSE',
];

gulp.task(
    'package-session-client',
    gulpOperationIf(
        VERSION_NUMBER,
        gulp.series(
            () => gulp.src(SESSION_CLIENT_ZIP_SRC)
                      .pipe(gulp.dest(`${PACKAGE_DIR}/Session-Client`)),
            () => gulp.src(SESSION_CLIENT_SRC)
                      .pipe(gulp.dest(`${PACKAGE_DIR}/Session-Client/Source`)),
            )));

const VERIFICATION_CLIENT_SRC = [
  './src/common/**.js',
  './src/verification-client/**.js',
];

gulp.task('build-verification-client', () => {
  const taskConfig = {
    js: VERIFICATION_CLIENT_SRC,
    js_output_file: 'omid-verification-client.js',
    output_wrapper_file: './webpack-bootstrapper.js',
    env: 'BROWSER',
    compilation_level: 'ADVANCED',
    assume_function_wrapper: true,
    dependency_mode: 'PRUNE',
    entry_point: 'goog:omid.verificationClient.VerificationClient',
    externs: [
      ...commonConfig.externs,
      './src/externs/omid-jasmine.js',
      './src/externs/omid-exports.js',
      './src/externs/omid-verification-client.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('../xpln.ai/scripts_crea/omid'))
});

const VERIFICATION_CLIENT_ZIP_SRC = [
  './bin/omid-verification-client-v1.js',
  './LICENSE',
];

gulp.task(
    'package-verification-client',
    gulpOperationIf(
        VERSION_NUMBER,
        gulp.series(
            () => gulp.src(VERIFICATION_CLIENT_ZIP_SRC)
                      .pipe(gulp.dest(`${PACKAGE_DIR}/Verification-Client`)),
            () => gulp.src(VERIFICATION_CLIENT_SRC)
                      .pipe(gulp.dest(
                          `${PACKAGE_DIR}/Verification-Client/Source`)),
            )));

const VALIDATION_VERIFICATION_SCRIPT_SRC = [
  './src/validation-verification-script/**.js',
];

gulp.task('build-validation-verification-script', () => {
  const taskConfig = {
    js: VERIFICATION_CLIENT_SRC.concat(VALIDATION_VERIFICATION_SCRIPT_SRC),
    js_output_file: 'omid-validation-verification-script-v1.js',
    output_wrapper_file: UMD_BOOTSTRAPPER,
    dependency_mode: 'PRUNE',
    entry_point: 'goog:validationVerificationClientMain',
    externs: [
        ...commonConfig.externs,
      './src/externs/omid-jasmine.js',
      './src/externs/omid-exports.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'));
});

const VALIDATION_VERIFICATION_SCRIPT_ZIP_SRC = [
  './bin/omid-validation-verification-script-v1.js',
  './LICENSE',
];

gulp.task(
    'package-validation-verification-script',
    gulpOperationIf(
        VERSION_NUMBER,
        gulp.series(
            () => gulp.src(VALIDATION_VERIFICATION_SCRIPT_ZIP_SRC)
                      .pipe(gulp.dest(`${PACKAGE_DIR}/Validation-Script`)),
            () =>
                gulp.src(VALIDATION_VERIFICATION_SCRIPT_SRC)
                    .pipe(gulp.dest(`${PACKAGE_DIR}/Validation-Script/Source`)),
            )));

const COMPLIANCE_VERIFICATION_SCRIPT_SRC = [
  './src/compliance-verification-script/**.js',
];

gulp.task('build-compliance-verification-script', () => {
  const taskConfig = {
    js: VERIFICATION_CLIENT_SRC.concat(COMPLIANCE_VERIFICATION_SCRIPT_SRC),
    js_output_file: 'omid-compliance-verification-script-v1.js',
    output_wrapper_file: UMD_BOOTSTRAPPER,
    dependency_mode: 'PRUNE',
    entry_point: 'goog:complianceVerificationClientMain',
    externs: [
        ...commonConfig.externs,
      './src/externs/omid-jasmine.js',
      './src/externs/omid-exports.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'));
});

const COMPLIANCE_VERIFICATION_SCRIPT_ZIP_SRC = [
  './bin/omid-compliance-verification-script-v1.js',
  './LICENSE',
];

gulp.task(
    'package-compliance-verification-script',
    gulpOperationIf(
        VERSION_NUMBER,
        gulp.series(
            () => gulp.src(COMPLIANCE_VERIFICATION_SCRIPT_ZIP_SRC)
                      .pipe(gulp.dest(`${PACKAGE_DIR}/Compliance-Script`)),
            () =>
                gulp.src(COMPLIANCE_VERIFICATION_SCRIPT_SRC)
                    .pipe(gulp.dest(`${PACKAGE_DIR}/Compliance-Script/Source`)),
            )));

gulp.task('build-unit-tests', () => {
  const taskConfig = {
    js: [
      './test/unit/**.js',
      // exclude externs in the binary test code
      '!./src/externs/*.js',
      './src/**.js',
      '!./src/validation-verification-script/main.js',
      '!./src/compliance-verification-script/*.js',
    ],
    externs: [
      ...commonConfig.externs,
      './node_modules/google-closure-compiler/contrib/externs/jasmine-2.0.js',
      './src/externs/omid-exports.js',
    ],
    js_output_file: 'Omid-Unit-Tests.js',
    create_source_map: '%outname%.map',
    dependency_mode: 'SORT_ONLY',
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'))
});

gulp.task('build-validation-verification-script-tests', () => {
  const taskConfig = {
    js: [
      './test/unit/typing-utils.js',
      './test/validation-verification-script/**.js',
      // exclude externs in the binary test code
      '!./src/externs/*.js',
      './src/**.js',
      '!./src/validation-verification-script/main.js',
      '!./src/compliance-verification-script/*.js',
    ],
    externs: [
      ...commonConfig.externs,
      './node_modules/google-closure-compiler/contrib/externs/jasmine-2.0.js',
      './src/externs/omid-exports.js',
    ],
    js_output_file: 'Omid-Validation-Verification-Script-Tests.js',
    create_source_map: '%outname%.map',
    dependency_mode: 'SORT_ONLY',
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'))
});

gulp.task('build-display-creative-session-script', () => {
  const taskConfig = {
    js: [
      './creatives/display/**.js',
      './src/session-client/**.js',
      './src/common/**.js',
    ],
    js_output_file: 'display-creative-session-script.js',
    output_wrapper_file: UMD_BOOTSTRAPPER_WITH_DEFAULT,
    entry_point: 'goog:omid.creatives.OmidCreativeSessionMain',
    externs: [
      ...commonConfig.externs,
      './src/externs/omid-exports.js',
      './src/externs/omid-jasmine.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'))
});

gulp.task('inject-display-creative-session-script', () => {
  var target = gulp.src('./creatives/display/html_display_creative.html');
  var source = gulp.src(['./bin/display-creative-session-script.js']);

  return target
      .pipe(inject(source, {
          starttag: '<!-- inject:creative:session:script:js -->',
          transform: (filepath, file) => {
              return '<script>' + file.contents.toString() + '</script>';
          }
      }))
      .pipe(gulp.dest('./bin'));
});

gulp.task('build-video-creative-session-script', () => {
  const taskConfig = {
    js: [
      './creatives/video/**.js',
      './src/session-client/**.js',
      './src/common/**.js'
    ],
    js_output_file: 'video-creative-session-script.js',
    output_wrapper_file: UMD_BOOTSTRAPPER_WITH_DEFAULT,
    entry_point: 'goog:omid.creatives.OmidVideoCreativeSessionMain',
    externs: [
      ...commonConfig.externs,
      './src/externs/omid-exports.js',
      './src/externs/omid-jasmine.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'))
});

gulp.task('inject-video-creative-session-script', () => {
  var target = gulp.src('./creatives/video/html_video_creative.html');
  var source = gulp.src('./bin/video-creative-session-script.js');

  return target
      .pipe(inject(source, {
          starttag: '<!-- inject:creative:session:script:js -->',
          transform: (filepath, file) => {
              return '<script>' + file.contents.toString() + '</script>';
          }
      }))
      .pipe(gulp.dest('./bin'));
});

gulp.task('build-video-pod-creative-session-script', () => {
  const taskConfig = {
    js: [
      './creatives/video/**.js',
      './src/session-client/**.js',
      './src/common/**.js'
    ],
    js_output_file: 'video-pod-creative-session-script.js',
    output_wrapper_file: UMD_BOOTSTRAPPER_WITH_DEFAULT,
    entry_point: 'goog:omid.creatives.OmidVideoPodCreativeSessionMain',
    externs: [
      ...commonConfig.externs,
      './src/externs/omid-exports.js',
      './src/externs/omid-jasmine.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'))
});

gulp.task('inject-video-pod-creative-session-script', () => {
  var target = gulp.src('./creatives/video/html_video_pod_creative.html');
  var source = gulp.src('./bin/video-pod-creative-session-script.js');

  return target
      .pipe(inject(source, {
          starttag: '<!-- inject:creative:session:script:js -->',
          transform: (filepath, file) => {
              return '<script>' + file.contents.toString() + '</script>';
          }
      }))
      .pipe(gulp.dest('./bin'));
});

gulp.task('build-visibility-measurement-script', () => {
  const taskConfig = {
    js: [
      './creatives/measurement/**.js',
      './src/verification-client/**.js',
      './src/common/**.js'
    ],
    js_output_file: 'visibility-measurement-script.js',
    output_wrapper_file: UMD_BOOTSTRAPPER_WITH_DEFAULT,
    entry_point: 'goog:omid.creatives.VisibilityMeasurementClientMain',
    externs: [
      ...commonConfig.externs,
      './src/externs/omid-exports.js',
      './src/externs/omid-jasmine.js',
    ],
  };
  return closureCompiler(Object.assign({}, commonConfig, taskConfig))
      .src() // needed to force the plugin to run without gulp.src
      .pipe(gulp.dest('./bin'))
});
