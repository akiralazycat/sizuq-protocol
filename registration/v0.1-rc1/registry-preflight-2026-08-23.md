# External Registry Preflight — 2026-08-23

Status: **Informative snapshot only — MUST be rechecked on submission day**

This file records what was verified while assembling `v0.1-rc1`. Registry contents are external mutable state and this snapshot is not proof of future availability.

## IANA URI Schemes

Official registry:

`https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml`

Observed on 2026-08-23:

- registry page reports last updated `2026-07-29`;
- no exact `sq` scheme entry was found;
- `Provisional` registration procedure is `First Come First Served`;
- `Permanent` registration procedure is `Expert Review`.

RFC 7595 remains the governing registration guidance:

`https://www.rfc-editor.org/rfc/rfc7595`

The release targets **Provisional** registration. Before sending the request, recheck the exact scheme name and the current IANA submission instructions.

## W3C DID Methods

Current editor's draft:

`https://w3c.github.io/did-extensions/methods/`

Observed on 2026-08-23:

- the current DID Methods document is a W3C Group Note dated `2026-08-12`;
- no exact `sizuq` DID method entry was found;
- the document states that DID method specifications must meet the normative DID Core method requirements;
- registry inclusion is a discovery mechanism and is not W3C endorsement.

Current DID Extensions registration policy:

`https://w3c.github.io/did-extensions/`

Relevant preflight requirements include:

- submit the modification as a pull request to the repository hosting DID Extensions;
- provide a human-readable description;
- use a method name indicative of its function/identity and avoid generic placeholder names;
- avoid copyright, trademark, patent, or other IP concerns that would burden W3C, implementers, or users;
- do not create unreasonable legal, security, moral, or privacy harm;
- link to the defining specification, preferably with content-integrity protection;
- JSON-LD context additions must be versioned, persistent, not date-stamped, and use `@protected`.

The Sizuq v0.1 context was updated during this preflight to include `"@protected": true`.

## Submission-day rule

Do not rely on this file to claim availability. Immediately before each external submission:

1. open the live official registry;
2. search the exact identifier (`sq` or `sizuq`);
3. re-read current submission instructions/policies;
4. update the release manifest with the reviewed immutable tag/commit;
5. only then send the registration request or pull request.