var debug = require('debug')('metalsmith-convert'),
    path = require('path'),
    minimatch = require('minimatch'),
    im = require('imagemagick-native'),
    util = require('util');

module.exports = convert;

function convert(options) {
  return function(files, metalsmith, done) {
    var results = {}; // don't process results of previous passes
    var ret = null; // what to return;
    var pass = function(args) {
      var useIM = args.IM;
      if (!args.src && !args.target) {
        ret = new Error('metalsmith-convert: "src" and "target" args required');
        return;
      }
     
      var ext = args.extension || '.' + args.target;
      Object.keys(files).forEach(function (file) {
        if (minimatch(file, args.src)) {
          if (results[file]) return;

          var convertArgs = {
            srcData: files[file].contents,
            format: args.target,
            strip: true,
            quality: 90
          };
          var currentExt = path.extname(file);
          var newBasename = path.basename(file, currentExt);

          if (args.resize) {
            convertArgs['width'] = args.resize.width;
            convertArgs['height'] = args.resize.height;
            newBasename = newBasename + "_" + args.resize.width + "_" + args.resize.height;
            debug("Resizing (" + args.resize.width + "x" + args.resize.height + ")");
          }
          var newName = path.join(path.dirname(file), newBasename + ext);
          var result = im.convert(convertArgs);

          files[newName] = { contents: result };
          results[newName] = true;
          if (args.remove) {
            delete files[file];
          }
        }});
    };
    if (util.isArray(options)) {
      options.forEach(function(opts) {
        pass(opts);
      })
    } else {
      pass(options);
    }
    return done(ret);
  }
}

