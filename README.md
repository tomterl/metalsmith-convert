# metalsmith-convert

This is a plugin for [Metalsmith][] that uses [node-imagemagick-native][] to convert image-files

Continuous testing curtesy of travis-ci:

[![Build Status](https://travis-ci.org/tomterl/metalsmith-convert.png)](https://travis-ci.org/tomterl/metalsmith-convert)

[metalsmith]: http://metalsmith.io
[node-imagemagick-native]: https://github.com/mash/node-imagemagick-native

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

- `src` is a globbing pattern that specifies which files to convert
- `target` is an extension (starting with `.`) that determins the image format all files matching `src` are converted to
- `remove` if set to `true`, don't include the source-file in the build directory.'
- `resize` set to `{width: XXX, height: YYY}` to resize the image; the name will reflect the size (`name_XXX_YYY.ext`)

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
        "resize": {width: 640, height: 480}
      }
    ]
  }
}
```
