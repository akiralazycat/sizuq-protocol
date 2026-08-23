# Sizuq Protocol v0.1 Namespace

This directory defines stable semantic identifiers used by Sizuq Protocol v0.1.

## `SizuqResourceService`

Canonical IRI:

```text
https://sizuq.org/ns/v0.1#SizuqResourceService
```

`SizuqResourceService` is the DID service type used to locate the transport endpoint for dereferencing resources identified by the `sq:` URI scheme.

It is a resource-location service. It is **not** an authentication mechanism, authorization mechanism, credential type, or proof of identity.

Example DID service entry:

```json
{
  "id": "did:sizuq:zExample#resources",
  "type": "SizuqResourceService",
  "serviceEndpoint": "https://example.org/sizuq/resources"
}
```

The corresponding JSON-LD context is versioned at:

```text
https://sizuq.org/contexts/sizuq/v0.1
```

The v0.1 term MUST NOT be redefined with incompatible semantics. An incompatible future service definition requires a new namespace version.