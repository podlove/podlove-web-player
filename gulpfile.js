'use strict';

// Load plugins
var gulp = require('gulp')
  , gutil = require('gulp-util')
  , sass = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , minifycss = require('gulp-minify-css')
  , eslint = require('gulp-eslint')
  , uglify = require('gulp-uglify')
  , imagemin = require('gulp-imagemin')
  , rename = require('gulp-rename')
  , del = require('del')
// deactivate caching until issue is resolved
//  , cache = require('gulp-cache')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , browserifyHandlebars = require('browserify-handlebars')
  , browserSync = require('browser-sync')

  , karma = require('karma').server
  , assign = require('lodash/object/assign')

  , karmaConf = require('./karma.conf.json')
  , source = require('vinyl-source-stream')
  , buffer = require('vinyl-buffer')
  , streamify = require('gulp-streamify');
//  , sourcemaps = require('gulp-sourcemaps');

var reload = browserSync.reload

// set paths
  , bower = 'bower_components/'
  , src = 'src/'
  , dest = 'dist/'
  , external = 'vendor/'
  ;

gulp.task('lint', function () {
  // Note: To have the process exit with an error code (1) on
  //  lint error, return the stream and pipe to failOnError last.
  return gulp.src([source + 'js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  var singleRunConf = assign({}, karmaConf, {singleRun: true});
  karma.start(singleRunConf, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  karma.start(karmaConf, done);
});

// Styles
gulp.task('styles', function() {
  return gulp.src(src + 'sass/pwp-*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(dest + 'css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(dest + 'css'))
    .pipe(reload({stream: true}));
});

function handleBrowserifyError(err) {
    gutil.log(err.message);
    browserSync.notify('Browserify Error!');
    this.emit('end');
}

function getStreamBundler (entryName, bundleName) {
  // add custom browserify options here
  var opts = assign({}, watchify.args, {
    entries: [src + entryName],
    debug: true,
    insertGlobals: true
  });
  var bundleStream = watchify(browserify(opts))
    .transform(browserifyHandlebars)
    .bundle();

  function bundle () {
    bundleStream
      .on('error', handleBrowserifyError)
      .pipe(source(entryName))
      .pipe(buffer())
//      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(rename(bundleName))
      .pipe(gulp.dest(dest + 'js'))   // copy to destination directory
      .pipe(rename({suffix: '.min'})) // add .min for minified source
      .pipe(streamify(uglify()))      // pipedream is a pipe full of streams
      .pipe(gulp.dest(dest + 'js'))   // copy to destination directory
      // .pipe(sourcemaps.write('./'))   // writes .map file
      .pipe(browserSync.stream({once: true})); // stream new version to browsersync
  }

  bundleStream.on('update', bundle);

  return bundle;
}

var moderatorStreamBundler = getStreamBundler('js/moderator.js', 'podlove-web-moderator.js');
gulp.task('moderator', moderatorStreamBundler);

var playerStreamBundler = getStreamBundler('js/app.js', 'podlove-web-player.js');
gulp.task('player', playerStreamBundler);

// Scripts
gulp.task('scripts', ['player', 'moderator']);

// Images
gulp.task('images', function() {
  return gulp.src(src + 'img/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(dest + 'img'))
    .pipe(reload({stream: true}));
});

// copy lib files
gulp.task('copy', function() {
  // Copy MediaElement fallbacks
  gulp.src(bower + 'mediaelement/build/flashmediaelement.swf')
    .pipe(gulp.dest(dest + 'bin'));
  gulp.src(bower + 'mediaelement/build/silverlightmediaelement.xap')
    .pipe(gulp.dest(dest + 'bin'));

  // Copy external JS-libs
  gulp.src(bower + 'html5shiv/dist/*')
    .pipe(gulp.dest(dest + 'js/' + external));
  gulp.src(bower + 'jquery/dist/*')
    .pipe(gulp.dest(dest + 'js/' + external));

  // Copy progress polyfill JS and CSS
  gulp.src(bower + 'progress-polyfill/*.css')
    .pipe(gulp.dest(dest + 'css/' + external));
  gulp.src(bower + 'progress-polyfill/*.js')
    .pipe(gulp.dest(dest + 'js/' + external));

  // Copy Podlove Font
  gulp.src(bower + 'podlove-font/font/*')
    .pipe(gulp.dest(dest + 'font'));
});

// copy example files
gulp.task('examples', function() {
  // main documentation index html
  gulp.src(src + '*.html')
    .pipe(gulp.dest(dest))
    .pipe(reload({stream: true}));

  // all media examples
  gulp.src(src + 'examples/**/*.*')
    .pipe(gulp.dest(dest + 'examples'))
    .pipe(reload({stream: true}));
});

// Clean
gulp.task('clean', function (cb) {
  del([dest], cb);
});

// build distribution package
gulp.task('build', ['clean'], function() {
  gulp.start('styles', 'scripts', 'images', 'copy', 'examples');
});

// Default task
gulp.task('default', ['lint', 'test'], function() {
  gulp.start('build');
});

// Watch
gulp.task('watch', function() {
  browserSync({
    server: {
        baseDir: './dist/'
    }
  });

  // Watch Sass source files
  gulp.watch(src + 'sass/**/*.scss', ['styles']);

  // Watch Javascript src files
  gulp.watch(src + 'js/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch(src + 'img/**/*', ['images']);

  // Watch example files
  gulp.watch(src + '*.html', ['examples']);

});

// Serve
gulp.task('serve', ['build', 'watch']);
