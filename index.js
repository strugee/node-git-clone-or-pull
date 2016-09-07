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
var concatStream = require('concat-stream');

var gitBinary = null;
var gitBinaryProc = childProcess.spawn('git', ['--version']);
gitBinaryProc.on('exit', function(code, signal) {
	gitBinary = code === 0;
});

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

function spawnWithSanityChecks(name, args, targetCwd, userCallback, exitCallback) {
	// Done here so it gets the right scope
	function maybeFireCallback() {
		// This function is called in any place where we might have completed a task that allows us to fire

		if (callbackFired || callbackFiredErr) return;

		// If everything is ready, we *should* fire the callback, and it hasn't already been fired, then do so
		if (stdoutReady && stderrReady && wantCallback && !callbackFired) {
			callbackFired = true;
			exitCallback(stdout);
		}

		// Ditto for the callback with an error argument
		if (stdoutReady && stderrReady && wantCallbackError && !callbackFiredErr) {
			callbackFiredErr = true;
			userCallback(callbackErr);
		}
	}

	var process = childProcess.spawn(name, args, { cwd: targetCwd });

	// We need all this to synchronize callbacks with when stuff is done buffering, execing, etc.
	var callbackFired = false;
	var callbackFiredErr = false;
	var wantCallback = false;
	var wantCallbackError = false;
	var callbackErr;
	var stdoutReady = false;
	var stderrReady = false;

	// Handle spawn errors
	process.on('error', function(err) {
		callbackErr = err;
		wantCallbackError = true;

		maybeFireCallback();
	});

	// Capture stderr in case we need it for an Error object
	var stderr;
	process.stderr.pipe(concatStream(function(buf) {
		stderr = buf.toString();
		stderrReady = true;

		maybeFireCallback();
	}));

	// Capture stdout
	var stdout;
	process.stdout.pipe(concatStream(function(buf) {
		stdout = buf.toString();
		stdoutReady = true;

		maybeFireCallback();
	}));

	process.on('exit', function(code, signal) {
		// Handle non-zero exits
		if (code !== 0) {
			callbackErr = new Error('Process `' + name + ' ' + args.join(' ') + '` exited with non-zero exit code; stderr is:\n' + stderr);
			wantCallbackError = true;

			maybeFireCallback();

			return;
		}

		wantCallback = true;
		maybeFireCallback();
	});

	return process;
}

function withGitSubprocess(url, opts, callback) {
	fs.access(opts.path, function(err) {
		// Chop off the last path element to get the proper cwd for git subprocesses
		var targetDir = opts.path.split(path.sep).slice(0, -1).join(path.sep);

		if (err) {
			// Not yet cloned
			spawnWithSanityChecks('git', ['clone', '--quiet', url, opts.path], targetDir, callback, function(stdout) {
				callback();
			});
		} else {
			// Cloned already; we need to pull

			// Check remote url
			spawnWithSanityChecks('git', ['remote', 'get-url', 'origin'], opts.path, callback, function(remoteUrl) {
				// Take out the trailing newline
				remoteUrl = remoteUrl.slice(0, -1);

				if (remoteUrl !== url) {
					throw new Error('On-disk repository\'s origin remote does not have the specified URL set');
				}

				// Fetch
				spawnWithSanityChecks('git', ['fetch','--quiet', '--all'], opts.path, callback, function(stdout) {
					// Checkout
					spawnWithSanityChecks('git', ['checkout','--quiet', 'master'], opts.path, callback, function(stdout) {
						// Merge
						spawnWithSanityChecks('git', ['merge','--quiet', '--ff-only', 'origin/master'], opts.path, callback, function(stdout) {
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
