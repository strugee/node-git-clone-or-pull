'use strict';

var vows = require('perjury'),
    backendTest = require('./lib/branch-test.js');

var suite = vows.describe('Subprocess backend with branch options');

suite.addBatch(backendTest({implementation: 'subprocess'}));

suite['export'](module);
