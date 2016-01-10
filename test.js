'use strict';
var test = require('tape');
var streamArray = require('stream-array');
var stream = require('readable-stream');
var inherits = require('inherits');
var streamception = require('./');
function makeArray(what, howMuch) {
  var out = new Array(howMuch);
  var i = -1;
  while (++i < howMuch) {
    out[i] = what;
  }
  return out;
}
inherits(RecursiveStream, stream.Readable);
function RecursiveStream(what, length, depth) {
  stream.Readable.call(this, {
    objectMode: true,
    highWaterMark: 1,
  });
  this.depth = depth - 1;
  this.length = length;
  this.i = -1;
  this.what = what;
}
RecursiveStream.prototype._read = function () {
  this.i++;
  if (this.i >= this.length) {
    return this.push(null);
  }
  var what = this.what.slice();
  what.push(this.i);
  if (!this.depth) {
    return this.push(what);
  }
  this.push(new RecursiveStream(what, this.length, this.depth));
}
function makeSubStream(what, howMuch, sneaky) {
  if (!sneaky) {
    return streamArray(makeArray(what, howMuch));
  }
  var out = new stream.Transform({
    objectMode: true,
    highWaterMark: 3,
    transform(chunk, _, next) {
      this.push(chunk);
      next();
    },
    flush(done) {
      var self = this;
      setTimeout(function () {
        self.push(what);
        done();
      }, 100);
    }
  });
  return streamArray(makeArray(what, howMuch - 1)).pipe(out);
}
function makeSteamOfStreams(howMany, sneaky){
  var i = 0;
  return new stream.Readable({
    objectMode: true,
    read(){
      while (true) {
        i++;
        if (i > howMany) {
          this.push(null);
          return;
        }
        var ret = this.push(makeSubStream(i, howMany, sneaky));
        if (ret) {
          return;
        }
      }
    }
  });
}
test('works!', function (t) {
  t.plan(1);
  var i = 0;
  makeSteamOfStreams(10).pipe(streamception()).on('data', function (d) {
    i++;
  }).on('end', function () {
    t.equals(100, i, 'correct ammount');
  });
});
test('works sneaky like', function (t) {
  t.plan(1);
  var i = 0;
  var last = -1;
  makeSteamOfStreams(10, true).pipe(streamception()).on('data', function (d) {
    i++;
    if (d < last) {
      t.ok(false, `wrong order`);
    }
    last = d;
  }).on('end', function () {
    t.equals(100, i, 'correct ammount');
  });
});
test('works recursivly', function (t) {
  var i = 0;
  var a = 2;
  var b = 20;
  new RecursiveStream([], a, b).pipe(streamception()).on('data', function (d) {
    i++;
  }).on('end', function () {
    t.equals(i, Math.pow(a, b), `correct number of things: ${i}`);
    t.end();
  });
});
