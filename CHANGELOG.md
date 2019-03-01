# `git-clone-or-pull` changelog

`git-clone-or-pull` follows [Semantic Versioning][1].

## 4.0.0 - future

### Breaking

* Drop Node 4

### Security

* Pull in a newer NodeGit to [fix](https://github.com/nodegit/nodegit/blob/master/CHANGELOG.md#v0222-2018-07-10) (pretty old) security vulnerabilities

## 3.1.1 - 2017-11-15

### Fixed

* JSHint is now marked as a development dependency, not a production dependency (#22)

## 3.1.0 - 2017-09-17

### Improved

* Upgrade to NodeGit@0.20

## 3.0.0 - 2017-08-10

### Improved

* Upgrade to NodeGit@0.19, fixing some failures with Node 7

### Breaking

* Drop support for Node 5 due to NodeGit doing the same
* Stop pretending we support Node 8 when NodeGit upstream doesn't support Node 8

## 2.2.0 - 2017-04-03

### Improved

* Support specifying which branch to use

## 2.1.0 - 2016-11-09

### Changed

* Upgrade to smart-spawn@2

## 2.0.1 - 2016-10-29

### Fixed

* The NodeGit implementation now properly passes clone errors to the callback

## 2.0.0 - 2016-10-29

### Breaking

* Node 0.10 support has been dropped
* Pulling no longer double-checks that the on-disk `origin` remote URL matches the provided URL

## 1.1.2 - 2016-09-07

### Fixed

* Support Node 0.10 by not using `require('child_process').spawnSync`

## 1.1.1 - 2016-09-07

### Fixed

* _Actually_ mark NodeGit as optional in `package.json`

## 1.1.0 - 2016-09-06

### Added

* New `git` subprocess-based implementation which is used automatically if NodeGit can't be loaded

### Changed

* NodeGit is now an optional dependency
* Advanced options can be specified by passing an object instead of a pathname

### Fixed

* The passed `callback` is now called by the NodeGit implementation if the repo hasn't been cloned yet

## 1.0.0 - 2016-07-14

### Added

* Initial release

 [1]: http://semver.org/
