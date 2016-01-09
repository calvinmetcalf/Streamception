'use strict';
var stream = require('readable-stream');
var duplexify = require('duplexify');

module.exports = streamception;

function streamception() {
  var readable = new stream.PassThrough({
    objectMode: true
  });
  var queue = [];
  var writable = new stream.Writable({
    objectMode: true,
    write: function (chunk, _, done) {
      if (typeof chunk.pipe === 'function') {
        drain(chunk, queue, readable, function () {
          maybeDone(queue, readable, done);
        })
      } else {
        out.write(chunk, next);
      }
    }
  }).on('finish', function () {
    readable.end();
  });
  return duplexify.obj(writable, readable);
}
function drain(thing, queue, out, done) {
  thing.pipe(new stream.Writable({
    objectMode: true,
    write: function (chunk, _, next) {
        if (typeof chunk.pipe === 'function') {
          queue.push(chunk);
          next();
        } else {
          out.write(chunk, next);
        }
    }})).on('finish', done);
}
function maybeDone(queue, out, done) {
  if (!queue.length) {
    return done();
  }
  var item = queue.pop();
  if (typeof item.pipe === 'function') {
    drain(item, queue, out, function () {
      maybeDone(queue, out, done);
    });
  } else {
    out.write(item, function () {
      maybeDone(queue, out, done);
    });
  }
}
