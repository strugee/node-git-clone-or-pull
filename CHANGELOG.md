# `git-clone-or-pull` changelog

`git-clone-or-pull` follows [Semantic Versioning][1].

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
