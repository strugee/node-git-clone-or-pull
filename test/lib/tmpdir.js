'use strict';

var tmp = require('tmp'),
    tmpdir = tmp.dirSync({prefix: 'tmp-node-git-clone-or-pull', unsafeCleanup: true});

module.exports = tmpdir.name;
