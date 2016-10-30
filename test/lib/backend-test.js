'use strict';

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    assign = require('lodash.assign'),
    smartSpawn = require('smart-spawn'),
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
			'it works': function(cloneOrPull) {
				assert.isFunction(cloneOrPull);
			},
			'and we clone something for the first time': {
				topic: function(cloneOrPull) {
					cloneOrPull('git://github.com/strugee/node-git-clone-or-pull.git', opts, this.callback);
				},
				'the directory exists': function() {
					fs.access(repoPath, function(err) {
						assert.ifError(err);
					});
				},
				'the test/ directory exists': function() {
					fs.access(path.join(repoPath, 'test'), function(err) {
						assert.ifError(err);
					});
				},
				'and we reset to the initial commit': {
					topic: function() {
						smartSpawn('git', ['reset', '--hard', '47e0a188f5fe97642619653d797d5556c292eb7e'], repoPath, this.callback);
					},
					'it works': function(stdout) {
						assert.equal(stdout, 'HEAD is now at 47e0a18 Initial commit\n');
					},
					'the test/ directory does not exist': function() {
						fs.access(path.join(repoPath, 'test'), function(err) {
							assert(err);
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
							fs.access(repoPath, function(err, stat) {
								assert.ifError(err);
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
				'it fails': function(err) {
					assert(err);
				}
			}
		}
	};
};
