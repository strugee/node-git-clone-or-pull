'use strict';

var vows = require('vows'),
    backendTest = require('./lib/branch-test.js');

var suite = vows.describe('NodeGit backend with branch options');

suite.addBatch(backendTest({implementation: 'nodegit'}));

suite['export'](module);
