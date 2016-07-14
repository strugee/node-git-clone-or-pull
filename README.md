# `git-clone-or-pull`

Ensure a git repo exists on disk and that it's up-to-date

## Installation

    npm install git-clone-or-pull

## Usage

_**WARNING:**_ this module makes a call to `nodegit`'s `Remote.url()` method which is _synchronous_!

```js
var cloneOrPull = require('git-clone-or-pull');
var path = require('path');

cloneOrPull('git://github.com:strugee/node-git-clone-or-pull.git', path.join(process.cwd(), 'node-git-clone-or-pull'), function(err) {
    if (err) throw err;

    // Use repo
});;
```

## License

LGPL 3.0+

## Author

Alex Jordan <alex@strugee.net>
