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
var NodeGit = require('nodegit');

function withNodeGit(url, opts, callback) {
	fs.access(opts.path, function(err) {
		if (err) {
			// Not yet cloned
			NodeGit.Clone(url, opts.path);
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

function gitCloneOrPull(url, opts, callback) {
	if (typeof opts === 'string') opts = { path: opts };

	if (!opts.implementation) {
		opts.implementation = 'nodegit';
	}

	switch (opts.implementation) {
	case 'nodegit':
		withNodeGit(url, opts, callback);
		break;
	default:
		callback(new Error('Implementation "' + opts.implementation + '" not recognized'));
	}
}

module.exports = gitCloneOrPull;
