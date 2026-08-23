# Sizuq Protocol

Canonical source repository for the Sizuq Protocol specifications, registration material, conformance vectors, and reference implementations.

## Status

**Editor's Draft / v0.1 release-candidate work.**

Neither `did:sizuq` nor `sq:` is claimed to be externally registered until the relevant registry accepts the submission.

- `did:sizuq` — experimental DID method
- `sq:` — companion resource URI scheme
- `SizuqResourceService` — DID service profile used to dereference `sq:` resources

The deployed documentation and interoperability environment remains available at `https://sizuq.org` while source-of-truth material is migrated into this repository.

## Design boundary

Sizuq Protocol separates cryptographic identity, resource identity, hosting, and presentation.

```text
did:sizuq:<root>          cryptographic identity
        |
        +-- sq:<root>/profile
        +-- sq:<root>/post/<record-key>
        +-- sq:<root>/collection/<record-key>
        |
        +-- DID service discovery
                |
                +-- HTTPS / other conforming resource transport
```

A hosted directory is not cryptographic authority. A conforming resolver validates identifier derivation, signatures, sequence numbers, and the hash-linked operation history independently.

## Repository layout

```text
specs/             normative protocol specifications
contexts/          versioned JSON-LD contexts
namespace/         stable protocol vocabulary definitions
registration/      external-registration release bundles
packages/core/     reference core implementation
implementations/   independent implementation evidence
conformance/       normative and public test vectors
reference-node/    non-normative reference directory node
```

## v0.1 invariants

The v0.1 line fixes the following interoperability choices:

- RFC 8785 JSON Canonicalization Scheme (JCS)
- SHA-256
- multibase base58btc identifiers and digests
- Ed25519 Multikey
- signed `create`, `update`, `recover`, and `deactivate` operations
- hash-linked operation history
- terminal deactivation
- fail-closed handling of conflicting valid successors
- `sq:` roots equal the corresponding `did:sizuq` method-specific identifier
- `sq:` dereferencing through a DID service of type `SizuqResourceService`

Backward-incompatible changes require a new protocol version.

## Registration track

The intended order is:

1. freeze the `v0.1-rc1` repository state;
2. close DID Core security/privacy requirements;
3. publish stable namespace/context resources;
4. request IANA **Provisional** registration for `sq:`;
5. submit `did:sizuq` to the W3C DID Methods collection.

Registration readiness is a technical state, not a marketing label. The repository MUST NOT describe either identifier as registered before acceptance by the corresponding external registry.

## Existing implementation evidence

The earlier implementation currently lives under `akiralazycat/sizuq/protocol` and already provides a dependency-free core, public vectors, a separately written resolver, a persistent reference directory, and reproducible resolve/verify/dereference evidence. Those artifacts are being promoted into this repository rather than re-invented.

Until migration is complete, the deployed `sizuq.org` artifacts remain useful interoperability evidence, but this repository is the intended long-term source of truth for protocol releases.

## Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** are to be interpreted as described in BCP 14 when, and only when, they appear in all capitals.

English is normative for v0.1. Translations are informative.

## Governance and security

See [GOVERNANCE.md](GOVERNANCE.md) and [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).