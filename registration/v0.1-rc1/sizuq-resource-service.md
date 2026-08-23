# SizuqResourceService v0.1

Status: **Normative release-candidate service profile**  
Service type token: `SizuqResourceService`  
Canonical term IRI: `https://sizuq.org/ns/v0.1#SizuqResourceService`  
JSON-LD context: `https://sizuq.org/contexts/sizuq/v0.1`

## 1. Purpose

`SizuqResourceService` identifies the service endpoint used to dereference resources whose canonical identifiers use the `sq:` URI scheme.

The service does not establish identity by itself. Controller authority is established by the validated `did:sizuq` operation history. The endpoint is transport for resource retrieval only.

## 2. DID service shape

A v0.1 service entry has the DID Core service members `id`, `type`, and `serviceEndpoint`.

```json
{
  "id": "did:sizuq:zExample#resources",
  "type": "SizuqResourceService",
  "serviceEndpoint": "https://example.org/sizuq/resources"
}
```

Requirements:

- `id` MUST be present and MUST be a valid RFC 3986 URI;
- a DID Document MUST NOT contain more than one service entry with the same `id`;
- `type` MUST be exactly `SizuqResourceService` for this profile;
- `serviceEndpoint` MUST be a valid absolute URI;
- deployments SHOULD use HTTPS endpoints;
- an implementation MUST NOT interpret the service endpoint itself as proof of DID control;
- v0.1 defines no additional mandatory extension property beyond the DID Core service members.

A method-internal shorthand such as `#resources` MAY be accepted during operation construction only if the resolver deterministically expands it to an absolute DID URL in the produced DID Document.

## 3. JSON-LD term definition

When a `did:sizuq` DID Document is serialized as JSON-LD and contains `SizuqResourceService`, the producer MUST include the Sizuq v0.1 context in addition to the DID Core context.

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1",
    "https://sizuq.org/contexts/sizuq/v0.1"
  ]
}
```

The compact term maps to the protected, versioned context:

```json
{
  "@context": {
    "@protected": true,
    "SizuqResourceService": "https://sizuq.org/ns/v0.1#SizuqResourceService"
  }
}
```

The context uses `@protected` so later contexts cannot silently redefine the v0.1 term. This also satisfies the current W3C DID Extensions registration policy for JSON-LD Context additions.

The namespace is versioned and is not date-stamped. Incompatible future semantics require a new namespace version.

## 4. `sq:` dereferencing

Given `sq:<root>/<path>`:

1. validate the `sq:` URI;
2. construct `did:sizuq:<root>`;
3. resolve and independently verify that DID;
4. find a current DID service of type `SizuqResourceService`;
5. append the opaque `sq:` resource path according to the `sq:` v0.1 profile;
6. send the canonical primary `sq:` URI in the `Sizuq-Resource-URI` request header;
7. treat the returned representation as resource content, not as a replacement identifier.

HTTP redirects MAY be followed according to client policy but MUST NOT change the canonical `sq:` identifier.

## 5. Authentication and authorization boundary

`SizuqResourceService` is not an authentication or authorization protocol.

Opening or resolving an `sq:` URI MUST NOT, by itself, authorize payments, release credentials or secrets, link accounts, approve login, perform destructive mutation, or establish a legal/physical identity binding.

Sensitive actions require a separate explicit authentication/authorization protocol.

## 6. Security

Service endpoints are controller-supplied and therefore untrusted from the dereferencer's perspective.

Server-side dereferencers:

- MUST apply normal TLS certificate validation for HTTPS endpoints;
- SHOULD reject loopback, link-local, and private-network targets unless explicitly permitted by deployment policy;
- SHOULD apply DNS-rebinding defenses where applicable;
- SHOULD bound redirects, request duration, and response size;
- MUST safely escape attacker-controlled paths before passing them to HTML, database, shell, log, or filesystem contexts;
- MUST NOT infer controller authority from a successful HTTP response.

A compromised endpoint can return false or malicious resource content even when DID resolution is valid. Applications needing content authenticity SHOULD use an application-level integrity/signature mechanism appropriate to the resource type.

## 7. Privacy

Publishing a resource service creates an observable link between a stable DID and an endpoint. Hostname, path structure, provider, and request logs can increase correlation.

Controllers SHOULD publish no more endpoint information than necessary. Endpoints and `sq:` paths SHOULD NOT embed names, email addresses, exact locations, access tokens, or other sensitive values.

## 8. Change control

The v0.1 term IRI and semantics are frozen by the `v0.1-rc1` release line. Editorial clarifications MUST NOT redefine the term. Incompatible future service semantics require a new versioned namespace/context.