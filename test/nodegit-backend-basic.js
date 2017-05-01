'use strict';

var vows = require('perjury'),
    backendTest = require('./lib/backend-test.js');

var suite = vows.describe('NodeGit backend');

suite.addBatch(backendTest({implementation: 'nodegit'}));

suite['export'](module);
