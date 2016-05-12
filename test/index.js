var assert = require('assert'),
    metalsmith = require('metalsmith'),
    convert = require('..');
    fs = require('fs'),
    sizeOf = require('image-size');

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
  it('should croak on missing paramters', function(done){
    convert_test({}, function(err, files) {
      if(!err) return done(new Error("Didn't error out on missing arguments."));
      assert.equal(err.message, 'metalsmith-convert: "src" and "target" args required', 'Correct error was thrown');
      return done();
    });
  });
  it('should croak on partially missing paramters', function(done){
    convert_test([
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 320, height: 240 }
      },
      {}], function(err, files) {
             if(!err) return done(new Error("Didn't error out on missing arguments."));
             assert.equal(err.message, 'metalsmith-convert: "src" and "target" args required', 'Correct error was thrown');
             return done();
           });
  });
  it('should convert from .svg to .png', function(done) {
    convert_test({
      src: '**/*.svg',
      target: 'png',
      IM: false,
      remove: true
    }, function(err, files) {
         if (err) return done(err);
         assert(files['static/images/test.png'], 'file was converted');
         return done();
       });
  });
  it('should identify the image size', function(done) {
    convert_test({
      src: '**/*.svg',
      target: 'png',
      IM: false,
      remove: true,
      nameFormat: '%b_%x_%y%e'
    }, function(err, files) {
         if (err) return done(err);
         assert(files['static/images/test_1052_744.png'], 'size was identified');
         return done();
       });
  });
  it('should resize the image', function(done) {
    convert_test({
      src: '**/*.svg',
      target: 'png',
      remove: true,
      resize: { width: 320, height: 240 }
    }, function(err, files){
         if (err) return done(err);
         assert(files['static/images/test_320_240.png'], 'file was resized');
         return done();
       });
  });
  it('should resize and convert the image', function(done) {
    convert_test([
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 160, height: 120 }
      },
      {
        src: '**/*.svg',
        target: 'png',
        IM: false,
        remove: true
      }], function(err, files){
        if (err) return done(err);
        assert(files['static/images/test.png'] && files['static/images/test_160_120.png'], 'file was converted and resized');
        return done();
      });
  });
  it('should resize two sizes', function(done) {
    convert_test([
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 320, height: 240 }
      },
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 640, height: 480 }
      }], function(err, files){
        if (err) return done(err);
        assert(files['static/images/test_320_240.png'] && files['static/images/test_640_480.png'], 'file was two times resized');
        return done();
      });
  });
  it('should honour the nameFormat option', function(done) {
    convert_test([
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 320, height: 240 },
        nameFormat: '%b_thumb%e'
      },
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 640, height: 480 },
        nameFormat: '%b_thumb_large%e'
      }], function(err, files){
        if (err) return done(err);
        assert(files['static/images/test_thumb.png'] && files['static/images/test_thumb_large.png'], 'fileFormat was correctly used');
        return done();
      });
  });
  it('should honour the resizeStyle option', function(done) {
    convert_test(
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 320, height: 320, resizeStyle: 'aspectfit'},
        nameFormat: '%b_thumb%e'
    }, function(err, files){
      if (err) return done(err);
        var result = sizeOf(files['static/images/test_thumb.png'].contents);

        sizeOf('test/fixtures/simple/expected/test_thumb.png', function (err, dimensions) {
          if (err) return done(err);
          assert.deepEqual(result, dimensions, 'aspectFit was correctly used');
          done();
        });
    });
  });
  it('should rename_only the image', function(done) {
    convert_test([
      { src: '**/*.svg',
        target: 'png',
        resize: { width: 160, height: 120 },
        rename_only: true
      },
      {
        src: '**/*.svg',
        target: 'png',
        IM: false,
        remove: true
      }], function(err, files){
        if (err) return done(err);
        assert(files['static/images/test.png'] && files['static/images/test_160_120.png'], 'file was converted and resized');
        assert(files['static/images/test.png'].contents === files['static/images/test_160_120.png'].contents, 'files were passed by reference');
        return done();
      });
  });
});
