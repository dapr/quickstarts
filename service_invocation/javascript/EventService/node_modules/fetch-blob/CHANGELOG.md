Changelog
=========

## v3.1.2

- Improved typing
- Fixed a bug where position in iterator did not increase

## v3.1.0
- started to use real whatwg streams
- degraded fs/promise to fs.promise to support node v12
- degraded optional changing to support node v12

## v3.0.0
- Changed WeakMap for private field (require node 12)
- Switch to ESM
- blob.stream() return a subset of whatwg stream which is the async iterable part
  (it no longer return a node stream)
- Reduced the dependency of Buffer by changing to global TextEncoder/Decoder (require node 11)
- Disabled xo since it could understand private fields (#)
- No longer transform the type to lowercase (https://github.com/w3c/FileAPI/issues/43)
  This is more loose than strict, keys should be lowercased, but values should not.
  It would require a more proper mime type parser - so we just made it loose.
- index.js and file.js can now be imported by browser & deno since it no longer depends on any
  core node features (but why would you?)
- Implemented a File class

## v2.1.2
- Fixed a bug where `start` in BlobDataItem was undefined (#85)

## v2.1.1
- Add nullish values checking in Symbol.hasInstance (#82)
- Add generated typings for from.js file (#80)
- Updated dev dependencies

## v2.1.0
- Fix: .slice has an implementation bug (#54).
- Added blob backed up by filesystem (#55)

## v2.0.1

- Fix: remove upper bound for node engine semver (#49).

## v2.0.0

> Note: This release was previously published as `1.0.7`, but as it contains breaking changes, we renamed it to `2.0.0`.

- **Breaking:** minimum supported Node.js version is now 10.17.
- **Breaking:** `buffer` option has been removed.
- Enhance: create TypeScript declarations from JSDoc (#45).
- Enhance: operate on blob parts (byte sequence) (#44).
- Enhance: use a `WeakMap` for private properties (#42) .
- Other: update formatting.

## v1.0.6

- Enhance: use upstream Blob directly in typings (#38)
- Other: update dependencies

## v1.0.5

- Other: no change to code, update dev dependency to address vulnerability reports

## v1.0.4

- Other: general code rewrite to pass linting, prepare for `node-fetch` release v3

## v1.0.3

- Fix: package.json export `blob.js` properly now

## v1.0.2

- Other: fix test integration

## v1.0.1

- Other: readme update

## v1.0.0

- Major: initial release
