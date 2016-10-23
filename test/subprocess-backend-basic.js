'use strict';

var vows = require('vows'),
    backendTest = require('./lib/backend-test.js');

var suite = vows.describe('NodeGit backend');

suite.addBatch(backendTest({implementation: 'subprocess'}));

suite['export'](module);
