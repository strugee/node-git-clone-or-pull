var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    assign = require('lodash.assign'),
    repoPath = path.join(process.cwd(), 'node-git-clone-or-pull');

module.exports = function(options) {
	return {
		"When we require the module": {
			topic: function() {
				return require('../../index.js');
			},
			"it works": function(cloneOrPull) {
				assert.isFunction(cloneOrPull);
			},
			"and we clone something for the first time": {
				topic: function(cloneOrPull) {
					cloneOrPull('git://github.com/strugee/node-git-clone-or-pull.git', assign(options, {path: repoPath}), this.callback);
				},
				"it works": function(err) {
					assert.ifError(err);
				},
				"the directory exists": function() {
					fs.stat(repoPath, function(err, stat) {
						assert.ifError(err);
					});
				}
			}
		}
	};
};
