var assert = require('assert'),
    dir_equal = require('assert-dir-equal'),
    metalsmith = require('metalsmith'),
    collections = require('metalsmith-collections'),
    convert = require('..');

function convert_test(options, fn) {
  // build callback can be called multiple times if an error condition occurs
  var once = false;

  metalsmith('test/fixtures/simple').use(convert(options)).build(function(err, files) {
    if (once) return;
    once = true;
    fn(err, files);
  })
}

describe('metalsmith-convert', function() {
  it('should convert from .svg to .png', function(done) {
    convert_test({
      src: '**/*.svg',
      target: 'png',
      IM: false,
      remove: true
    }, function(err, files) {
      if (err) return done(err);
      assert(files['static/images/test.png'], 'file was converted');
      done();
    });
  });
});
