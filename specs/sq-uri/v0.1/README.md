# `sq:` URI Scheme Specification v0.1

Status: **Editor's Draft / intended IANA Provisional registration**  
Normative language: English, BCP 14

## 1. Abstract

The `sq:` scheme identifies a resource relative to a cryptographically controlled `did:sizuq` identity root. It is intended for portable links where an HTTPS origin would otherwise couple resource identity to a particular host or provider.

This document does not claim that `sq` is registered until IANA records the scheme.

## 2. Syntax

The scheme name is `sq`. Parsers MUST compare the scheme component case-insensitively as required by RFC 3986, while emitters SHOULD serialize it as lowercase `sq`.

```abnf
sq-uri   = "sq:" sq-root [ "/" sq-path ] [ "?" query ] [ "#" fragment ]
sq-root  = "z" 1*base58btc-char
sq-path  = segment-nz *( "/" segment )
base58btc-char = %x31-39 / %x41-48 / %x4A-4E / %x50-5A / %x61-6B / %x6D-7A

; segment, segment-nz, query and fragment are from RFC 3986.
; sq-root uses the did:sizuq v0.1 method-specific-id syntax.
```

`sq-root` MUST be a valid `did:sizuq` v0.1 method-specific identifier. `sq:<root>` identifies the identity root itself.

The scheme has no authority component and no default port.

## 3. Semantics

An `sq:` URI has two stable layers:

1. `sq-root` selects `did:sizuq:<sq-root>`;
2. the optional path selects a resource inside the namespace controlled by that DID.

Query parameters carry request or representation hints and MUST NOT change the underlying resource identity unless a more specific resource profile explicitly states otherwise.

Fragments identify secondary resources in the representation returned by dereferencing.

Path segments are opaque to the generic scheme. v0.1 reserves the first segments `profile`, `post`, `collection`, and `service` for Sizuq ecosystem profiles. Unknown first segments MUST be preserved and MAY be handled by extensions.

## 4. Resolution and dereferencing

A conforming client:

1. parses and validates the URI;
2. constructs `did:sizuq:<sq-root>`;
3. resolves that DID using the `did:sizuq` method;
4. if no path is present, returns the identity-root result appropriate to the calling API;
5. otherwise locates a current DID service whose type is `SizuqResourceService`;
6. dereferences the path through that service.

If no conforming service is available, the client returns `resourceServiceNotFound` or an equivalent structured failure.

A conforming HTTP resource service accepts the semantic request:

```http
GET {serviceEndpoint}/{sq-path}
Accept: application/json, text/html;q=0.9, */*;q=0.1
Sizuq-Resource-URI: sq:{root}/{sq-path}
```

HTTP redirects MAY be followed according to client policy, but redirects and gateway URLs do not replace the original `sq:` URI as the canonical identifier.

A gateway MAY expose `sq:` resources over HTTPS for user agents without a native scheme handler.

## 5. Comparison and normalization

The scheme component is case-insensitive. `sq-root` is case-sensitive because it is a base58btc encoding; clients MUST NOT lowercase the root.

Percent-encoded octets representing unreserved characters MAY be normalized according to RFC 3986.

Dot-segment removal applies only where a resource profile defines hierarchical path semantics. Generic `sq:` comparison MUST NOT invent file-system semantics.

Two URIs differing only by fragment identify the same primary resource and different secondary resources. Query ordering is significant unless a resource profile declares otherwise.

## 6. Interoperability

Multiple applications may understand `sq:`. Operating systems and user agents SHOULD allow user choice rather than assuming one vendor is authoritative.

Conforming applications SHOULD support copy/paste and machine-readable representations such as QR encoding using canonical URI text.

Implementations unable to resolve `did:sizuq` locally MAY delegate to a configured resolver or gateway. Delegation affects privacy and availability but MUST NOT alter identifier syntax or the verification rules of the underlying DID method.

## 7. Security considerations

Applications MUST parse `sq:` as data, not as shell commands or executable instructions. Handlers MUST validate length and percent-encoding before passing values to other components.

Resource paths are attacker-controlled input and MUST be escaped appropriately before use in HTML, database queries, logs, or file-system APIs.

A resolver or gateway can return false content, track lookups, or redirect users. Applications MUST NOT treat possession of an HTTPS origin or a successful gateway response as proof of control over `sq-root`.

DID-controlled service endpoints may target private or local addresses. Server-side dereferencers SHOULD enforce SSRF protections, TLS validation where HTTPS is used, redirect limits, response-size limits, and timeouts.

Opening an `sq:` URI MUST NOT by itself authorize payments, credential release, account linking, destructive operations, or other sensitive actions.

## 8. Privacy considerations

Stable roots enable correlation. Applications SHOULD support context-specific identities where cross-context linkability is unnecessary.

Resource paths SHOULD avoid embedding names, email addresses, exact locations, access tokens, or other sensitive attributes.

Delegated resolution can expose the full URI to a gateway or directory. Privacy-sensitive clients SHOULD support local caches or alternate resolvers and SHOULD avoid transmitting fragments when they can be processed locally.

## 9. IANA considerations

The intended registration is **Provisional** under RFC 7595.

| Field | Proposed value |
|---|---|
| Scheme name | `sq` |
| Status | Provisional |
| Applications/protocols | Sizuq Protocol clients, resolvers, gateways, social applications, QR/NFC links, and interoperable resource references |
| Contact | Sizuq Protocol Editors |
| Change controller | Sizuq Protocol Editors |
| Reference | Versioned specification in this repository and durable publication at `https://sizuq.org/spec/sq-uri` |

The short name `sq` is associated specifically with Sizuq Protocol and is not intended as a generic abbreviation that claims a universal namespace outside this protocol family.

The scheme itself carries no credentials. Representation media types are determined during dereferencing rather than by URI syntax.

## 10. Examples

```text
sq:z75o3YCSEJnivnVp76pexncihFSzBTaRJ7jdCtaXURwtM
sq:z75o3YCSEJnivnVp76pexncihFSzBTaRJ7jdCtaXURwtM/profile
sq:z75o3YCSEJnivnVp76pexncihFSzBTaRJ7jdCtaXURwtM/post/0196f7d5-8a2f-7d18-a2c2-60b22e8ce176
sq:z75o3YCSEJnivnVp76pexncihFSzBTaRJ7jdCtaXURwtM/collection/reading?view=compact#item-4
```

The example root is drawn from the existing v0.1 interoperability material. Resource paths are illustrative unless included in a versioned conformance vector.