# AGENTS.md

Read [GOVERNANCE.md](GOVERNANCE.md) before changing protocol behavior. The versioned specifications under [specs/](specs/) take precedence over implementation behavior.

- Review the corresponding [conformance vectors](conformance/) when changing protocol behavior. Preserve the independence of the [separately written resolver](implementations/independent-resolver/).
- Run the [local verification commands](README.md#verification) and record the result. Use the live resolver for release verification against the published evidence.
- Follow the [registration track](README.md#registration-track) when preparing a release candidate. Base registration status on acceptance by the relevant registry.
