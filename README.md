# `git-clone-or-pull`

[![Build Status](https://travis-ci.org/strugee/node-git-clone-or-pull.svg?branch=master)](http://travis-ci.org/strugee/node-git-clone-or-pull)
[![npm](https://img.shields.io/npm/v/git-clone-or-pull.svg)](https://npmjs.com/package/git-clone-or-pull)
[![Greenkeeper badge](https://badges.greenkeeper.io/strugee/node-git-clone-or-pull.svg)](https://greenkeeper.io/)

Ensure a git repo exists on disk and that it's up-to-date

## Installation

    npm install git-clone-or-pull

Node 4.x or greater is required. The module will probably work on Node 0.12, but the tests do not. So I wouldn't count on it.

## Usage

Simple example:

```js
var cloneOrPull = require('git-clone-or-pull');
var path = require('path');

cloneOrPull('git://github.com/strugee/node-git-clone-or-pull.git', path.join(process.cwd(), 'node-git-clone-or-pull'), function(err) {
    if (err) throw err;

    // Use repo
});
```

The `cloneOrPull()` function takes three arguments. In order:

`url` (`String`) - the URL to clone from

`opts` (`String` or `Object`) the pathname to clone to if a `String`, otherwise an object containing module options (see "Options" below)

`callback` (`Function`) function callback that will be called upon completion of the clone or pull. If there is an error, it will be passed as the first argument.

## Options

`path` (`String`) - the pathname to clone to. If a `String` is provided instead of an options `Object`, it will be used as `path`'s value.

`implementation` (`String`) - the implementation to use; defaults to `nodegit` in most cases (see "Implementations" below)

`branch` (`String`) - the branch to use; defaults to `master` (even if the default upstream branch is something else)

## Implementations

* `nodegit` uses NodeGit, the libgit2 bindings for Node.
* `subprocess` is based on spawning `git` subprocesses (which means you need a `git` binary installed).

Implementation is determined with the following algorithm:

1. If `opts.implementation` exists its value will be used as the implementation; if that implementation is unavailable an error will be returned to the callback
2. If NodeGit can be loaded, the implementation will be `nodegit`
3. If `git --version` returns an exit code of 0, the implementation will be `subprocess`
4. No implementation can be found and an error will be returned to the callback

Each implementation has its negatives: `nodegit` makes installation slightly more complicated. `subprocess` works on most systems - but it requires an external binary.

## License

LGPL 3.0+

## Author

Alex Jordan <alex@strugee.net>
