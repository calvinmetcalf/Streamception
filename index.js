'use strict';
var stream = require('readable-stream');
var duplexify = require('duplexify');

module.exports = streamception;

function streamception() {
  var readable = new stream.PassThrough({
    objectMode: true
  });
  var writable = new stream.Writable({
    objectMode: true,
    write: function (chunk, _, done) {
      chunk.on('end', done).pipe(readable, {
        end: false
      });
    }
  }).on('finish', function () {
    readable.end();
  });
  return duplexify.obj(writable, readable);
}
