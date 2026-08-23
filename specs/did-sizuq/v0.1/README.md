# did:sizuq Method Specification v0.1

Status: **Editor's Draft / registration-facing v0.1 candidate**  
Normative language: English, BCP 14

## 1. Abstract

`did:sizuq` is a self-certifying DID method whose current state is derived from a signed, hash-linked operation history. A directory stores and serves operations but is not itself cryptographic authority. A conforming resolver independently validates the genesis-derived identifier and every state transition.

This document does not claim that `did:sizuq` is listed by W3C until the relevant DID Methods submission is accepted.

## 2. Method syntax

The method name is exactly `sizuq`.

```abnf
did-sizuq          = "did:sizuq:" method-specific-id
method-specific-id = "z" 1*base58btc-char
base58btc-char     = %x31-39 / %x41-48 / %x4A-4E / %x50-5A / %x61-6B / %x6D-7A
```

The decoded method-specific identifier payload MUST be exactly 32 bytes. It is the SHA-256 digest of the RFC 8785 JCS canonical form of the genesis payload, encoded as multibase base58btc.

Percent-encoding is not permitted inside the v0.1 method-specific identifier.

## 3. Cryptographic profile

v0.1 fixes:

- canonicalization: RFC 8785 JCS;
- digest: SHA-256;
- binary-to-text encoding: multibase base58btc;
- signature suite: Ed25519 Multikey.

Implementations MUST NOT silently substitute algorithms when interpreting a v0.1 DID or operation history.

## 4. Genesis payload

A v0.1 genesis payload has the following semantic form:

```json
{
  "type": "create",
  "version": 1,
  "rotationKeys": ["z..."],
  "recoveryKeys": ["z..."],
  "verificationMethods": [
    {
      "id": "#auth-1",
      "type": "Multikey",
      "publicKeyMultibase": "z...",
      "purposes": ["authentication", "assertionMethod"]
    }
  ],
  "services": []
}
```

At least one rotation key and one recovery key are REQUIRED.

The DID is computed as:

```text
method-specific-id = multibase-base58btc(SHA-256(JCS(genesisPayload)))
did = "did:sizuq:" + method-specific-id
```

## 5. Creation record

The sequence-0 creation record contains the DID, sequence number, genesis payload, and a proof.

The proof MUST be produced by one of the genesis rotation keys over the JCS canonical form of the creation record with the `proof` member omitted.

A directory MUST reject a creation record if the DID does not equal the identifier derived from the submitted genesis payload or if the proof is invalid.

## 6. Operation envelope

Subsequent records have the semantic form:

```json
{
  "did": "did:sizuq:z...",
  "sequence": 1,
  "previous": "z...",
  "timestamp": "2026-08-23T00:00:00Z",
  "operation": { "type": "update" },
  "proof": {
    "key": "z...",
    "signatureMultibase": "z..."
  }
}
```

`previous` MUST equal the multibase base58btc encoding of SHA-256 over the JCS canonical form of the complete previously accepted record.

`sequence` MUST equal the predecessor sequence plus one. `timestamp` MUST be RFC 3339 UTC, is informational, and MUST NOT be used to reorder history.

The proof signs the JCS canonical form of the envelope with the `proof` member omitted.

Unknown operation members that could change state interpretation MUST be rejected in v0.1.

## 7. Operations

### 7.1 Create

A controller generates independent rotation and recovery key material, constructs a genesis payload, derives the DID, signs the creation record with a listed rotation key, and submits the public signed record to a directory.

Private keys MUST NOT be submitted to a directory.

### 7.2 Resolve

A resolver retrieves the creation record and subsequent records, then MUST:

1. recompute the DID from genesis;
2. validate the creation signature;
3. validate every `previous` link;
4. validate every operation signature and authorization rule;
5. reject sequence discontinuity;
6. derive state in accepted sequence order;
7. stop with deactivated state after a valid deactivation.

A resolver MUST NOT trust a directory-provided materialized DID Document without independently validating the operation history.

### 7.3 Update

An `update` MUST be signed by a currently authorized rotation key. It carries complete replacement values for the next rotation keys, verification methods, and services.

At least one rotation key MUST remain. An ordinary `update` MUST NOT modify recovery keys.

### 7.4 Recover

A `recover` MUST be signed by a currently authorized recovery key. It carries complete replacement values for rotation keys, recovery keys, verification methods, and services.

At least one rotation key and one recovery key MUST remain.

### 7.5 Deactivate

A `deactivate` MUST be signed by a currently authorized recovery key. Its operation payload MUST contain only the deactivation operation defined by v0.1.

Deactivation is terminal. No subsequent update or recovery is valid.

### 7.6 Conflicting successors

If multiple cryptographically valid successors for the same predecessor are observed and a single canonical successor cannot be established by the accepted append-log view, a resolver MUST fail closed with `conflictingHistory` rather than selecting a branch silently.

## 8. Directory read profile

Transport is not part of DID syntax. v0.1 defines this interoperable HTTPS read profile:

```http
GET /.well-known/sizuq/did/{method-specific-id}/operations
Accept: application/json
```

A successful response contains the creation record followed by subsequent accepted records in order.

Mirrors MAY serve the same representation. Resolvers SHOULD permit configurable directory endpoints and MAY compare multiple mirrors.

Network failure is not equivalent to `notFound`.

## 9. DID Document projection

The resolved DID Document uses the W3C DID data model. Its `id` is the resolved DID. Verification methods, verification relationships, and services are projected from the latest valid non-deactivated state.

Materialized DID Documents are not separately authoritative or separately signed by this method; authenticity is derived from verification of the signed operation history.

## 10. Relationship to `sq:`

The companion `sq:` scheme uses the `did:sizuq` method-specific identifier as its identity root. For example:

```text
did:sizuq:zExampleRoot
sq:zExampleRoot/profile
```

The DID method does not require use of `sq:`. A client MAY use `did:sizuq` independently.

## 11. Security considerations

Controllers SHOULD isolate rotation and recovery keys and SHOULD keep recovery keys offline or hardware-backed where practical.

A malicious directory can omit, replay, or equivocate about otherwise valid records. Resolvers MUST validate hashes and signatures and SHOULD retain or compare validated state when rollback/equivocation resistance matters.

Service endpoints are untrusted network locations. Applications MUST NOT infer authentication or authorization merely from the ability to reach an endpoint. Server-side dereferencing SHOULD defend against SSRF and resource-exhaustion attacks.

Cryptographic control of a DID does not itself prove a legal, physical, or social identity claim.

## 12. Privacy considerations

Stable DIDs can enable correlation. Controllers SHOULD use pairwise or application-scoped DIDs where global linkability is unnecessary.

The method-specific identifier MUST NOT directly encode a human-readable name, email address, phone number, account handle, location, or other personal attribute.

Operation histories can be durable and mirrored. Personal profile content SHOULD live outside the DID operation log. Directory operators SHOULD minimize lookup logs and publish retention practices.

## 13. Versioning

Backward-incompatible changes to identifier derivation, canonicalization, cryptographic interpretation, operation authorization, state transitions, or deactivation semantics require a new protocol version and MUST NOT retroactively change interpretation of existing v0.1 histories.

## 14. References

Normative and informative dependencies include W3C DID Core, RFC 8785, RFC 3986 where URI processing is relevant, RFC 3339, BCP 14, multibase, and Multikey/Ed25519 specifications used by the v0.1 profile.

Conformance material is versioned under `conformance/`.