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
var spawn = require('child_process').spawn;
var concatStream = require('concat-stream');
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
				.catch(callback)
				.then(function(repo) {
					// We don't want to directly pass `callback` because then the consumer gets a copy
					// of the repository object, which is public API
					callback();
				});
		} else {
			// Cloned already; we need to pull
			var repo;
			NodeGit.Repository.open(opts.path).then(function(repository) {
				repo = repository;
				return repo.getRemote('origin');
			}).then(function(remote) {
				// Sync :/
				if (remote.url() === url) {
					return repo;
				} else {
					throw new Error('On-disk repository\'s origin remote does not have the specified URL set');
				}
			}).then(function() {
				return repo.fetchAll();
			}).then(function() {
				return repo.mergeBranches('master', 'origin/master');
			}).then(function() {
				callback();
			}).catch(callback);
		}
	});
};

function spawnWithSanityChecks(name, args, callback, exitCallback) {
	var process = spawn(name, args);

	var callbackFired = false;

	// Handle spawn errors
	process.on('error', function(err) {
		if (callbackFired) return;
		callbackFired = true;
		callback(err);
	});

	// Capture stderr in case we need it for an Error object
	var stderr;
	process.stderr.pipe(concatStream(function(buf) {
		stderr = buf.toString();
	}));

	// Capture stdout
	var stdout;
	process.stdout.pipe(concatStream(function(buf) {
		stdout = buf.toString();
	}));

	process.on('exit', function(code, signal) {
		// Handle non-zero exits
		if (code !== 0) {
			if (callbackFired) return;
			callbackFired = true;
			callback(new Error('Process `' + name + ' ' + args.join(' ') + '` exited with non-zero exit code; stderr is:\n' + stderr));
			return;
		}

		exitCallback(stdout);
	});

	return process;
}

function withGitSubprocess(url, opts, callback) {
	fs.access(opts.path, function(err) {
		if (err) {
			// Not yet cloned
			spawnWithSanityChecks('git', ['clone', '--quiet', url, opts.path], callback, function(stdout) {
				callback();
			});
		} else {
			// TODO: change cwd
			// Cloned already; we need to pull

			// Check remote url
			spawnWithSanityChecks('git', ['remote', 'get-url', 'origin'], callback, function(remoteUrl) {
				if (remoteUrl !== url) {
					throw new Error('On-disk repository\'s origin remote does not have the specified URL set');
				}

				// Fetch
				spawnWithSanityChecks('git', ['fetch','--quiet', '--all'], callback, function(stdout) {
					// Checkout
					spawnWithSanityChecks('git', ['checkout','--quiet', 'master'], callback, function(stdout) {
						// Merge
						spawnWithSanityChecks('git', ['merge','--quiet', '--ff-only', 'origin/master'], callback, function(stdout) {
							callback();
						});
					});
				});
			});
		}
	});
}

function gitCloneOrPull(url, opts, callback) {
	if (typeof opts === 'string') opts = { path: opts };

	if (!opts.implementation) {
		if (NodeGit) {
			opts.implementation = 'nodegit';
		} else {
			opts.implementation = 'subprocess';
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
