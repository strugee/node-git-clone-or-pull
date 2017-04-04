'use strict';

var mocha = require('mocha'),
    backendTest = require('./lib/backend-test.js');

var suite = mocha.Suite(
    'Subprocess backend', 
    backendTest(
        {implementation: 'subprocess'}
    )
);
