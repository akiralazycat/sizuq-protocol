# IANA Provisional URI Scheme Registration Draft — `sq`

Status: **Draft — do not submit until release freeze gate is closed**  
Target registry: IANA Uniform Resource Identifier (URI) Schemes  
Requested status: **Provisional**

## Preflight

As of 2026-08-23, the official IANA URI Schemes registry does not contain an `sq` entry. This MUST be checked again immediately before submission.

The release manifest currently marks the immutable release tag as blocking. Do not submit until `protocol-v0.1-rc1` (or the final chosen immutable release reference) exists and all implementation migration gates are closed.

## Registration fields

### URI scheme name

`sq`

### Status

Provisional

### Applications/protocols that use this scheme name

Sizuq Protocol clients, DID-aware social/content applications, resolvers, gateways, QR/NFC links, and interoperable resource references use `sq:` to identify resources rooted in `did:sizuq` identities without binding the canonical resource identifier to a particular HTTPS host.

### Contact

Sizuq Protocol Editors  
`contact@sizuq.com`

### Change controller

Sizuq Protocol Editors  
`contact@sizuq.com`

### References

- Versioned source: `https://github.com/akiralazycat/sizuq-protocol/tree/main/specs/sq-uri/v0.1`
- Durable rendered specification: `https://sizuq.org/spec/sq-uri`
- Registration release bundle: `https://github.com/akiralazycat/sizuq-protocol/tree/main/registration/v0.1-rc1`
- Immutable release tag/commit: **BLOCKING — insert after freeze**

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
- [ ] Freeze and cite an immutable repository commit/tag.
- [ ] Migrate the core implementation and independent resolver into this repository.
- [ ] Run normative DID and `sq:` vectors against both implementations.
- [ ] Confirm the durable `sizuq.org` spec/context/namespace URLs return the release semantics.
- [ ] Confirm the public contact address is monitored.
- [ ] Compare this text against the current RFC 7595/IANA submission instructions on submission day.
- [ ] Submit as **Provisional**, not Permanent.
- [ ] After acceptance, update repository status factually with the IANA registry reference.