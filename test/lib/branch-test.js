'use strict';

var assert = require('perjury').assert,
    path = require('path'),
    fs = require('fs'),
    assign = require('lodash.assign'),
    smartSpawn = require('smart-spawn'),
    tmpdir = require('./tmpdir'),
    repoPath = path.join(tmpdir, 'strugee.github.com'),
    failRepoPath = path.join(tmpdir, 'nonexistant');

module.exports = function(options) {
	var cloneOrPull;

	return {
		'When we require the module': {
			topic: function() {
				/* jshint boss: true */
				return cloneOrPull = require('../../index.js');
			},
			'it works': function(err, cloneOrPull) {
				assert.ifError(err);
				assert.isFunction(cloneOrPull);
			},
			'and we clone something and specify the branch': {
				topic: function(cloneOrPull) {
					cloneOrPull('git://github.com/strugee/strugee.github.com.git', assign({}, options, {branch: 'src', path: repoPath}), this.callback);
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'we get passed `undefined`': function(err, ret) {
					assert.isUndefined(ret);
				},
				'the directory exists': function() {
					// Evil sync thing
					assert.doesNotThrow(function() {
						fs.accessSync(repoPath);
					});
				},
				'the src/ directory exists': function() {
					// Evil sync thing
					assert.doesNotThrow(function() {
						fs.accessSync(path.join(repoPath, 'src'));
					});
				}
			}
		}
	};
};
