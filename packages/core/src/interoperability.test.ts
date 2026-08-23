import assert from "node:assert/strict";
import test from "node:test";
import {
  INTEROP_CREATION_DIGEST,
  INTEROP_CREATION_RECORD,
  INTEROP_DID,
  INTEROP_PROFILE_SQ,
  INTEROP_RESOURCE_ENDPOINT,
} from "./interoperability";
import { digestJson } from "./crypto";
import { resolveDidHistory } from "./did";
import { dereferenceSqUri } from "./sq";

test("the public interoperability creation record resolves and matches its digest", async () => {
  const resolution = await resolveDidHistory([INTEROP_CREATION_RECORD], INTEROP_DID);
  assert.equal(resolution.didDocument?.id, INTEROP_DID);
  assert.equal(resolution.didDocumentMetadata.versionId, INTEROP_CREATION_DIGEST);
  assert.equal(await digestJson(INTEROP_CREATION_RECORD), INTEROP_CREATION_DIGEST);
  assert.equal(resolution.state.services[0]?.serviceEndpoint, INTEROP_RESOURCE_ENDPOINT);
  assert.equal(resolution.didDocument?.service?.[0]?.id, `${INTEROP_DID}#resources`);
  assert.ok(resolution.didDocument?.["@context"].includes("https://sizuq.org/contexts/sizuq/v0.1"));
});

test("the public profile fixture completes resolve, verify, and dereference", async () => {
  const calls: Array<{ url: string; resourceUri: string | null }> = [];
  const result = await dereferenceSqUri(INTEROP_PROFILE_SQ, {
    resolve: async (did) => resolveDidHistory([INTEROP_CREATION_RECORD], did),
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      calls.push({ url: String(input), resourceUri: headers.get("Sizuq-Resource-URI") });
      return Response.json({ id: INTEROP_PROFILE_SQ });
    },
  });

  assert.equal(result.did, INTEROP_DID);
  assert.equal(result.response?.ok, true);
  assert.deepEqual(calls, [{
    url: `${INTEROP_RESOURCE_ENDPOINT}/profile`,
    resourceUri: INTEROP_PROFILE_SQ,
  }]);
});
