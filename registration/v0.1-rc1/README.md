# Protocol v0.1 Registration Readiness

Status: **Release Candidate (`v0.1-rc1`) / verification pending**  
Change controller: Sizuq Protocol Editors  
Normative language: BCP 14

This directory freezes the registration-facing contract for Sizuq Protocol v0.1 before external namespace submissions.

## Registration order

1. run the authoritative repository-local release gate against the exact candidate commit;
2. rerun the separately written resolver against release-candidate evidence;
3. verify durable `sizuq.org` specification/context/namespace output;
4. freeze an immutable `protocol-v0.1-rc1` tag;
5. recheck live registries and submission policies;
6. request IANA Provisional registration for `sq:`;
7. submit `did:sizuq` to the W3C DID Methods collection.

No registry application should be sent while an item marked **BLOCKING** in the manifest remains open.

GitHub Actions is supplementary automation, not a release prerequisite. If Actions is unavailable, the exact release commit is validated with the local procedure in `local-verification.md` and its evidence is recorded before the tag is frozen.

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
- HTTP dereferencing or redirects do not replace the canonical `sq:` identifier;
- the v0.1 JSON-LD context is versioned, not date-stamped, and protected with `@protected`.

A backward-incompatible change requires a new protocol version.

## Release files

- `spec-manifest.json` — source paths/blob identities, algorithm choices, evidence, and remaining blocking checks;
- `local-verification.md` — authoritative Actions-independent release verification procedure;
- `registry-preflight-2026-08-23.md` — dated external-registry snapshot, never a substitute for submission-day verification;
- `iana-sq-provisional.md` — IANA Provisional registration draft;
- `w3c-did-method-submission.md` — W3C DID Methods submission draft/checklist;
- `did-sizuq-security-privacy.md` — normative security/privacy supplement;
- `did-core-security-privacy-matrix.md` — DID Core closure matrix;
- `sizuq-resource-service.md` — normative service profile;
- `../../contexts/sizuq/v0.1.jsonld` — versioned protected JSON-LD context;
- `../../namespace/v0.1/` — stable namespace definition.

Primary specifications:

- `../../specs/did-sizuq/v0.1/`
- `../../specs/sq-uri/v0.1/`

Implementation evidence:

- `../../packages/core/`;
- `../../implementations/independent-resolver/`;
- `../../conformance/`;
- `../../reference-node/`.

## Authoritative verification gate

From a clean checkout of the exact candidate commit, use Node.js 22 and run:

```sh
npm install --ignore-scripts
npm run verify:local
npm run test:independent:live
```

Equivalently, after dependencies are installed, `npm run verify:release` runs both verification stages. Record the full commit SHA, runtime versions, UTC timestamp, local result, and independent resolver result. A GitHub Actions result may supplement this evidence but is not required.

## Freeze policy

The live `main` branch may continue editorial development. A registration submission SHOULD cite a release tag or immutable commit together with the durable `sizuq.org` publication URLs.

After the release candidate is frozen, changes that alter interoperable behavior move to a later release candidate. Editorial errata must identify the affected release and must not silently rewrite historical semantics.

## `sq:` IANA gate

Before submission:

- confirm `sq` remains unassigned in the IANA URI Schemes registry;
- request **Provisional** status;
- provide scheme name, status, applications/protocols, contact, change controller, and reference information consistent with RFC 7595;
- demonstrate that intended use is not limited to a private environment inside one organization;
- cite the immutable repository release and durable public specification;
- ensure syntax, semantics, security, privacy, and interoperability sections remain mutually consistent.

## `did:sizuq` W3C gate

Before submission:

- all rows in the DID Core matrix are `CLOSED` or explicitly justified `N/A / CLOSED`;
- the method specification defines create, resolution, update, recovery, and deactivation behavior;
- public specification, implementation, vectors, and evidence agree on v0.1 bytes and state semantics;
- `SizuqResourceService` has a persistent human-readable namespace and protected, versioned JSON-LD context;
- the context actually served at the durable URL matches the repository artifact;
- the registry entry uses `sizuq`, a durable defining-specification URL, and maintained contact information;
- current DID Extensions legal/security/privacy and JSON-LD registration policies are rechecked.

## Status language

Registration readiness is not registration. This repository MUST NOT claim that `sq:` is IANA-registered or that `did:sizuq` is W3C-listed until the corresponding registry records the entry.
