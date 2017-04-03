'use strict';

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    assign = require('lodash.assign'),
    smartSpawn = require('smart-spawn'),
    rimraf = require('rimraf'),
    repoPath = path.join(process.cwd(), 'strugee.github.com');

module.exports = function(options) {
	var cloneOrPull;

	return {
		'When we require the module': {
			topic: function() {
				/* jshint boss: true */
				return cloneOrPull = require('../../index.js');
			},
			teardown: function() {
				rimraf(repoPath, this.callback);
			},
			'it works': function(cloneOrPull) {
				assert.isFunction(cloneOrPull);
			},
			'and we clone something and specify the branch': {
				topic: function(cloneOrPull) {
					cloneOrPull('git://github.com/strugee/strugee.github.com.git', assign({}, options, {branch: 'src', path: repoPath}), this.callback);
				},
				'the directory exists': function() {
					fs.access(repoPath, function(err) {
						assert.ifError(err);
					});
				},
				'the src/ directory exists': function() {
					fs.access(path.join(repoPath, 'src'), function(err) {
						assert.ifError(err);
					});
				}
			}
		}
	};
};
