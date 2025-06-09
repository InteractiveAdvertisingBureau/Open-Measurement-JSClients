const exec = require('child_process').exec;
const fs = require('fs');
const googleClosureCompiler = require('google-closure-compiler');
const gulp = require('gulp');
const gulpConnect = require('gulp-connect');
const gulpData = require('gulp-data');
const gulpTemplate = require('gulp-template');
const gulpWatch = require('gulp-watch');

const DEVSERVER_HOST = 'localhost';
const DEVSERVER_PORTS = ['8080', '8081'];
const JS_SRCS = ['./src/**.js'];
const TEMPLATE_SRCS = ['./templates/**.html'];
const STATIC_FILES = ['./static/**/*'];
const SETTINGS_DEFAULT_PATH = './templates/.settings.default.json';
const COMMON_COMPILER_CONFIG = {
  compilation_level: 'SIMPLE',
  dependency_mode: 'PRUNE',
  formatting: 'PRETTY_PRINT',
  warning_level: 'VERBOSE',
  language_in: 'ECMASCRIPT_2017',
  language_out: 'ECMASCRIPT_2015',
  externs: [
    '../src/externs/closure.js',
  ],
};
const JS_BINARY_CONFIGS = [
  {
    entry_point: './src/root-page-controller',
    js_output_file: 'index.js',
    js: JS_SRCS,
  },
  {
    entry_point: './src/test-case-page-controller',
    js_output_file: 'test-case.js',
    js: JS_SRCS,
  },
  {
    entry_point: './src/video-creative-page-controller',
    js_output_file: 'video.js',
    js: [
      '../src/common/**.js',
      '../src/session-client/**.js',
      './src/**.js',
    ],
  },
];

const jsCompiler = googleClosureCompiler.gulp();
const buildScriptTasks = JS_BINARY_CONFIGS.map((jsBinaryConfig) => {
  const config = Object.assign({}, COMMON_COMPILER_CONFIG, jsBinaryConfig);
  return () => jsCompiler(config).src().pipe(gulp.dest('./dist'));
});

const buildScripts = gulp.parallel(...buildScriptTasks);

/** Builds the template files in ./templates/. */
function buildTemplates() {
  return gulp.src(TEMPLATE_SRCS)
      .pipe(gulpData(() => JSON.parse(fs.readFileSync(SETTINGS_DEFAULT_PATH))))
      .pipe(gulpTemplate())
      .pipe(gulp.dest('./dist/'));
}

/** Copies static files to dist/, */
function copyStaticFiles() {
  return gulp.src(STATIC_FILES, {dot: true}).pipe(gulp.dest('./dist/'));
}

/**
 * Starts serving a dev server on the given port.
 * @param {number} port
 */
function server(port) {
  return gulpConnect.server({
    root: './dist/',
    port: port,
    host: DEVSERVER_HOST,
    livereload: true,
  });
}

const serverTasks = DEVSERVER_PORTS.map((port) => server.bind(this, port));
const servers = gulp.parallel(...serverTasks);

/** Watches the dist/ folder for changes, reloading the page if so. */
function livereload() {
  return gulpWatch('./dist/*').pipe(gulpConnect.reload());
}

/** Watches folders for changes, building if needed. */
function watch() {
  gulp.watch(JS_SRCS, {}, buildScripts);
  gulp.watch(TEMPLATE_SRCS, {}, buildTemplates);
  gulp.watch(STATIC_FILES, {}, copyStaticFiles);
}

/** Builds the other package dependencies. */
function buildDependencies(callback) {
  exec(
      'cd ../ && ' +
      'npm run build-validation-verification-script && ' +
      'cd ../ && ' +
      'npm run build-web-service',
      (err) => {
        callback(err);
      });
}

/** Copies the other package dependencies into static. */
function copyDependencies(callback) {
  exec(
      'cp ../bin/omid-validation-verification-script-v1.js static/ &&' +
      'cp ../../bin/omweb-v1.js static/',
      (err) => {
        callback(err);
      });
}

exports.buildDeps = gulp.series(buildDependencies, copyDependencies);
exports.build = gulp.series(buildScripts, buildTemplates, copyStaticFiles);
exports.start =
    gulp.series(exports.build, gulp.parallel(servers, livereload, watch));
