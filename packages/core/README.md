# `@sizuq/protocol` Core

This directory contains the dependency-free Sizuq Protocol v0.1 reference core promoted from the original `akiralazycat/sizuq/protocol/packages/core` implementation.

## Status

**Core source migration complete.**

The package contains:

- RFC 8785 JCS canonicalization;
- SHA-256 helpers;
- multibase base58btc encoding/decoding;
- Ed25519 Multikey helpers;
- `did:sizuq` parsing and identifier derivation;
- signed operation verification and state derivation;
- rotation/recovery/deactivation writer helpers;
- `sq:` parsing and dereferencing helpers;
- directory transport helpers;
- fixed v0.1 and public interoperability fixtures;
- interoperability tests.

The next release-freeze gate is to run the migrated implementation from this repository against the frozen vectors and compare its outputs with the separately written resolver.

## Rule

Normative specifications under `specs/` take precedence over this package. A failing conformance test indicates an implementation or specification-release issue; implementation behavior MUST NOT silently redefine the protocol.

The package SHOULD remain small enough that a second implementation can reproduce the protocol without importing this code.