# Sizuq Reference Node

This directory is the canonical destination for the non-normative reference directory node used to exercise `did:sizuq` lifecycle operations and public read interoperability.

## Protocol boundary

The v0.1 protocol standardizes an interoperable directory **read** profile. It intentionally does not standardize a generic HTTP write API.

Reference write endpoints are implementation tooling only and MUST NOT be treated as protocol wire requirements.

A conforming reference node:

- accepts signed public operation records, never private keys;
- independently validates submitted operations before append;
- stores accepted operations append-only;
- exposes accepted history through the v0.1 read profile;
- does not become cryptographic authority merely because it stores a history;
- treats conflicting successor acceptance as a race that must fail closed or be serialized safely.

## Existing deployment

The current deployed reference node is part of `sizuq.org`. Its persistent store is isolated from the `sizuq.com` product database. The existing implementation uses a dedicated Neon-backed store and short-lived Vercel OIDC-based access rather than a long-lived database password.

## Migration status

**BLOCKING for release freeze:** schema, RLS policy, and the reference-node implementation currently under `akiralazycat/sizuq/protocol/reference-node` and its API routes must be promoted or linked reproducibly from this repository before the release tag is created.

The deployed node remains reference/test infrastructure and is not a production identity service for `sizuq.com` while product adoption remains `reference-only`.