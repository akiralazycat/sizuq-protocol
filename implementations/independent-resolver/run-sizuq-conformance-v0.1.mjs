import {
  IndependentSizuqError,
  digestJson,
  resolveSizuqHistory,
} from "./sizuq-independent-resolver-v0.1.mjs";

async function json(fetcher, url) {
  const response = await fetcher(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

export async function runIndependentConformance({
  baseUrl = "https://sizuq.org",
  fetcher = globalThis.fetch,
} = {}) {
  if (typeof fetcher !== "function") throw new Error("A fetch implementation is required.");
  const base = baseUrl.replace(/\/$/, "");
  const [normative, immutable, lifecycle] = await Promise.all([
    json(fetcher, `${base}/conformance/did-v0.1.json`),
    json(fetcher, `${base}/conformance/live-evidence-v0.1.json`),
    json(fetcher, `${base}/conformance/pilot-lifecycle-v0.1.json`),
  ]);
  const liveHistory = await json(fetcher, lifecycle.operations);

  const normativeResult = await resolveSizuqHistory([normative.creationRecord], normative.did);
  const immutableResult = await resolveSizuqHistory([immutable.creationRecord], immutable.did);
  const lifecycleResult = await resolveSizuqHistory(liveHistory, lifecycle.did);
  const liveLifecycleDigests = await Promise.all(liveHistory.map((record) => digestJson(record)));

  const mutation = structuredClone(lifecycle.history);
  const signature = mutation[1].proof.signatureMultibase;
  mutation[1].proof.signatureMultibase = `${signature.slice(0, -1)}${signature.endsWith("1") ? "2" : "1"}`;
  let mutatedSignatureRejected = false;
  try {
    await resolveSizuqHistory(mutation, lifecycle.did);
  } catch (error) {
    mutatedSignatureRejected = error instanceof IndependentSizuqError && error.code === "invalidSignature";
  }

  const checks = {
    normativeDid: normativeResult.didDocument?.id === normative.did,
    normativeCreationDigest: normativeResult.didDocumentMetadata.versionId === normative.creationDigest,
    normativeRecordDigest: await digestJson(normative.creationRecord) === normative.creationDigest,
    immutableDid: immutableResult.didDocument?.id === immutable.did,
    immutableResourceService: immutableResult.state.services.some((service) => service.type === "SizuqResourceService"),
    lifecycleHistoryMatchesVector: liveLifecycleDigests.join(",") === lifecycle.digests.join(","),
    lifecycleTransitions: lifecycleResult.transitions.map(({ type }) => type).join(",") === "create,update,recover,deactivate",
    lifecycleFinalSequence: lifecycleResult.state.sequence === lifecycle.expectedFinalState.sequence,
    lifecycleDeactivated: lifecycleResult.state.deactivated && lifecycleResult.didDocument === null,
    lifecycleFinalDigest: lifecycleResult.didDocumentMetadata.versionId === lifecycle.expectedFinalState.versionId,
    mutatedSignatureRejected,
  };

  return {
    reportVersion: "sizuq-independent-conformance-run/0.1",
    implementation: "sizuq-independent-resolver/0.1.0",
    baseUrl: base,
    ok: Object.values(checks).every(Boolean),
    checks,
  };
}

const runningAsNodeCli = typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  new URL(import.meta.url).protocol === "file:" &&
  decodeURIComponent(new URL(import.meta.url).pathname) === process.argv[1];

if (runningAsNodeCli) {
  runIndependentConformance({ baseUrl: process.argv[2] })
    .then((report) => {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      if (!report.ok) process.exitCode = 1;
    })
    .catch((error) => {
      process.stderr.write(`${JSON.stringify({ ok: false, error: error?.code ?? error?.name, message: error?.message })}\n`);
      process.exitCode = 1;
    });
}
