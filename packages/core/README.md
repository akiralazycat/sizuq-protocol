# `@sizuq/protocol` Core

This directory is the canonical destination for the dependency-free Sizuq Protocol v0.1 reference core.

## Migration status

**BLOCKING for release freeze:** implementation source is still canonical in `akiralazycat/sizuq/protocol/packages/core` and must be copied here without semantic changes before `protocol-v0.1-rc1` is tagged.

The existing implementation provides:

- RFC 8785 JCS canonicalization;
- SHA-256 helpers;
- multibase base58btc encoding/decoding;
- Ed25519 Multikey helpers;
- `did:sizuq` parsing and identifier derivation;
- signed operation verification and state derivation;
- rotation/recovery/deactivation writer helpers;
- `sq:` parsing and dereferencing helpers;
- directory transport helpers;
- normative/interoperability vector tests.

## Rule

Normative specifications under `specs/` take precedence over this package. A failing conformance test indicates an implementation or specification-release issue; implementation behavior MUST NOT silently redefine the protocol.

The package SHOULD remain small enough that a second implementation can reproduce the protocol without importing this code.