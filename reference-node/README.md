# Sizuq Reference Node

This directory contains the portable persistence contract for the non-normative reference directory node used to exercise `did:sizuq` lifecycle operations and public read interoperability.

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

## Persistence

`schema.sql` defines the portable append-only table shape, uniqueness constraints, and an RLS template. The template deliberately omits deployment-specific account/project identifiers. Operators MUST replace the placeholder authentication claims before deployment.

The persistence boundary gives each DID at most one accepted record per sequence and at most one accepted successor for a predecessor. No UPDATE or DELETE grant is provided for accepted operations.

## Existing deployment

The current deployed reference node remains at `sizuq.org`. Its persistent store is isolated from the `sizuq.com` product database and uses short-lived deployment identity rather than requiring a long-lived application database password.

The web/API implementation remains coupled to the deployed `sizuq.org` application for now. That is not a protocol dependency: the read profile, persistence shape, core verifier, vectors, and independent resolver are all represented in this repository.

The deployed node remains reference/test infrastructure and is not a production identity service for `sizuq.com` while product adoption remains `reference-only`.