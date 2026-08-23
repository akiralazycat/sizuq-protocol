# Protocol v0.1 Registration Readiness

Status: **Release Candidate (`v0.1-rc1`)**  
Change controller: Sizuq Protocol Editors  
Normative language: BCP 14

This directory freezes the registration-facing contract for Sizuq Protocol v0.1 before external namespace submissions.

## Registration order

1. freeze `v0.1-rc1` semantics and durable references;
2. close DID Core security/privacy requirements;
3. publish the `SizuqResourceService` namespace and JSON-LD context;
4. request IANA Provisional registration for `sq:`;
5. submit `did:sizuq` to the W3C DID Methods collection.

No registry application should be sent while an item marked **BLOCKING** in this bundle remains open.

## Frozen v0.1 contract

The following behavior is immutable for this release-candidate line:

- DID method name: `sizuq`;
- DID identifier derivation: multibase base58btc of `SHA-256(JCS(genesisPayload))`;
- RFC 8785 JCS canonicalization;
- SHA-256 digest;
- Ed25519 Multikey signatures;
- signed `create`, `update`, `recover`, and `deactivate` records in a hash-linked sequence;
- current rotation key authorizes ordinary updates;
- current recovery key authorizes recovery and deactivation;
- ordinary update cannot replace recovery keys;
- deactivation is terminal;
- unresolved valid forks fail closed as `conflictingHistory`;
- directory responses are non-authoritative until independently verified;
- `sq:` roots equal the `did:sizuq` v0.1 method-specific identifier;
- an `sq:` path is dereferenced through `SizuqResourceService`;
- HTTP dereferencing or redirects do not replace the canonical `sq:` identifier.

A backward-incompatible change requires a new protocol version.

## Release files

- `spec-manifest.json` — exact source paths/blob identities and algorithm choices;
- `did-sizuq-security-privacy.md` — normative security/privacy supplement;
- `did-core-security-privacy-matrix.md` — DID Core closure matrix;
- `sizuq-resource-service.md` — normative service profile;
- `../../contexts/sizuq/v0.1.jsonld` — versioned JSON-LD context;
- `../../namespace/v0.1/` — stable namespace definition.

Primary specifications:

- `../../specs/did-sizuq/v0.1/`
- `../../specs/sq-uri/v0.1/`

## Freeze policy

The live `main` branch may continue editorial development. A registration submission SHOULD cite a release tag or immutable commit together with the durable `sizuq.org` publication URLs.

After the release candidate is frozen, changes that alter interoperable behavior move to a later release candidate. Editorial errata must identify the affected release and must not silently rewrite historical semantics.

## `sq:` IANA gate

Before submission:

- confirm `sq` remains unassigned in the IANA URI Schemes registry;
- request **Provisional** status;
- provide scheme name, status, applications/protocols, contact, change controller, and reference information consistent with RFC 7595;
- cite the immutable repository release and durable public specification;
- ensure syntax, semantics, security, privacy, and interoperability sections remain mutually consistent.

## `did:sizuq` W3C gate

Before submission:

- all rows in the DID Core matrix are `CLOSED` or explicitly justified `N/A / CLOSED`;
- the method specification defines create, resolution, update, recovery, and deactivation behavior;
- public specification, implementation, vectors, and evidence agree on v0.1 bytes and state semantics;
- `SizuqResourceService` has a resolvable namespace/context;
- the registry entry uses `sizuq`, a durable spec URL, and maintained contact information.

## Status language

Registration readiness is not registration. This repository MUST NOT claim that `sq:` is IANA-registered or that `did:sizuq` is W3C-listed until the corresponding registry records the entry.