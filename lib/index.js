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
      if (!args.src && !args.target) {
        ret = new Error('metalsmith-convert: "src" and "target" args required');
        return;
      }

      if (!args.nameFormat) {
        if (args.resize) {
          args.nameFormat = '%b_%x_%y%e';
        } else {
          args.nameFormat = '%b%e';
        }
      }
      var ext = args.extension || '.' + args.target;
      Object.keys(files).forEach(function (file) {
        convertFile(file, ext, args, files, results);
      });
    };
    if (util.isArray(options)) {
      options.forEach(function(opts) {
        pass(opts);
      });
    } else {
      pass(options);
    }
    return done(ret);
  };
}

function convertFile(file, ext, args, files, results) {
  var nameData = {'%e': ext};
  if (minimatch(file, args.src)) {
    if (results[file]) return;

    if(!!args.rename_only) {
      im.convert = function(convertArgs) {
        return convertArgs.srcData;
      }
    }

    var convertArgs = {
      srcData: files[file].contents,
      format: args.target,
      strip: true,
      quality: 90
    };
    var currentExt = path.extname(file);
    nameData['%b'] = path.basename(file, currentExt);

    // Pass options to imagemagick-native
    [
      'density',
      'blur',
      'rotate',
      'flip',
      'strip',
      'quality',
      'gravity'
    ].forEach(function (setting) {
      if (args.hasOwnProperty(setting)) {
        convertArgs[setting] = args[setting];
      }
    });

    if (args.resize) {
      convertArgs['width'] = args.resize.width;
      convertArgs['height'] = args.resize.height;
      nameData['%x'] = args.resize.width;
      nameData['%y'] = args.resize.height;
      convertArgs['resizeStyle'] = args.resize.resizeStyle;
      debug("Resizing (" + args.resize.width + "x" + args.resize.height + ")");
    } else {
      var info = im.identify({srcData: files[file].contents});
      nameData['%x'] = info.width;
      nameData['%y'] = info.height;
    }
    var newName = assembleFilename(args.nameFormat, nameData);
    debug("New name is " + newName);
    newName = path.join(path.dirname(file), newName);
    var result = im.convert(convertArgs);

    files[newName] = { contents: result };
    results[newName] = true;
    if (args.remove) {
      delete files[file];
    }
  }
}

function assembleFilename(format, data) {
  var result = format;
  for(var key in data) {
    debug("Replacing " + key + " with " + data[key]);
    result = result.replace(key, data[key]);
  }
  return result;
}
