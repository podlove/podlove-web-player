// Load plugins
var gulp = require('gulp')
  , compass = require('gulp-compass')
  , autoprefixer = require('gulp-autoprefixer')
  , minifycss = require('gulp-minify-css')
  , jshint = require('gulp-jshint')
  , uglify = require('gulp-uglify')
  , imagemin = require('gulp-imagemin')
  , rename = require('gulp-rename')
  , clean = require('gulp-clean')
  , concat = require('gulp-concat')
  , notify = require('gulp-notify')
  , cache = require('gulp-cache')
  , browserify = require('gulp-browserify')
  , connect = require('gulp-connect')

// set paths
  , bower = 'bower_components/'
  , source = 'src/'
  , dest = 'dist/'
  , external = 'vendor/'
  ;

// Styles
gulp.task('styles', function() {
  return gulp.src(source + 'sass/podlove-web-player.scss')
    .pipe(compass({
      config_file: './config.rb',
      style: 'expanded',
      css: dest + 'css',
      sass: source + 'sass'
    }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(dest + 'css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(dest + 'css'))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('moderator', function() {
  return gulp.src(source + 'js/moderator.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(browserify({ insertGlobals : true, debug : true }))
    .pipe(rename('podlove-web-moderator.js'))
    .pipe(gulp.dest(dest + 'js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(dest + 'js'))
    .pipe(notify({ message: 'Moderator built.' }));
});

gulp.task('player', function() {
  return gulp.src(source + 'js/app.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(browserify({ insertGlobals : true, debug : true }))
    .pipe(rename('podlove-web-player.js'))
    .pipe(gulp.dest(dest + 'js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(dest + 'js'))
    .pipe(notify({ message: 'Player built.' }));
});

// Scripts
gulp.task('scripts', function() {
  gulp.start('player', 'moderator');
});

// Images
gulp.task('images', function() {
  return gulp.src(source + 'img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(dest + 'img'))
    .pipe(notify({ message: 'Images task complete' }));
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

  // Copy Podlove Font
  gulp.src(source + 'libs/podlove-font/font/*')
    .pipe(gulp.dest(dest + 'font'));
});

// copy example files
gulp.task('example', function() {
  // Copy MediaElement fallbacks
  gulp.src(source + 'example/**/*')
    .pipe(gulp.dest(dest + 'example'));
});

// Clean
gulp.task('clean', function() {
  return gulp.src(dest, {read: false})
    .pipe(clean());
});

// Default task
gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'scripts', 'images', 'copy', 'example');
});

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch(source + 'sass/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch(source + 'js/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch(source + 'img/**/*', ['images']);

  // Watch example files
  gulp.watch(source + 'example/**/*', ['example']);

});

gulp.task('connect', function() {
  connect.server({
    root: dest,
    livereload: true
  });
});

// Serve
gulp.task('serve', ['default', 'connect', 'watch']);

