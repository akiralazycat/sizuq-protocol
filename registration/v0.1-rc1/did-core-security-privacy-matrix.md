# DID Core Security / Privacy Closure Matrix

Target: `did:sizuq` `v0.1-rc1`  
Normative baseline: W3C DID Core v1.0 security/privacy requirements  
Compatibility watch: current DID WG work, including DID Resolution

`CLOSED` means the release-candidate specification set contains an explicit method-specific treatment. `N/A / CLOSED` is used only where the conditional requirement does not define a feature of this method and the boundary is documented explicitly.

## Security closure

| # | Requirement | v0.1-rc1 treatment | Status |
|---|---|---|---|
| S1 | Provide method-specific security analysis. | `did-sizuq-security-privacy.md` defines assets, trust boundaries, cryptographic protections, attacker capabilities, mitigations, and residual risks. | CLOSED |
| S2 | Address eavesdropping, replay, insertion, deletion, modification, DoS/amplification, and MITM. | Dedicated attack analysis covers each class; fork/equivocation is additionally covered. | CLOSED |
| S3 | Discuss residual risks. | Key compromise, stale-but-valid history, implementation defects, cryptanalytic failure, mirror coercion, endpoint compromise, and false real-world binding are explicit residual risks. | CLOSED |
| S4 | Provide integrity protection and update authentication. | Signed JCS records and hash links protect create/update/recover/deactivate operations. | CLOSED |
| S5 | Document authentication characteristics. | Operation authorization is distinguished from external user authentication; resource services do not authenticate the subject. | CLOSED |
| S6 | Explain uniqueness policy. | DID is derived from SHA-256(JCS(genesis)); there is no administrative reassignment operation. | CLOSED |
| S7 | Explain endpoint/topology assumptions. | TLS/directory authentication is separate from DID control. Directory infrastructure is an append-log distribution service, not a cryptographic authority. | CLOSED |
| S8 | State cryptographic protections and assumptions. | JCS, SHA-256, base58btc, Ed25519 Multikey, integrity/authentication properties, and lack of confidentiality are explicit. | CLOSED |
| S9 | Identify secret material. | Rotation/recovery private keys, seeds, and equivalent entropy are secret and forbidden from directory submission. | CLOSED |
| S10 | Explain DID Document signature model. | Materialized DID Documents are not separately signed; authenticity derives from replay/verification of signed operation history. | CLOSED |
| S11 | Address P2P resource burdens where applicable. | v0.1 does not require DLT/P2P consensus; resolver/directory resource bounds are covered under DoS. | N/A / CLOSED |
| S12 | Address new authentication service types where applicable. | `SizuqResourceService` is explicitly resource dereferencing, not authentication or authorization. | N/A / CLOSED |

## Privacy closure

All privacy categories relevant to a public, stable, resolvable identifier are addressed rather than assumed away.

| # | Category | v0.1-rc1 treatment | Status |
|---|---|---|---|
| P1 | Surveillance | Stable identifiers and resolver lookups can expose patterns; pairwise/application-scoped DIDs, caches, alternate resolvers, and minimized logs are recommended. | CLOSED |
| P2 | Stored data compromise | Public operation data is non-secret; private operator metadata and key stores require minimization/access control and isolation. | CLOSED |
| P3 | Unsolicited traffic | Public service endpoints can attract crawling/probing; exposure minimization and abuse controls are specified. | CLOSED |
| P4 | Misattribution | Method control does not prove legal/physical identity; external credentials/trust are required for such claims. | CLOSED |
| P5 | Correlation | DID, key, hostname, path, and configuration reuse are identified as linkability risks. | CLOSED |
| P6 | Identification | The root is a digest, but keys/services can identify a subject when joined with external data; personal profile content stays outside the operation log. | CLOSED |
| P7 | Secondary use | Mirrored history can be indexed/recombined; public metadata should be minimized. | CLOSED |
| P8 | Disclosure | Verification methods, services, history, timing, and recovery events can reveal operational relationships; sensitive values are discouraged/prohibited in paths and endpoints. | CLOSED |
| P9 | Exclusion | Applications should not force one global DID, one hosted directory, one device class, or one recovery path. | CLOSED |

## Implementation consistency checks

Registration closure remains valid only while implementation behavior matches the specification. Reviewers should verify that:

- the resolver recomputes the DID from genesis;
- every accepted operation is signature-verified and hash-linked;
- ordinary updates cannot replace recovery keys;
- deactivation is terminal;
- unresolved multiple valid successors produce `conflictingHistory`;
- server-side `sq:` dereferencing applies policy-aware network controls;
- JSON-LD DID Documents using `SizuqResourceService` include its published context;
- service entries contain DID Core-required `id`, `type`, and `serviceEndpoint` members.

A code change violating these conditions reopens the corresponding registration gate even if prose is unchanged.

## References

- W3C DID Core: `https://www.w3.org/TR/did-core/`
- RFC 3552
- RFC 6973
- W3C DID Extensions / DID Methods process: `https://w3c.github.io/did-extensions/`