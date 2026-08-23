/**
 * sizuq protocol v0.1 — dependency-free independent resolver
 *
 * This implementation intentionally imports nothing from @sizuq/protocol.
 * It exists as a second implementation of the published wire rules, not as a
 * production SDK or a security audit. It runs in Node.js 20+ and modern
 * browsers with Web Crypto Ed25519 support.
 */

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const ALPHABET_INDEX = new Map([...ALPHABET].map((char, index) => [char, index]));
const DID_PATTERN = /^did:sizuq:(z[1-9A-HJ-NP-Za-km-z]+)$/;
const ED25519_MULTICODEC = [0xed, 0x01];
const URI_SCHEME_PATTERN = /^[A-Za-z][A-Za-z0-9+.-]*:/;
const SIZUQ_V01_CONTEXT = "https://sizuq.org/contexts/sizuq/v0.1";

export class IndependentSizuqError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "IndependentSizuqError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new IndependentSizuqError(code, message);
}

function cryptoApi() {
  if (!globalThis.crypto?.subtle) fail("unsupportedEnvironment", "Web Crypto is required.");
  return globalThis.crypto;
}

function arrayBuffer(bytes) {
  return Uint8Array.from(bytes).buffer;
}

export function decodeBase58btc(value) {
  if (typeof value !== "string" || !value.startsWith("z")) {
    fail("invalidEncoding", "Expected multibase base58btc beginning with z.");
  }
  const input = value.slice(1);
  if (!input) return new Uint8Array();
  const bytes = [0];
  for (const char of input) {
    const digit = ALPHABET_INDEX.get(char);
    if (digit === undefined) fail("invalidEncoding", `Invalid base58btc character: ${char}`);
    let carry = digit;
    for (let index = 0; index < bytes.length; index += 1) {
      const current = bytes[index] * 58 + carry;
      bytes[index] = current & 0xff;
      carry = current >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let index = 0; index < input.length - 1 && input[index] === "1"; index += 1) bytes.push(0);
  return Uint8Array.from(bytes.reverse());
}

export function encodeBase58btc(input) {
  const bytes = Uint8Array.from(input);
  if (!bytes.length) return "z";
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let index = 0; index < digits.length; index += 1) {
      const current = digits[index] * 256 + carry;
      digits[index] = current % 58;
      carry = Math.floor(current / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let result = "";
  for (let index = 0; index < bytes.length - 1 && bytes[index] === 0; index += 1) result += "1";
  for (let index = digits.length - 1; index >= 0; index -= 1) result += ALPHABET[digits[index]];
  return `z${result}`;
}

function assertJson(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("invalidJson", "JCS rejects non-finite numbers.");
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) assertJson(item);
    return;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) {
      if (item === undefined) fail("invalidJson", "JCS rejects undefined values.");
      assertJson(item);
    }
    return;
  }
  fail("invalidJson", `JCS rejects ${typeof value}.`);
}

function canonicalValue(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalValue(value[key])}`).join(",")}}`;
}

export function canonicalize(value) {
  assertJson(value);
  return canonicalValue(value);
}

export async function digestJson(value) {
  const bytes = new TextEncoder().encode(canonicalize(value));
  return encodeBase58btc(new Uint8Array(await cryptoApi().subtle.digest("SHA-256", arrayBuffer(bytes))));
}

function withoutProof(record) {
  const { proof: _proof, ...unsigned } = record;
  return unsigned;
}

async function verifyProof(record) {
  const keyBytes = decodeBase58btc(record?.proof?.key);
  const signature = decodeBase58btc(record?.proof?.signatureMultibase);
  if (keyBytes.length !== 34 || keyBytes[0] !== ED25519_MULTICODEC[0] || keyBytes[1] !== ED25519_MULTICODEC[1]) {
    fail("invalidSignature", "Proof key is not an Ed25519 Multikey.");
  }
  if (signature.length !== 64) fail("invalidSignature", "Ed25519 signature must be 64 bytes.");
  const publicKey = await cryptoApi().subtle.importKey(
    "raw",
    arrayBuffer(keyBytes.slice(2)),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  const message = new TextEncoder().encode(canonicalize(withoutProof(record)));
  if (!await cryptoApi().subtle.verify("Ed25519", publicKey, arrayBuffer(signature), arrayBuffer(message))) {
    fail("invalidSignature", "Signature verification failed.");
  }
}

function parseDid(did) {
  const match = DID_PATTERN.exec(did);
  if (!match) fail("invalidDid", "Invalid did:sizuq syntax.");
  let root;
  try {
    root = decodeBase58btc(match[1]);
  } catch {
    fail("invalidDid", "Invalid did:sizuq base58btc identifier.");
  }
  if (root.length !== 32) fail("invalidDid", "The v0.1 method-specific identifier must decode to 32 bytes.");
  return match[1];
}

function exactKeys(value, allowed, label) {
  const extras = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extras.length) fail("invalidOperation", `${label} has unknown member(s): ${extras.join(", ")}`);
}

