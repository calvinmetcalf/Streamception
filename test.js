var test = require('tape');
var streamArray = require('stream-array');
var stream = require('readable-stream');
var streamception = require('./');
function makeArray(what, howMuch) {
  var out = new Array(howMuch);
  var i = -1;
  while (++i < howMuch) {
    out[i] = what;
  }
  return out;
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
      }, 1000);
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
  t.plan(101);
  var i = 0;
  makeSteamOfStreams(10, true).pipe(streamception()).on('data', function (d) {
    i++;
    t.ok(true, `#${i}: ${d}`);
  }).on('end', function () {
    t.equals(100, i, 'correct ammount');
  });
});
