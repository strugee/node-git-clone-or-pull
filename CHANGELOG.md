# `git-clone-or-pull` changelog

`git-clone-or-pull` follows [Semantic Versioning][1].

## 1.1.0 - Future

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
