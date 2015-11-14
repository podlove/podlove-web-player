'use strict';

var fs = require('fs'),
  compass = require('./lib/compass'),
  through = require('through2'),
  gutil = require('gulp-util'),
  path = require('path');

// Consts
var PLUGIN_NAME = 'gulp-compass';

module.exports = function(opt) {
  var compile = function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    if (path.basename(file.path)[0] === '_') {
      return cb();
    }

    compass(file.path, opt, function(code, stdout, stderr, pathToCss) {
      if (code === 127) {
        return cb(new gutil.PluginError(PLUGIN_NAME, 'You need to have Ruby and Compass installed ' +
          'and in your system PATH for this task to work.'));
      }

      // support error callback
      if (code !== 0) {
        return cb(new gutil.PluginError(PLUGIN_NAME, stdout || 'Compass failed', {fileName: file.path}));
      }


      file.contents = null;
      file.path = pathToCss;

      fs.readFile(pathToCss, function (err, contents) {
        if (err) {
          return cb(new gutil.PluginError(PLUGIN_NAME, 'Failure reading in the CSS output file'));
        }

        // Fix garbled output.
        if (!(contents instanceof Buffer)) {
          contents = new Buffer(contents);
        }

        file.contents = contents;
        return cb(null, file);

      });
    });
  };

  return through.obj(compile);
};
