# Security Policy

## Protocol security boundary

Sizuq Protocol uses signed, hash-linked operations so that directory infrastructure can transport and retain identity history without becoming the cryptographic controller of that identity.

A conforming implementation MUST independently validate identifier derivation, canonicalization, signatures, sequence numbers, predecessor hashes, authorization, and terminal deactivation state.

## Secret material

Private rotation keys, private recovery keys, seeds, authenticator secrets, and equivalent entropy MUST NOT be submitted to a directory node or committed to this repository except in explicitly labeled deterministic test vectors that are never usable for production identities.

Reference-node APIs accept signed public records, not private keys.

## Reporting vulnerabilities

Please use GitHub's private vulnerability reporting mechanism for this repository when available. Do not open a public issue for an unpatched vulnerability that could enable key compromise, signature bypass, unauthorized state transition, resolver confusion, SSRF, persistence corruption, or remote code execution.

Include affected version/commit, reproduction steps, expected impact, and whether the issue is known to affect deployed `sizuq.org` infrastructure.

## Threats considered by v0.1

The v0.1 specification and release bundle explicitly consider:

- eavesdropping;
- replay and rollback;
- insertion of forged operations;
- deletion or omission of history;
- modification of accepted records;
- denial of service and amplification;
- man-in-the-middle attacks;
- directory equivocation and conflicting valid successors;
- rotation-key compromise;
- recovery-key compromise;
- malicious service endpoints and SSRF;
- long-term correlation and lookup privacy;
- false association between cryptographic control and a real-world identity.

## Resolver requirements

Resolvers MUST fail closed when cryptographic validation fails. Network failure MUST NOT be treated as `notFound`. A directory-provided materialized DID Document MUST NOT be trusted without validating the operation history from which it is derived.

If multiple valid successors for the same predecessor are observed and a single canonical successor cannot be established by the accepted append-log view, resolution MUST fail with `conflictingHistory` rather than choosing a branch silently.

## Service endpoints

DID service endpoints are untrusted network locations. Server-side dereferencing SHOULD enforce explicit protocol allow-lists, DNS/IP checks appropriate to the deployment, redirect limits, response-size limits, timeouts, and ordinary TLS validation. Reaching a service endpoint does not authenticate or authorize the DID controller.

## Cryptographic agility

v0.1 fixes RFC 8785 JCS, SHA-256, multibase base58btc, and Ed25519 Multikey for deterministic interoperability. Implementations MUST NOT silently reinterpret existing identifiers or operation histories under replacement algorithms. A cryptographic migration requires an explicit protocol version transition.