# Sizuq Protocol Governance

## Scope

This document governs changes to the normative Sizuq Protocol specifications, registrable identifiers, namespaces, conformance material, and reference implementations in this repository.

## Change controller

The change controller for the v0.1 Editor's Draft series is **Sizuq Protocol Editors**.

The change controller is responsible for maintaining interoperable meaning, reviewing security/privacy impact, coordinating external registry submissions, and preserving historical release material.

## Normative precedence

When artifacts disagree, precedence is:

1. versioned normative specification text under `specs/`;
2. versioned normative namespace/context definitions;
3. normative conformance vectors;
4. release-candidate registration supplements;
5. reference implementation behavior;
6. deployed examples and explanatory documentation.

An implementation bug does not redefine the protocol.

## Versioning

Backward-incompatible changes to any of the following require a new protocol version:

- identifier derivation;
- canonicalization or digest algorithms;
- signature input or signature suite requirements;
- operation authorization;
- state-transition semantics;
- deactivation semantics;
- `sq:` canonical syntax or identity semantics;
- `SizuqResourceService` dereferencing semantics.

Editorial corrections MAY remain in the same version only when they do not change bytes-to-state interpretation or interoperable behavior.

## Release candidates

A registration-facing release candidate MUST identify:

- the exact normative specification paths;
- the cryptographic suite and canonicalization rules;
- the conformance vectors reviewed for the release;
- security/privacy closure status;
- intended external registration targets;
- unresolved blocking issues, if any.

Historical release-candidate directories MUST NOT be rewritten to silently change interoperable meaning.

## External registrations

External registry status is factual and MUST be represented conservatively.

The repository MUST NOT describe `sq:` as IANA-registered before IANA records the scheme. It MUST NOT describe `did:sizuq` as listed by W3C before the DID Methods collection records the method.

Registry acceptance does not confer private ownership of a generic identifier string and MUST NOT be represented as trademark or property ownership.

## Contributions

Changes that affect normative behavior SHOULD include conformance vectors or implementation evidence. Security- or privacy-sensitive changes SHOULD explain the affected threat model and any migration implications.

Contributors MUST NOT add third-party material that creates incompatible copyright, trademark, patent, or other intellectual-property obligations for implementers.

## Independence claims

A separately written implementation maintained in this repository may be described as implementation-independent from the core package when it does not import or share protocol logic with the core package. It MUST NOT be described as an unaffiliated third-party implementation unless it is in fact maintained independently by an unaffiliated party.