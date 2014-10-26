# metalsmith-convert

This is a plugin for [Metalsmith][] that uses [node-imagemagick-native][] to convert image-files

Continuous testing courtesy of travis-ci:

[![Build Status](https://travis-ci.org/tomterl/metalsmith-convert.png)](https://travis-ci.org/tomterl/metalsmith-convert)

[metalsmith]: http://metalsmith.io
[node-imagemagick-native]: https://github.com/mash/node-imagemagick-native

## Installation

This module is released via npm, install the latest released version with


```
npm install --save metalsmith-convert
```

### Dependencies

This module uses node-imagemagick-native. You must be able to compile
c++ code to install imagemagick-native. The [Readme][]
provides instructions for Linux, Mac OS X and Windows respectively.

[Readme]: https://github.com/mash/node-imagemagick-native

##  Usage

If using the CLI for Metalsmith, metalsmith-convert can be used like any other plugin by including it in `metalsmith.json`.  For example:

```json
{
  "plugins": {
    "metalsmith-convert": {
      "src": "**/*.svn",
      "target": "png"
    }
  }
}
```

For Metalscript's JavaScript API, metalsmith-convert can be used like any other plugin, by attaching it to the function invocation chain on the Metalscript object.  For example:

```js
var copy = require('metalsmith-convert');
require('metalsmith')(__dirname)
  .use(convert({
    src: '**/*.svg',
    target: 'png'
  })
  .build();
```

## Options

metalsmith-convert requires a `src` and `target` options.

- `src` is a globbing pattern that specifies which files to convert.
- `target` is an imagemagick format specifier.
- `extension` the file extension to use for the conversion target (starting with `.`). Set to `"." + target` if not given explicitly.
- `remove` if set to `true`, don't include the source-file in the build directory.
- `resize` set to `{width: XXX, height: YYY}` to resize the image; the name will reflect the size (`name_XXX_YYY.ext`) unless no explicit filename is given.
- `outputFilename` specifies the the name of the output file (the extension will still be added). `%FILE%` can be used to reference the original filename and add a pre- or suffix to it. 
E.g. `%FILE%_suffix` or `prefix_%FILE%`.

It is possible to pass options as array of option-objects to implement multiple rules, e.g. resize to two sizes:
```
{
  "plugins": {
    "metalsmith-convert": [
      {
        "src": "**/*.svg",
        "target": "png",
        "resize": {width: 320, height: 240}
      },
      {
        "src": "**/*.svg",
        "target": "png",
        "resize": {width: 640, height: 480},
        "outputFilename": "%FILE%_large"
      }
    ]
  }
}
```
