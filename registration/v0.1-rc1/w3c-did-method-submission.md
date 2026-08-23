# W3C DID Methods Submission Draft — `did:sizuq`

Status: **Draft — do not open the external PR until release freeze gates are closed**  
Target: W3C DID Extensions / DID Methods collection

## Preflight

As of 2026-08-23, the current W3C DID Methods document does not contain a `sizuq` method entry. This MUST be checked again immediately before opening the external pull request.

The current W3C process requires a modification request to the DID Extensions repository and requires DID method specifications to meet DID Core method requirements. The external registry/listing is discovery metadata, not W3C endorsement of the method.

Current DID Extensions policy also requires additions to have a human-readable description, a defining specification URL, and no unreasonable legal/security/privacy harm. JSON-LD context additions must be versioned, persistent, not date-stamped, and use `@protected`.

## Proposed entry data

| Field | Value |
|---|---|
| DID method | `sizuq` |
| Method / registry description | Sizuq Operation Log — self-certifying DID state derived from signed, hash-linked operations |
| Specification | `https://sizuq.org/spec/did-sizuq` |
| Versioned source | `https://github.com/akiralazycat/sizuq-protocol/tree/main/specs/did-sizuq/v0.1` |
| Contact | Sizuq Protocol Editors — `contact@sizuq.com` |
| Release evidence | `https://github.com/akiralazycat/sizuq-protocol/tree/main/registration/v0.1-rc1` |
| Immutable release | **BLOCKING — insert frozen tag/commit** |

Exact file format and row syntax for the upstream pull request MUST be taken from the current `w3c/did-extensions` repository at submission time rather than copied from a stale example.

## Method summary for reviewers

`did:sizuq` is a self-certifying DID method. The method-specific identifier is multibase base58btc encoding of the SHA-256 digest of the RFC 8785 JCS-canonicalized genesis payload. Current state is derived by independently validating a signed, hash-linked sequence of create/update/recover/deactivate records.

A hosted directory distributes and retains operation history but is not cryptographic authority. Resolvers recompute the DID from genesis and validate signatures, predecessor links, sequence, authorization, conflicting successors, and terminal deactivation.

v0.1 fixes JCS, SHA-256, base58btc, and Ed25519 Multikey. Ordinary updates are authorized by rotation keys; recovery and deactivation are authorized by recovery keys. Ordinary update cannot replace recovery keys.

## DID Core operations coverage

- **Create:** genesis construction, deterministic DID derivation, and signed creation record are specified.
- **Read/Resolve:** resolver independently verifies the operation history and projects a DID Document.
- **Update:** complete next-state rotation/verification/service arrays, signed by current rotation authority.
- **Recover:** complete next-state control/service arrays including recovery keys, signed by current recovery authority.
- **Deactivate:** recovery-authorized and terminal.

## Security/privacy closure

Review material:

- `did-sizuq-security-privacy.md`
- `did-core-security-privacy-matrix.md`
- `sizuq-resource-service.md`
- `../../conformance/did-v0.1.json`
- `../../conformance/lifecycle-v0.1.json`

The method explicitly treats directory rollback/omission, equivocation/forks, key compromise, DoS, MITM, endpoint SSRF, correlation, lookup privacy, persistent historical disclosure, and misattribution.

## Intellectual-property statement

The submitter affirms, to the best of their knowledge, that submission and implementation of the `sizuq` DID method do not infringe or otherwise violate third-party copyright, trademark, patent, or other rights in a way that would prevent interoperable implementation.

The specification and reference material are published under the repository license. Any known future IP concern that would burden W3C, implementers, or users MUST be disclosed before submission.

## Evidence to cite

The deployed `sizuq.org` environment currently demonstrates:

- a public signed creation record;
- independent resolution and signature/hash-chain validation;
- `SizuqResourceService` discovery and `sq:` dereferencing;
- public conformance vectors;
- a separately written resolver that does not import the core implementation;
- a persistent public lifecycle pilot that reached rotation, recovery, and deactivation.

The separately written resolver is implementation-independent inside the same project. It MUST NOT be represented as an unaffiliated third-party implementation.

## Final PR checklist

- [ ] Recheck that `sizuq` is not already present in the current DID Methods document.
- [ ] Freeze an immutable release tag/commit and update the manifest.
- [x] Promote the core and separately written resolver source into this repository.
- [ ] Run all frozen conformance vectors against both implementations on the final release commit.
- [ ] Verify DID Document JSON-LD output includes the stable Sizuq v0.1 context when `SizuqResourceService` is used.
- [x] Ensure the repository context is versioned, not date-stamped, and contains `"@protected": true`.
- [ ] Verify the deployed `https://sizuq.org/contexts/sizuq/v0.1` serves the same protected context.
- [ ] Confirm every security/privacy matrix row remains closed.
- [ ] Confirm stable rendered specification, context, and namespace URLs resolve.
- [ ] Confirm monitored contact information.
- [ ] Inspect the current upstream repository and use its exact current entry format.
- [ ] Open the upstream PR with conservative wording: experimental/known method, not endorsement.
- [ ] Update local status only after the upstream entry is merged/published.