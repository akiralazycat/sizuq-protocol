# Independent Resolver

This directory is reserved for a separately written Sizuq Protocol v0.1 resolver used as implementation-independence evidence.

## Migration status

**BLOCKING for release freeze:** the current dependency-free ES module remains in `akiralazycat/sizuq/protocol/public/implementations/sizuq-independent-resolver-v0.1.mjs` and must be promoted here together with its conformance runner/report.

The resolver MUST NOT import `@sizuq/protocol` or share protocol implementation code with `packages/core`.

Passing the same normative vectors demonstrates implementation independence inside the Sizuq project. It MUST NOT be described as an unaffiliated third-party implementation unless an unaffiliated maintainer independently implements and operates a conforming resolver.