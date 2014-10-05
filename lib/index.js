var debug = require('debug')('metalsmith-convert'),
    path = require('path'),
    minimatch = require('minimatch'),
    fs = require('fs'),
    im = require('imagemagick-native'),
    util = require('util');

module.exports = convert;

function convert(options) {
  return function(files, metalsmith, done) {
    var useIM = options.IM;
    if (!options.src && !options.target) return done(new Error('metalsmith-convert: "src" and "target" options required'));
    var ext = options.extension || '.' + options.target;
    Object.keys(files).forEach(function (file) {
      if (minimatch(file, options.src)) {
        var convertOptions = {
            srcData: files[file].contents,
            format: options.target
        };
        var currentExt = path.extname(file);
        var newBasename = path.basename(file, currentExt);

        if (options.resize) {
          convertOptions['width'] = options.resize.width;
          convertOptions['height'] = options.resize.height;
          newBasename = newBasename + "_" + options.resize.width + "_" + options.resize.height;
          debug("Resizing (" + options.resize.width + "x" + options.resize.height + ")");
        }
        var result = im.convert(convertOptions);

        var newName = path.join(path.dirname(file), newBasename + ext);
        files[newName] = { contents: result };
        
        if (options.remove) {
          delete files[file];
        }
      }});
    return done();
  }
}

