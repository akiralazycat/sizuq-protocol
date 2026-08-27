# Local release verification

GitHub Actions is not a release prerequisite for Sizuq Protocol v0.1. The authoritative release gate is the verification performed against the exact release-candidate commit and recorded with that commit's evidence.

## Required environment

- Node.js 22.x
- npm
- a clean checkout of the exact release-candidate commit
- network access only for the live independent-resolver check

## Offline repository gate

From the repository root:

```sh
npm install --ignore-scripts
npm run verify:local
```

`verify:local` runs both TypeScript type checking and the repository-local conformance/interoperability test suite. A release candidate MUST NOT be frozen if either command fails.

## Live independent-resolver gate

After the offline gate passes:

```sh
npm run test:independent:live
```

This runs the separately implemented resolver against the durable `https://sizuq.org` conformance endpoints. The report MUST return `ok: true` before the release candidate is frozen.

`npm run verify:release` runs the local gate followed by the live independent-resolver gate.

## Evidence to record

For the final release-candidate commit, record:

- full Git commit SHA;
- UTC verification timestamp;
- Node.js version;
- npm version;
- `npm run verify:local` result;
- independent resolver JSON result;
- durable specification/context/namespace URL verification result.

The evidence belongs with the release-candidate registration material and MUST identify the exact commit that was tested.

## GitHub Actions status

The repository workflow may remain available as supplementary automation when GitHub Actions is usable. A skipped, disabled, or unavailable Actions run does not block registration if the exact release commit passes the authoritative local gate and the required evidence is recorded.
