# Independent Resolver

This directory contains a separately written Sizuq Protocol v0.1 resolver used as implementation-independence evidence.

## Status

**Source and conformance-runner migration complete.**

- `sizuq-independent-resolver-v0.1.mjs` — dependency-free resolver/CLI;
- `run-sizuq-conformance-v0.1.mjs` — live interoperability runner;
- `../../conformance/independent-resolver-report-v0.1.json` — previously generated public conformance report.

The resolver intentionally does not import `@sizuq/protocol` or share protocol implementation code with `packages/core`.

Passing the same frozen vectors demonstrates implementation independence inside the Sizuq project. It MUST NOT be described as an unaffiliated third-party implementation unless an unaffiliated maintainer independently implements and operates a conforming resolver.

Before `v0.1-rc1` is frozen, the runner SHOULD be executed again from this repository and the report regenerated against the exact release candidate.