function nonEmptyKeys(value, label) {
  if (!Array.isArray(value) || value.length === 0 || value.some((key) => typeof key !== "string" || !key)) {
    fail("invalidOperation", `${label} must be a non-empty string array.`);
  }
}

function verifyMethods(value) {
  if (!Array.isArray(value)) fail("invalidOperation", "verificationMethods must be an array.");
  for (const method of value) {
    if (!method || typeof method !== "object" || typeof method.id !== "string" ||
        typeof method.type !== "string" || typeof method.publicKeyMultibase !== "string" ||
        !Array.isArray(method.purposes) || method.purposes.some((purpose) => typeof purpose !== "string")) {
      fail("invalidOperation", "Invalid verification method.");
    }
  }
}

function verifyServices(value) {
  if (!Array.isArray(value)) fail("invalidOperation", "services must be an array.");
  const ids = new Set();
  for (const service of value) {
    if (!service || typeof service !== "object") fail("invalidOperation", "Invalid service.");
    if (typeof service.id !== "string" || !service.id) fail("invalidOperation", "Service id is required.");
    if (!service.id.startsWith("#") && !URI_SCHEME_PATTERN.test(service.id)) {
      fail("invalidOperation", "Service id must be an absolute URI or a DID-relative fragment shorthand.");
    }
    if (ids.has(service.id)) fail("invalidOperation", "Service ids must be unique.");
    ids.add(service.id);
    if (typeof service.type !== "string" || !service.type || typeof service.serviceEndpoint !== "string" || !service.serviceEndpoint) {
      fail("invalidOperation", "Service type and serviceEndpoint are required strings.");
    }
    if (!URI_SCHEME_PATTERN.test(service.serviceEndpoint)) fail("invalidOperation", "Service serviceEndpoint must be an absolute URI.");
  }
}

function validateGenesis(genesis) {
  if (!genesis || typeof genesis !== "object") fail("invalidGenesis", "Genesis must be an object.");
  exactKeys(genesis, ["type", "version", "rotationKeys", "recoveryKeys", "verificationMethods", "services"], "genesis");
  if (genesis.type !== "create" || genesis.version !== 1) fail("invalidGenesis", "Unsupported genesis version.");
  nonEmptyKeys(genesis.rotationKeys, "rotationKeys");
  nonEmptyKeys(genesis.recoveryKeys, "recoveryKeys");
  verifyMethods(genesis.verificationMethods);
  verifyServices(genesis.services);
}

function validateOperation(operation) {
  if (!operation || typeof operation !== "object") fail("invalidOperation", "Operation must be an object.");
  if (operation.type === "update") {
    exactKeys(operation, ["type", "rotationKeys", "verificationMethods", "services"], "update");
    nonEmptyKeys(operation.rotationKeys, "rotationKeys");
    verifyMethods(operation.verificationMethods);
    verifyServices(operation.services);
    return;
  }
  if (operation.type === "recover") {
    exactKeys(operation, ["type", "rotationKeys", "recoveryKeys", "verificationMethods", "services"], "recover");
    nonEmptyKeys(operation.rotationKeys, "rotationKeys");
    nonEmptyKeys(operation.recoveryKeys, "recoveryKeys");
    verifyMethods(operation.verificationMethods);
    verifyServices(operation.services);
    return;
  }
  if (operation.type === "deactivate") {
    exactKeys(operation, ["type"], "deactivate");
    return;
  }
  fail("invalidOperation", "Unknown operation type.");
}

async function verifyEnvelope(state, record) {
  if (!record || typeof record !== "object" || record.did !== state.did) fail("invalidRecord", "Operation DID mismatch.");
  if (!Number.isInteger(record.sequence) || record.sequence !== state.sequence + 1) fail("invalidSequence", "Non-contiguous sequence.");
  if (record.previous !== state.lastDigest) fail("invalidSequence", "Previous digest mismatch.");
  if (typeof record.timestamp !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(record.timestamp) ||
      Number.isNaN(Date.parse(record.timestamp))) {
    fail("invalidRecord", "Timestamp must be RFC 3339 UTC.");
  }
  validateOperation(record.operation);
  const authorized = record.operation.type === "update" ? state.rotationKeys : state.recoveryKeys;
  if (!authorized.includes(record?.proof?.key)) fail("invalidSignature", `Unauthorized ${record.operation.type} signer.`);
  await verifyProof(record);
  return digestJson(record);
}

function projectDidDocument(state) {
  if (state.deactivated) return null;
  const absolute = (id) => id.startsWith("#") ? `${state.did}${id}` : id;
  const services = state.services.map((service) => ({ ...structuredClone(service), id: absolute(service.id) }));
  if (new Set(services.map((service) => service.id)).size !== services.length) {
    fail("invalidOperation", "Projected DID Document contains duplicate service ids.");
  }
  const context = ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/multikey/v1"];
  if (services.some((service) => service.type === "SizuqResourceService")) context.push(SIZUQ_V01_CONTEXT);
  return {
    "@context": context,
    id: state.did,
    verificationMethod: state.verificationMethods.map((method) => ({
      id: absolute(method.id),
      controller: state.did,
      type: method.type,
      publicKeyMultibase: method.publicKeyMultibase,
    })),
    authentication: state.verificationMethods.filter((method) => method.purposes.includes("authentication")).map((method) => absolute(method.id)),
    assertionMethod: state.verificationMethods.filter((method) => method.purposes.includes("assertionMethod")).map((method) => absolute(method.id)),
    service: services,
  };
}

