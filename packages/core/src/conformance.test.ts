import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { digestJson } from "./crypto";
import { resolveDidHistory } from "./did";
import { SizuqProtocolError } from "./errors";
import { parseSqUri } from "./sq";
import type { DidRecord } from "./types";

async function readJson(path: string): Promise<any> {
  return JSON.parse(await readFile(new URL(`../../../${path}`, import.meta.url), "utf8"));
}

test("normative did:sizuq v0.1 creation vector resolves byte-for-byte", async () => {
  const vector = await readJson("conformance/did-v0.1.json");
  const result = await resolveDidHistory([vector.creationRecord] as DidRecord[], vector.did);
  assert.equal(result.didDocument?.id, vector.did);
  assert.equal(result.didDocumentMetadata.versionId, vector.creationDigest);
  assert.equal(await digestJson(vector.creationRecord), vector.creationDigest);
});

test("public lifecycle vector reaches terminal deactivation", async () => {
  const vector = await readJson("conformance/lifecycle-v0.1.json");
  const result = await resolveDidHistory(vector.history as DidRecord[], vector.did);
  assert.equal(result.state.sequence, vector.expectedFinalState.sequence);
  assert.equal(result.state.deactivated, true);
  assert.equal(result.didDocument, null);
  assert.equal(result.didDocumentMetadata.versionId, vector.expectedFinalState.versionId);
  assert.deepEqual(
    await Promise.all(vector.history.map((record: DidRecord) => digestJson(record))),
    vector.digests,
  );
});

test("sq: v0.1 parser agrees with the published syntax vectors", async () => {
  const vector = await readJson("conformance/sq-v0.1.json");
  for (const fixture of vector.cases) {
    if (fixture.valid) {
      const parsed = parseSqUri(fixture.input);
      if (fixture.root !== undefined) assert.equal(parsed.root, fixture.root, fixture.id);
      if (fixture.path !== undefined) assert.equal(parsed.path, fixture.path, fixture.id);
      if (fixture.fragment !== undefined) assert.equal(parsed.fragment, fixture.fragment, fixture.id);
      if (fixture.primaryResource !== undefined) assert.equal(parsed.canonicalPrimary, fixture.primaryResource, fixture.id);
      if (fixture.serializedScheme !== undefined) assert.equal(parsed.scheme, fixture.serializedScheme, fixture.id);
    } else {
      assert.throws(
        () => parseSqUri(fixture.input),
        (error: unknown) => error instanceof SizuqProtocolError && error.code === "invalidSqUri",
        fixture.id,
      );
    }
  }
});
