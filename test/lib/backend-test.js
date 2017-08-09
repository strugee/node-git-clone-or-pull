'use strict';

var assert = require('perjury').assert,
    path = require('path'),
    fs = require('fs'),
    assign = require('lodash.assign'),
    smartSpawn = require('smart-spawn'),
    rimraf = require('rimraf'),
    repoPath = path.join(process.cwd(), 'node-git-clone-or-pull'),
    failRepoPath = path.join(process.cwd(), 'nonexistant');

module.exports = function(options) {
	var opts = assign({}, options, {path: repoPath}),
	    failOpts = assign({}, options, {path: failRepoPath}),
	    cloneOrPull;

	return {
		'When we require the module': {
			topic: function() {
				/* jshint boss: true */
				return cloneOrPull = require('../../index.js');
			},
			teardown: function() {
				rimraf(repoPath, this.callback);
			},
			'it works': function(err, cloneOrPull) {
				assert.ifError(err);
				assert.isFunction(cloneOrPull);
			},
			'and we clone something for the first time': {
				topic: function(cloneOrPull) {
					cloneOrPull('git://github.com/strugee/node-git-clone-or-pull.git', opts, this.callback);
				},
				'it works': function(err) {
					assert.ifError(err);
				},
				'the directory exists': function() {
					// Evil sync thing
					assert.doesNotThrow(function() {
						fs.accessSync(repoPath);
					});
				},
				'the test/ directory exists': function() {
					// Evil sync thing
					assert.doesNotThrow(function() {
						fs.accessSync(path.join(repoPath, 'test'));
					});
				},
				'and we reset to the initial commit': {
					topic: function() {
						smartSpawn('git', ['reset', '--hard', '47e0a188f5fe97642619653d797d5556c292eb7e'], repoPath, this.callback);
					},
					'it works': function(err, stdout) {
						assert.equal(stdout, 'HEAD is now at 47e0a18 Initial commit\n');
					},
					'the test/ directory does not exist': function() {
						// Evil sync thing
						assert.throws(function() {
							fs.accessSync(path.join(repoPath, 'test'));
						});
					},
					'and then we clone or pull again': {
						topic: function() {
							cloneOrPull('git://github.com/strugee/node-git-clone-or-pull.git', opts, this.callback);
						},
						'it works': function(err) {
							assert.ifError(err);
						},
						'the test/ directory exists again': function() {
							// Evil sync thing
							assert.doesNotThrow(function() {
								fs.accessSync(repoPath);
							});
						}
					}
				}
			},
			'and we try to clone or pull a nonexistant repository': {
				topic: function(cloneOrPull) {
					var callback = this.callback;
					cloneOrPull('git://nonexistant.com/repo.git', failOpts, function(err) {
						callback(null, err);
					});
				},
				'it fails': function(err, expectedError) {
					assert.ifError(err);
					assert.isObject(expectedError);
				}
			}
		}
	};
};
