var debug = require('debug')('metalsmith-convert'),
    path = require('path'),
    Minimatch = require('minimatch').Minimatch,
    fs = require('fs'),
    gm = require('gm'),
    util = require('util');

module.exports = convert;

function convert(options) {
  return function(files, metalsmith, done) {
    var useIM = options.IM;
    if (!options.src && !options.target) return done(new Error('metalsmith-convert: "src" and "target" options required'));
    var ext = options.extension || '.' + options.target;
    var matcher = new Minimatch(options.src);
    Object.keys(files).forEach(function (file) {
      if (!matcher.match(file)) return;

      var currentExt = path.extname(file);
      var newName = path.join(path.dirname(file), path.basename(file, currentExt) + ext);

      gm(files[file].contents, path.basename(file))
      .options({imagemagick: useIM})
      .toBuffer(options.target, function(err, buffer) {
        if(!err) {
          debug('conversion done');
          files[newName] = { contents: buffer};
        } else {
          console.log(err);
        }});

      if (options.remove) {
        delete files[file];
      }
    });
    return done();
  }
}
