/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var spawnWithSanityChecks = require('smart-spawn');

var gitBinary = childProcess.spawnSync('git', ['--version']).status === 0;

var NodeGit;

try {
	NodeGit = require('nodegit');
} catch (e) {
	// NodeGit not supported on this platform
	NodeGit = null;
}

function withNodeGit(url, opts, callback) {
	fs.access(opts.path, function(err) {
		if (err) {
			// Not yet cloned
			NodeGit.Clone(url, opts.path)
				.then(function(repo) {
					// We don't want to directly pass `callback` because then the consumer gets a copy
					// of the repository object, which is public API
					callback();
				})
				.catch(callback);
		} else {
			// Cloned already; we need to pull
			var repo;
			NodeGit.Repository.open(opts.path).then(function(repository) {
				repo = repository;
				return repo;
			}).then(function() {
				return repo.fetchAll();
			}).then(function() {
				return repo.mergeBranches('master', 'origin/master');
			}).then(function() {
				callback();
			}).catch(callback);
		}
	});
}

function withGitSubprocess(url, opts, callback) {
	fs.access(opts.path, function(err) {
		// Chop off the last path element to get the proper cwd for git subprocesses
		var targetDir = opts.path.split(path.sep).slice(0, -1).join(path.sep);

		if (err) {
			// Not yet cloned
			spawnWithSanityChecks('git', ['clone', '--quiet', url, opts.path], targetDir, function(err, stdout) {
				// Pass undefined, not null
				if (!err) err = undefined;

				callback(err);
			});
		} else {
			// Cloned already; we need to pull

			// Fetch
			spawnWithSanityChecks('git', ['fetch','--quiet', '--all'], opts.path, function(err, stdout) {
				if (err) {
					callback(err);
					return;
				}

				// Checkout
				spawnWithSanityChecks('git', ['checkout','--quiet', 'master'], opts.path, function(err, stdout) {
					if (err) {
						callback(err);
						return;
					}

					// Merge
					spawnWithSanityChecks('git', ['merge','--quiet', '--ff-only', 'origin/master'], opts.path, function(err, stdout) {
						if (err) {
							callback(err);
							return;
						}

						callback();
					});
				});
			});
		}
	});
}

function gitCloneOrPull(url, opts, callback) {
	if (typeof opts === 'string') opts = { path: opts };

	// If a specific implementation has been requested, abort if it's unavailable
	// Otherwise, choose a sensible default.
	if (opts.implementation) {
		if (opts.implementation === 'nodegit' && !NodeGit) return callback(new Error('NodeGit could not be loaded, so implementation "nodegit" is unavailable'));
		if (opts.implementation === 'subprocess' && !gitBinary) return callback(new Error('Running `git --version` failed, so implementation "subprocess" is unavailable'));
	} else {
		if (NodeGit) {
			opts.implementation = 'nodegit';
		} else if (gitBinary) {
			opts.implementation = 'subprocess';
		} else {
			callback(new Error('No suitable implementation'));
		}
	}

	switch (opts.implementation) {
	case 'nodegit':
		withNodeGit(url, opts, callback);
		break;
	case 'subprocess':
		withGitSubprocess(url, opts, callback);
		break;
	default:
		callback(new Error('Implementation "' + opts.implementation + '" not recognized'));
	}
}

module.exports = gitCloneOrPull;
