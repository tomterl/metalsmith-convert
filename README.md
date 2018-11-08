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
      "src": "**/*.svg",
      "target": "png"
    }
  }
}
```

For metalsmiths JavaScript API, metalsmith-convert can be used like any other plugin, by attaching it to the function invocation chain on the metalsmith object.  For example:

```js
var convert = require('metalsmith-convert');
require('metalsmith')(__dirname)
  .use(convert({
    src: '**/*.svg',
    target: 'png'
  })
  .build();
```

## Options

metalsmith-convert requires the `src` options.  The parameter `target`
is optional; if it is not given, files will be converted to the
source-format.

- `src` is a globbing pattern that specifies which files to convert
- `target` is an imagemagick format specifier
- `extension` the file extension to use for the conversion target (starting with `.`). Set to `"." + target` if not given explicitly.
- `remove` if set to `true`, don't include the source-file in the build directory.
- `resize` set to `{width: XXX, height: YYY}` to resize the image; the name will reflect the size (`name_XXX_YYY.ext`) if `nameFormat` is not given.
  - `resizeStyle`: optional. default: 'aspectfill'. can be 'aspectfit','fill'. Must be added as a parameter to the `resize` option.
    - `aspectfill`: keep aspect ratio, get the exact provided size.
    - `aspectfit`: keep aspect ratio, get maximum image that fits inside provided size
    - `fill`: forget aspect ratio, get the exact provided size
- `rename_only`: if set to true, omits the call to ImageMagick and only moves the files to their intended target.
- `nameFormat`: the format for the names of the converted files, the following placeholders are available
  - `%b` the basename of the source file, e.g. given `source.png`, the value will be `source`
  - `%e` the extension of the target format, including the dot
  - `%x` the width of the resulting image
  - `%y` the height if the resulting image
- `renameSourceFormat`: the name-format to rename the source files in the result/build to. Accepts the same place-holders as `nameFormat`.

The plugin also forwards certain options directly to imagemagick-native, these options are `density`, `blur`, `rotate`, `flip`, `strip`, `gravity` and `quality`. See [imagemagick-native docs](https://github.com/mash/node-imagemagick-native#convertoptions-callback) for more info.

- It is possible to pass options as array of option-objects to implement multiple rules, e.g. resize to two sizes for different thumbnail sizes:
```javascript
{
  "plugins": {
    "metalsmith-convert": [
      {
        "src": "**/*.svg",
        "target": "png",
        "resize": {width: 320, height: 240},
        "nameFormat": "%b_thumb%e"
      },
      {
        "src": "**/*.svg",
        "target": "png",
        "resize": {width: 640, height: 480, resizeStyle: 'aspectfit'},
        "nameFormat": "%b_thumb_large%e"
      }
    ]
  }
}
```

- Resize images without format conversion:
```javascript
{
  "plugins": {
    "metalsmith-convert":
      {
        "src": "**/*.svg",
        "resize": {width: 320, height: 240},
        "nameFormat": "%b_thumb%e"
      },
  }
}
```

- Convert to the source name, but keep the original under a different name:
```javascript
{
  "plugins": {
    "metalsmith-convert":
      {
        "src": "**/*.svg",
        "resize": {width: 320, height: 240},
        "nameFormat": "%b_thumb%e"
        "renameSourceFormat": "%b_orig_%e"
      },
  }
}
```


## Development

To speed up your development cycle you can use the `rename_only`
option, pictures will not be processed and have a potentially wrong
file ending, but if your setup can cope with that, on demand scaling
might be preferable to longer conversion times.

## Contributions

Contributions are always welcome. Just make sure that all tests pass
before sending a pull request. And don't forget to add tests for your
contributions!
