# metalsmith-convert

This is a plugin for [Metalsmith][] that uses [node-gm][] to convert image-file

[metalsmith]: http://metalsmith.io
[node-gm]: https://github.com/aheckmann/gm

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