export async function resolveSizuqHistory(records, requestedDid) {
  if (!Array.isArray(records) || records.length === 0) fail("notFound", "No operation history supplied.");
  if (requestedDid) parseDid(requestedDid);
  const creation = records[0];
  if (!creation || typeof creation !== "object" || !creation.genesis || creation.sequence !== 0) {
    fail("invalidGenesis", "The first record must be sequence-zero creation.");
  }
  validateGenesis(creation.genesis);
  const derivedDid = `did:sizuq:${await digestJson(creation.genesis)}`;
  if (creation.did !== derivedDid || (requestedDid && requestedDid !== derivedDid)) {
    fail("invalidGenesis", "DID does not equal the genesis digest.");
  }
  parseDid(creation.did);
  if (!creation.genesis.rotationKeys.includes(creation?.proof?.key)) fail("invalidSignature", "Creation signer is not a rotation key.");
  await verifyProof(creation);

  let state = {
    did: creation.did,
    sequence: 0,
    rotationKeys: [...creation.genesis.rotationKeys],
    recoveryKeys: [...creation.genesis.recoveryKeys],
    verificationMethods: structuredClone(creation.genesis.verificationMethods),
    services: structuredClone(creation.genesis.services),
    deactivated: false,
    lastDigest: await digestJson(creation),
  };
  const transitions = [{ sequence: 0, type: "create", digest: state.lastDigest }];

  for (let position = 1; position < records.length; position += 1) {
    if (state.deactivated) fail("deactivated", "History contains an operation after deactivation.");
    const siblings = records.slice(position).filter((candidate) => candidate?.previous === state.lastDigest);
    if (siblings.length > 1) {
      let validSuccessors = 0;
      for (const sibling of siblings) {
        try {
          await verifyEnvelope(state, sibling);
          validSuccessors += 1;
        } catch (error) {
          if (!(error instanceof IndependentSizuqError)) throw error;
        }
      }
      if (validSuccessors > 1) fail("conflictingHistory", "Multiple valid successors reference one predecessor.");
    }

    const record = records[position];
    const digest = await verifyEnvelope(state, record);
    state = { ...state, sequence: record.sequence, lastDigest: digest };
    if (record.operation.type === "update") {
      state.rotationKeys = [...record.operation.rotationKeys];
      state.verificationMethods = structuredClone(record.operation.verificationMethods);
      state.services = structuredClone(record.operation.services);
    } else if (record.operation.type === "recover") {
      state.rotationKeys = [...record.operation.rotationKeys];
      state.recoveryKeys = [...record.operation.recoveryKeys];
      state.verificationMethods = structuredClone(record.operation.verificationMethods);
      state.services = structuredClone(record.operation.services);
    } else {
      state.deactivated = true;
      state.rotationKeys = [];
      state.recoveryKeys = [];
      state.verificationMethods = [];
      state.services = [];
    }
    transitions.push({ sequence: record.sequence, type: record.operation.type, digest });
  }

  return {
    didDocument: projectDidDocument(state),
    didResolutionMetadata: state.deactivated ? { deactivated: true } : {},
    didDocumentMetadata: { sequence: state.sequence, versionId: state.lastDigest },
    state,
    transitions,
  };
}

export async function fetchAndResolveSizuqDid(did, endpoint = "https://sizuq.org") {
  const root = parseDid(did);
  const response = await fetch(`${endpoint.replace(/\/$/, "")}/.well-known/sizuq/did/${root}/operations`, {
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) fail("notFound", "Directory has no history for this DID.");
  if (!response.ok) fail("networkError", `Directory returned HTTP ${response.status}.`);
  return resolveSizuqHistory(await response.json(), did);
}

const runningAsNodeCli = typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  new URL(import.meta.url).protocol === "file:" &&
  decodeURIComponent(new URL(import.meta.url).pathname) === process.argv[1];

if (runningAsNodeCli) {
  const [, , did, endpoint] = process.argv;
  if (!did) {
    process.stderr.write("Usage: node sizuq-independent-resolver-v0.1.mjs <did:sizuq:...> [directory]\n");
    process.exitCode = 2;
  } else {
    fetchAndResolveSizuqDid(did, endpoint)
      .then((result) => process.stdout.write(`${JSON.stringify({ ok: true, result }, null, 2)}\n`))
      .catch((error) => {
        process.stderr.write(`${JSON.stringify({ ok: false, error: error?.code ?? error?.name, message: error?.message })}\n`);
        process.exitCode = 1;
      });
  }
}
