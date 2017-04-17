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
      if (!args.src) {
        ret = new Error('metalsmith-convert: "src" arg is required');
        return;
      }

      if (!args.target) { // use source-format for target in convertFile
        args.target = '__source__';
      }
      var ext = args.extension || '.' + args.target;

      if (!args.nameFormat) {
        if (args.resize) {
          args.nameFormat = '%b_%x_%y%e';
        } else {
          args.nameFormat = '%b%e';
        }
      }
      if (!!args.remove // don't remove source-files from build if 
          && args.nameFormat === '%b%e' // the converted target has the
          && args.target === '__source__') { // same name
        args.remove = false;
      }
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
  if (minimatch(file, args.src)) {
    if (results[file]) return;
    var nameData = {};
    if (ext === '.__source__') {
      nameData['%e'] = ext = path.extname(file);
    } else  {
      nameData['%e'] =  ext;
    }

    if(!!args.rename_only) {
      im.convert = function(convertArgs) {
        return convertArgs.srcData;
      };
    }

    var convertArgs = {
      srcData: files[file].contents,
      format: ext.substr(1),
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
      convertArgs['gravity'] = args.resize.gravity;
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
    if (args.renameSourceFormat) {
      var rename = assembleFilename(args.renameSourceFormat, nameData);
      rename = path.join(path.dirname(file), rename);
      files[rename] = files[file];
      delete files[file];
    }
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
