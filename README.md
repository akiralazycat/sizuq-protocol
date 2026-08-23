# Sizuq Protocol

Canonical source repository for the Sizuq Protocol specifications, registration material, conformance vectors, and reference implementations.

## Status

**Editor's Draft / v0.1-rc1 verification phase.**

The specification, core implementation, separately written resolver, conformance vectors, namespace/context material, registration bundle, and portable reference-node persistence contract are now represented in this repository.

Neither `did:sizuq` nor `sq:` is claimed to be externally registered until the relevant registry accepts the submission.

- `did:sizuq` — experimental DID method
- `sq:` — companion resource URI scheme
- `SizuqResourceService` — DID service profile used to dereference `sq:` resources

The deployed documentation and interoperability environment remains available at `https://sizuq.org`. This repository is the source of truth for protocol release work; the deployed site remains the durable publication and live interoperability surface.

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

## Verification

The repository contains standalone TypeScript verification tooling:

```bash
npm install
npm run typecheck
npm test
```

`npm test` verifies the migrated core against repository-local DID, lifecycle, and `sq:` conformance vectors as well as the public interoperability fixture.

The separately written resolver can also be rerun against the live `sizuq.org` evidence:

```bash
npm run test:independent:live
```

The live test is interoperability evidence, not a prerequisite for local parsing/cryptographic correctness and not a security certification.

## Registration track

The release sequence is:

1. run repository-local typecheck and conformance tests on the final release commit;
2. rerun the separately written resolver against the final v0.1-rc1 artifacts;
3. verify the durable `sizuq.org` specification/context/namespace publication;
4. freeze an immutable `protocol-v0.1-rc1` release tag;
5. recheck external registries immediately before submission;
6. request IANA **Provisional** registration for `sq:`;
7. submit `did:sizuq` to the W3C DID Methods collection.

Detailed gates are recorded in `registration/v0.1-rc1/spec-manifest.json`.

Registration readiness is a technical state, not a marketing label. The repository MUST NOT describe either identifier as registered before acceptance by the corresponding external registry.

## Implementation evidence

`packages/core/` contains the promoted dependency-free reference implementation. `implementations/independent-resolver/` contains a separately written resolver that deliberately imports no core implementation code. `conformance/` includes the normative creation vector, `sq:` syntax cases, public immutable evidence, a full create → rotate → recover → deactivate lifecycle, and the historical independent-resolver report.

The separately written resolver is implementation-independent within the Sizuq project; it is not described as an unaffiliated third-party implementation.

## Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** are to be interpreted as described in BCP 14 when, and only when, they appear in all capitals.

English is normative for v0.1. Translations are informative.

## Governance and security

See [GOVERNANCE.md](GOVERNANCE.md) and [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).