Streamception
===

![Xzibit](http://i.giphy.com/h3U9d9T3J5c9q.gif)

```bash
npm install --save streamception
```

Flattens out a stream of streams those streams can emit streams, which can emit streams all the way down.

API: pipe in an object stream non stream items get passed through, if an object is a stream then it's objects are passed through instead, ditto if any of those are streams.  We test for the presence of a pipe method to figure out if something is a stream.

Should correctly handle back pressure even in deeply nested streams.

![Infinite cats](http://i.giphy.com/7g1lOvyzFjXHi.gif)
