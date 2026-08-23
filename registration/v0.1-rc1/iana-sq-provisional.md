# IANA Provisional URI Scheme Registration Draft — `sq`

Status: **Draft — do not submit until release freeze gate is closed**  
Target registry: IANA Uniform Resource Identifier (URI) Schemes  
Requested status: **Provisional**

## Preflight

As of 2026-08-23, the official IANA URI Schemes registry does not contain an `sq` entry. This MUST be checked again immediately before submission.

The release manifest currently marks the immutable release tag and final verification checks as blocking. Do not submit until the final release reference exists and all blocking checks are closed.

## RFC 7595 registration template

### Scheme name

`sq`

Scheme-name rationale: `sq` is a short contraction associated specifically with Sizuq Protocol. It is not defined as a generic term for arbitrary identity, storage, social, or resource systems. The defining specification constrains its semantics to resources rooted in `did:sizuq` identities.

### Status

Provisional

### Applications/protocols that use this scheme name

Sizuq Protocol clients, DID-aware social/content applications, resolvers, gateways, QR/NFC links, and interoperable resource references use `sq:` to identify resources rooted in `did:sizuq` identities without binding the canonical resource identifier to a particular HTTPS host.

The intended use is public and interoperable and is not limited to a private environment within one organization. Public reference resolution, resource dereferencing, vectors, and a separately written resolver are available as interoperability evidence.

### Contact

**BLOCKING — insert an identifiable individual registrant name before submission.**  
Email intended for correspondence: `contact@sizuq.com`

RFC 7595 provisional guidance requires contact information identifying the person supplying the registration. A role-only label is therefore not treated as sufficient for the final submission draft.

### Change controller

Sizuq Protocol Editors  
`contact@sizuq.com`

### References

- Sizuq Protocol Editors, “`sq:` URI Scheme Specification v0.1”, durable publication: `https://sizuq.org/spec/sq-uri`.
- Sizuq Protocol Editors, versioned source: `https://github.com/akiralazycat/sizuq-protocol/tree/main/specs/sq-uri/v0.1`.
- Sizuq Protocol Editors, registration release bundle: `https://github.com/akiralazycat/sizuq-protocol/tree/main/registration/v0.1-rc1`.
- T. Berners-Lee, R. Fielding, L. Masinter, “Uniform Resource Identifier (URI): Generic Syntax”, RFC 3986.
- D. Thaler et al., “Guidelines and Registration Procedures for URI Schemes”, RFC 7595.
- Immutable Sizuq Protocol v0.1-rc1 release: **BLOCKING — insert tag/commit URL after freeze**.

## Scheme summary

Canonical form:

```text
sq:<did-sizuq-method-specific-id>[/<opaque-resource-path>][?<query>][#<fragment>]
```

Example:

```text
sq:z75o3YCSEJnivnVp76pexncihFSzBTaRJ7jdCtaXURwtM/profile
```

The root is the method-specific identifier of `did:sizuq:<root>`. Resource dereferencing resolves that DID, locates a `SizuqResourceService`, and dereferences the opaque resource path through the declared endpoint. The original `sq:` URI remains the canonical identifier after gatewaying or HTTP redirects.

The scheme has no authority component and no default port. It does not itself carry credentials.

## Security summary

Handlers treat the URI as untrusted data. Implementations validate syntax and percent-encoding, do not infer DID control from a gateway/HTTPS origin, treat DID service endpoints as untrusted network locations, defend server-side dereferencing against SSRF/resource exhaustion, and do not allow merely opening a URI to authorize sensitive operations.

## Privacy summary

Stable roots and delegated resolution can enable correlation and lookup surveillance. Resource paths should not embed sensitive attributes. Privacy-sensitive clients can use scoped identities, caches, or alternate resolvers.

## Interoperability summary

Scheme comparison follows RFC 3986 scheme case-insensitivity; emitters serialize lowercase `sq`. The root remains case-sensitive base58btc. Unknown resource path segments are preserved. Multiple applications may implement the scheme and no single hosted gateway is protocol authority.

## Final submission checklist

- [ ] Recheck the live IANA registry for exact `sq` availability.
- [ ] Insert an identifiable individual registrant in `Contact` and confirm the correspondence address is monitored.
- [ ] Freeze and cite an immutable repository commit/tag.
- [x] Promote the core implementation and separately written resolver into this repository.
- [ ] Run normative DID, lifecycle, and `sq:` vectors against the final release implementation(s).
- [ ] Confirm the durable `sizuq.org` spec/context/namespace URLs return the release semantics.
- [ ] Compare this text against the current RFC 7595/IANA submission instructions on submission day.
- [ ] Submit as **Provisional**, not Permanent.
- [ ] After acceptance, update repository status factually with the IANA registry reference.