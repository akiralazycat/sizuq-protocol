# did:sizuq v0.1-rc1 Security and Privacy Profile

Status: **Normative release-candidate supplement**  
Applies to: `did:sizuq` v0.1  
Normative language: BCP 14

This document is read together with the versioned `did:sizuq` specification and closes method-specific security/privacy requirements for registration review.

## 1. Security model

### 1.1 Assets and trust boundaries

Security-sensitive assets include rotation private keys, recovery private keys, exact accepted operation semantics, genesis-to-DID binding, predecessor/successor history, and resolver policy/cached validated state.

A directory node is an availability/distribution service, not a cryptographic trust anchor. A resolver MUST independently validate the genesis-derived DID, every operation signature, every `previous` digest, sequence monotonicity, operation authorization, and deactivation state.

TLS protects transport but does not replace method verification and does not prove control of a DID.

### 1.2 Cryptographic protection

v0.1 uses RFC 8785 JCS, SHA-256, multibase base58btc, and Ed25519 Multikey.

Creation proof covers the JCS canonical form of the complete creation record with `proof` omitted. Later proofs cover the JCS canonical form of the complete operation envelope with `proof` omitted. `previous` binds each accepted record to its predecessor digest.

These mechanisms provide integrity and operation authentication. They do not provide confidentiality.

### 1.3 Secret material

Private rotation/recovery keys, signing seeds, authenticator secrets, and equivalent entropy MUST NOT be transmitted to directory nodes or written into DID operation records.

Published deterministic test seeds MUST be labeled test-only and MUST NOT be reused for real identities.

## 2. Attack analysis

### Eavesdropping

Observers may learn which DIDs are resolved and can observe public records. Clients SHOULD use HTTPS, caches, privacy-preserving network paths, or alternate resolvers where lookup privacy matters.

### Replay and rollback

A directory may replay an older valid history. Resolvers MUST validate the chain and SHOULD retain the highest previously validated sequence for rollback-sensitive DIDs. A lower sequence than remembered state SHOULD be treated as rollback evidence.

### Message insertion

Writable directories may receive arbitrary records. Directories and resolvers MUST reject invalid identifier derivation, signatures, authorization, predecessor links, sequence values, schemas, or post-deactivation operations.

### Deletion and omission

Signatures cannot force an untrusted directory to reveal omitted records. Resolvers SHOULD compare mirrors or retain validated version information and MUST distinguish network failure from `notFound`.

### Modification

Modification of a signed record invalidates its signature. Modification of an earlier record also breaks later predecessor digests. Implementations MUST fail closed.

### Man-in-the-middle

MITM attackers can block traffic, substitute invalid history, or present stale valid history. HTTPS SHOULD be used, but cryptographic chain verification remains mandatory independently of TLS.

### Denial of service and amplification

Implementations SHOULD bound body sizes, history length, signature-verification work, redirects, request duration, response sizes, and write rates. A directory MAY throttle abusive writes without changing the meaning of accepted records.

### Forks and equivocation

If more than one valid successor exists for a predecessor and a single accepted successor cannot be established from the same append-log view, the resolver MUST return `conflictingHistory` rather than choosing silently.

A directory may equivocate by showing different valid branches to different clients. Mirror comparison and remembered validated state are RECOMMENDED. Recovery is the explicit controller mechanism for restoring one intended history.

## 3. Authorization and lifecycle

- `create` MUST be signed by a rotation key listed in genesis;
- `update` MUST be signed by a current rotation key;
- `recover` MUST be signed by a current recovery key;
- `deactivate` MUST be signed by a current recovery key;
- ordinary `update` MUST NOT modify recovery keys;
- deactivation is terminal.

Recovery material SHOULD be isolated from routine rotation keys and SHOULD be offline or hardware-backed where feasible.

Replacing verification or rotation keys removes them from current state but not from historical visibility. Historical signatures remain historically valid for periods in which those keys were authorized.

The method-specific identifier is derived from the canonical genesis payload. There is no administrative reassignment operation. A deactivated DID MUST NOT be reassigned to another subject by a directory operator.

Materialized DID Documents are not separately authoritative; authenticity derives from the verified operation history.

`SizuqResourceService` is resource dereferencing, not authentication or authorization. Successful access to an endpoint MUST NOT be treated as proof of DID control.

## 4. Residual risks

Residual risks include:

- compromise of authorized private keys producing valid malicious operations;
- compromised/coerced directories hiding fresh records;
- stale-but-valid state accepted by clients that remember no prior state;
- implementation defects in canonicalization, encoding, hashing, signature verification, schema validation, or state transitions;
- future cryptanalytic failure;
- compromised resource endpoints returning malicious content;
- false external claims that cryptographic control proves legal or physical identity.

Algorithm replacement requires an explicit protocol version. Existing v0.1 identifiers MUST NOT be silently reinterpreted.

## 5. Privacy profile

Public operation histories are durable, replicable, and intentionally verifiable. Controllers MUST assume that public operation data can remain observable after later updates or deactivation.

### Surveillance and correlation

Stable DIDs, services, lookups, and repeated `sq:` references can expose activity and relationship patterns. Applications SHOULD support pairwise/application-scoped identifiers where global correlation is unnecessary. Reuse of keys, hostnames, paths, and distinctive configurations can also link otherwise separate DIDs.

### Stored data and disclosure

Public operation data is not confidential and MUST NOT contain secrets. Operators SHOULD minimize private request logs, IP metadata, abuse metadata, and unpublished account mappings.

Verification methods, service endpoints, history, timing, and recovery events can reveal operational relationships. Personal profile content SHOULD live outside the operation log.

### Misattribution

A DID proves only method-defined cryptographic control. It does not prove legal name, employment, ownership, age, location, or other real-world attributes without an external trust/credential process.

### Secondary use

Mirrored public histories can later be indexed, classified, or combined for unrelated purposes. Implementations SHOULD minimize public metadata and avoid analytics identifiers or sensitive classifications in DID Documents.

### Exclusion

Applications SHOULD avoid requiring one global DID, one hosted directory, one device class, one recovery mechanism, or a public service endpoint when the use case does not require those constraints.

## 6. Registration closure

The security/privacy gate is closed only while:

1. versioned specification and supplement remain durable;
2. implementation behavior matches authorization/validation rules;
3. the DID Core closure matrix has no blocking gaps;
4. conformance vectors reproduce the frozen algorithm behavior;
5. `SizuqResourceService` remains defined by the stable v0.1 namespace/context.