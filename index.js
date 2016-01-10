'use strict';
var stream = require('readable-stream');
var duplexify = require('duplexify');
var inherits = require('inherits');
module.exports = streamception;
function isStream(thing) {
  return thing && typeof thing.pipe === 'function';
}
function streamception() {
  var readable = new stream.PassThrough({
    objectMode: true
  });
  var writable = new OurWritable(readable, function () {
    readable.end();
  });
  return duplexify.obj(writable, readable);
}
inherits(OurWritable, stream.Writable);
function OurWritable(readable, after) {
  stream.Writable.call(this, {
    objectMode: true
  });
  this.readable = readable;
  this.once('finish', after);
}
OurWritable.prototype._write = function (chunk, _, done) {
  if (!isStream(chunk)) {
    return this.readable.write(chunk, done);
  }
  var out = new OurWritable(this.readable, done);
  chunk.pipe(out);
}
