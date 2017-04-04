'use strict';

var assert = require('chai').assert,
    path = require('path'),
    fs = require('fs'),
    assign = require('lodash.assign'),
    smartSpawn = require('smart-spawn'),
    rimraf = require('rimraf'),
    repoPath = path.join(process.cwd(), 'node-git-clone-or-pull'),
    failRepoPath = path.join(process.cwd(), 'nonexistant');

module.exports = function(options) {
    var opts = assign({}, options, {path: repoPath}),
        failOpts = assign({}, options, {path: failRepoPath});

    describe('git-clone-or-pull - ' + options.implementation, function() {
        var cloneOrPull;

        before(function() {
            cloneOrPull = require('../../index.js');
        });

        it('should be required correctly', function() {
            assert.isFunction(cloneOrPull);
        });

        context('clone something for the first time', function() {
            before(function(done) {
                cloneOrPull('git://github.com/strugee/node-git-clone-or-pull.git', opts, done);
            });

            after(function(done) {
                rimraf(repoPath, done);
            });

            it('repo directory should exist', function(done) {
                fs.access(repoPath, function(err) {
                    assert.ifError(err);
                    done();
                });
            });
            it('test/ directory should exist', function(done) {
                fs.access(path.join(repoPath, 'test'), function(err) {
                    assert.ifError(err);
                    done();
                });
            });
            context('reset to the initial commit', function() {
                var gitResetStdout;
                before(function(done) {
                    smartSpawn('git', ['reset', '--hard', '47e0a188f5fe97642619653d797d5556c292eb7e'], repoPath, function(err, stdout) {
                        gitResetStdout = stdout;
                        done();
                    });
                });
                it('should output correct git status in stdout', function() {
                    assert.equal(gitResetStdout, 'HEAD is now at 47e0a18 Initial commit\n');
                });
                it('the test/ directory does not exist', function(done) {
                    fs.access(path.join(repoPath, 'test'), function(err) {
                        assert(err);
                        done();
                    });
                });
                context('clone or pull again', function() {
                    var cloneOrPullErr;
                    before(function(done) {
                        cloneOrPull('git://github.com/strugee/node-git-clone-or-pull.git', opts, function(err, stdout) {
                            cloneOrPullErr = err;
                            done();
                        });
                    });
                    it('does not error', function() {
                        assert.ifError(cloneOrPullErr);
                    });
                    it('the test/ directory exists again', function() {
                        fs.access(repoPath, function(err, stat) {
                            assert.ifError(err);
                        });
                    });
                });
            });
        });
        context('clone a repo and specify the branch', function() {
            before(function(done) {
                cloneOrPull('git://github.com/strugee/strugee.github.com.git', assign({}, options, {branch: 'src', path: repoPath}), done);
            });

            after(function(done) {
                rimraf(repoPath, done);
            });

            it('the directory exists', function(done) {
                fs.access(repoPath, function(err) {
                    assert.ifError(err);
                    done();
                });
            });
            it('src/ directory should exist', function(done) {
                fs.access(path.join(repoPath, 'src'), function(err) {
                    assert.ifError(err);
                    done();
                });
            });
        });
        context('clone or pull a nonexistant repository', function() {
            after(function(done) {
                rimraf(failRepoPath, done);
            });

            it('should fail', function(done) {
                cloneOrPull('git://nonexistant.com/repo.git', failOpts, function(err) {
                    assert.isDefined(err);
                    done();
                });
            });
        });
    });

    return;
};
