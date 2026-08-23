import { base58btcDecode } from "./encoding";
import { deriveMethodSpecificId, digestJson, signCanonicalRecord, verifyCanonicalRecord } from "./crypto";
import { protocolError, SizuqProtocolError, type SizuqErrorCode } from "./errors";
import type {
  CreationRecord,
  DidDocument,
  DidRecord,
  DidResolutionResult,
  DidState,
  GenesisPayload,
  OperationEnvelope,
  RecoverOperation,
  Service,
  UpdateOperation,
  VerificationMethod,
} from "./types";

const DID_RE = /^did:sizuq:(z[1-9A-HJ-NP-Za-km-z]+)$/;
const URI_SCHEME_RE = /^[A-Za-z][A-Za-z0-9+.-]*:/;
const SIZUQ_V01_CONTEXT = "https://sizuq.org/contexts/sizuq/v0.1";

function exactKeys(value: Record<string, unknown>, allowed: string[], label: string, code: SizuqErrorCode = "invalidOperation"): void {
  const extras = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extras.length) protocolError(code, `${label} contains unknown member(s): ${extras.join(", ")}`);
}

function nonEmptyStrings(value: unknown, label: string, code: SizuqErrorCode = "invalidOperation"): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.length === 0)) {
    protocolError(code, `${label} must be a non-empty string array.`);
  }
}

function validateVerificationMethods(value: unknown, code: SizuqErrorCode = "invalidOperation"): asserts value is VerificationMethod[] {
  if (!Array.isArray(value)) protocolError(code, "verificationMethods must be an array.");
  for (const method of value) {
    if (!method || typeof method !== "object") protocolError(code, "Invalid verification method.");
    const candidate = method as Record<string, unknown>;
    if (typeof candidate.id !== "string" || typeof candidate.type !== "string" || typeof candidate.publicKeyMultibase !== "string" || !Array.isArray(candidate.purposes) || candidate.purposes.some((purpose) => typeof purpose !== "string")) {
      protocolError(code, "Invalid verification method fields.");
    }
  }
}

function validateServices(value: unknown, code: SizuqErrorCode = "invalidOperation"): asserts value is Service[] {
  if (!Array.isArray(value)) protocolError(code, "services must be an array.");
  const ids = new Set<string>();
  for (const service of value) {
    if (!service || typeof service !== "object") protocolError(code, "Invalid service entry.");
    const candidate = service as Record<string, unknown>;
    if (typeof candidate.id !== "string" || candidate.id.length === 0) protocolError(code, "Service id is required.");
    if (!candidate.id.startsWith("#") && !URI_SCHEME_RE.test(candidate.id)) protocolError(code, "Service id must be an absolute URI or a DID-relative fragment shorthand.");
    if (ids.has(candidate.id)) protocolError(code, "Service ids must be unique.");
    ids.add(candidate.id);
    if (typeof candidate.type !== "string" || candidate.type.length === 0 || typeof candidate.serviceEndpoint !== "string" || candidate.serviceEndpoint.length === 0) {
      protocolError(code, "Service type and serviceEndpoint are required strings.");
    }
    if (!URI_SCHEME_RE.test(candidate.serviceEndpoint)) protocolError(code, "Service serviceEndpoint must be an absolute URI.");
  }
}

export function parseDidSizuq(did: string): string {
  const match = DID_RE.exec(did);
  if (!match) protocolError("invalidDid", "Invalid did:sizuq syntax.");
  try {
    const bytes = base58btcDecode(match[1]);
    if (bytes.length !== 32) protocolError("invalidDid", "did:sizuq v0.1 identifiers must decode to exactly 32 bytes.");
  } catch (error) {
    if (error instanceof SizuqProtocolError && error.code === "invalidDid") throw error;
    protocolError("invalidDid", "Invalid did:sizuq base58btc identifier.");
  }
  return match[1];
}

export function validateGenesis(genesis: GenesisPayload): void {
  if (!genesis || typeof genesis !== "object") protocolError("invalidGenesis", "Genesis payload must be an object.");
  exactKeys(genesis as unknown as Record<string, unknown>, ["type", "version", "rotationKeys", "recoveryKeys", "verificationMethods", "services"], "Genesis payload", "invalidGenesis");
  if (genesis.type !== "create" || genesis.version !== 1) protocolError("invalidGenesis", "Unsupported genesis type or version.");
  nonEmptyStrings(genesis.rotationKeys, "rotationKeys", "invalidGenesis");
  nonEmptyStrings(genesis.recoveryKeys, "recoveryKeys", "invalidGenesis");
  validateVerificationMethods(genesis.verificationMethods, "invalidGenesis");
  validateServices(genesis.services, "invalidGenesis");
}

export async function deriveDid(genesis: GenesisPayload): Promise<string> {
  validateGenesis(genesis);
  return `did:sizuq:${await deriveMethodSpecificId(genesis)}`;
}

export async function createCreationRecord(genesis: GenesisPayload, privateKey: CryptoKey, rotationKeyMultibase: string): Promise<CreationRecord> {
  const did = await deriveDid(genesis);
  if (!genesis.rotationKeys.includes(rotationKeyMultibase)) protocolError("invalidSignature", "Creation signer must be listed in genesis.rotationKeys.");
  return signCanonicalRecord({
    did,
    sequence: 0,
    genesis,
    proof: { key: rotationKeyMultibase, signatureMultibase: "z" },
  }, privateKey, rotationKeyMultibase);
}

export async function createOperationRecord(
  state: DidState,
  operation: UpdateOperation | RecoverOperation | { type: "deactivate" },
  privateKey: CryptoKey,
  signingKeyMultibase: string,
  timestamp = new Date().toISOString(),
): Promise<OperationEnvelope> {
  if (state.deactivated) protocolError("deactivated", "Cannot append an operation after deactivation.");
  const authorized = operation.type === "update" ? state.rotationKeys : state.recoveryKeys;
  if (!authorized.includes(signingKeyMultibase)) protocolError("invalidSignature", `Key is not authorized for ${operation.type}.`);
  const envelope: OperationEnvelope = {
    did: state.did,
    sequence: state.sequence + 1,
    previous: state.lastDigest,
    timestamp,
    operation,
    proof: { key: signingKeyMultibase, signatureMultibase: "z" },
  };
  validateOperation(operation);
  return signCanonicalRecord(envelope, privateKey, signingKeyMultibase);
}

function validateOperation(operation: unknown): asserts operation is OperationEnvelope["operation"] {
  if (!operation || typeof operation !== "object") protocolError("invalidOperation", "Operation must be an object.");
  const candidate = operation as Record<string, unknown>;
  if (candidate.type === "update") {
    exactKeys(candidate, ["type", "rotationKeys", "verificationMethods", "services"], "update");
    nonEmptyStrings(candidate.rotationKeys, "rotationKeys");
    validateVerificationMethods(candidate.verificationMethods);
    validateServices(candidate.services);
    return;
  }
  if (candidate.type === "recover") {
    exactKeys(candidate, ["type", "rotationKeys", "recoveryKeys", "verificationMethods", "services"], "recover");
    nonEmptyStrings(candidate.rotationKeys, "rotationKeys");
    nonEmptyStrings(candidate.recoveryKeys, "recoveryKeys");
    validateVerificationMethods(candidate.verificationMethods);
    validateServices(candidate.services);
    return;
  }
  if (candidate.type === "deactivate") {
    exactKeys(candidate, ["type"], "deactivate");
    return;
  }
  protocolError("invalidOperation", "Unknown operation type.");
}

async function verifyCreation(record: CreationRecord, requestedDid?: string): Promise<DidState> {
  if (record.sequence !== 0) protocolError("invalidSequence", "Creation record sequence must be 0.");
  validateGenesis(record.genesis);
  const derived = await deriveDid(record.genesis);
  if (record.did !== derived || (requestedDid && requestedDid !== derived)) protocolError("invalidGenesis", "DID does not match the JCS SHA-256 digest of genesis.");
  parseDidSizuq(record.did);
  if (!record.genesis.rotationKeys.includes(record.proof?.key)) protocolError("invalidSignature", "Creation proof key is not an authorized rotation key.");
  if (!await verifyCanonicalRecord(record)) protocolError("invalidSignature", "Invalid creation signature.");
  return {
    did: record.did,
    sequence: 0,
    rotationKeys: [...record.genesis.rotationKeys],
    recoveryKeys: [...record.genesis.recoveryKeys],
    verificationMethods: structuredClone(record.genesis.verificationMethods),
    services: structuredClone(record.genesis.services),
    deactivated: false,
    lastDigest: await digestJson(record),
  };
}

async function applyEnvelope(state: DidState, record: OperationEnvelope): Promise<DidState> {
  if (state.deactivated) protocolError("deactivated", "History contains an operation after deactivation.");
  if (record.did !== state.did) protocolError("invalidRecord", "Operation DID differs from the creation DID.");
  if (!Number.isInteger(record.sequence) || record.sequence !== state.sequence + 1) protocolError("invalidSequence", "Operation sequence is not the predecessor sequence plus one.");
  if (record.previous !== state.lastDigest) protocolError("invalidSequence", "Operation previous digest does not match the immediately preceding record.");
  if (typeof record.timestamp !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(record.timestamp) || Number.isNaN(Date.parse(record.timestamp))) {
    protocolError("invalidRecord", "Operation timestamp must be an RFC 3339 UTC timestamp.");
  }
  validateOperation(record.operation);
  const authorized = record.operation.type === "update" ? state.rotationKeys : state.recoveryKeys;
  if (!authorized.includes(record.proof?.key)) protocolError("invalidSignature", `Proof key is not authorized for ${record.operation.type}.`);
  if (!await verifyCanonicalRecord(record)) protocolError("invalidSignature", "Invalid operation signature.");

  const next: DidState = { ...state, sequence: record.sequence, lastDigest: await digestJson(record) };
  if (record.operation.type === "update") {
    next.rotationKeys = [...record.operation.rotationKeys];
    next.verificationMethods = structuredClone(record.operation.verificationMethods);
    next.services = structuredClone(record.operation.services);
  } else if (record.operation.type === "recover") {
    next.rotationKeys = [...record.operation.rotationKeys];
    next.recoveryKeys = [...record.operation.recoveryKeys];
    next.verificationMethods = structuredClone(record.operation.verificationMethods);
    next.services = structuredClone(record.operation.services);
  } else {
    next.deactivated = true;
    next.rotationKeys = [];
    next.recoveryKeys = [];
    next.verificationMethods = [];
    next.services = [];
  }
  return next;
}

async function assertNoValidFork(state: DidState, remaining: DidRecord[]): Promise<void> {
  const candidates = remaining.filter((record): record is OperationEnvelope => Boolean(
    record && typeof record === "object" && "previous" in record && (record as OperationEnvelope).previous === state.lastDigest,
  ));
  if (candidates.length < 2) return;

  let validSuccessors = 0;
  for (const candidate of candidates) {
    try {
      await applyEnvelope(state, candidate);
      validSuccessors += 1;
      if (validSuccessors > 1) protocolError("conflictingHistory", "Multiple valid successors reference the same predecessor.");
    } catch (error) {
      if (error instanceof SizuqProtocolError && error.code === "conflictingHistory") throw error;
    }
  }
}

function projectDidDocument(state: DidState): DidDocument | null {
  if (state.deactivated) return null;
  const absolute = (id: string) => id.startsWith("#") ? `${state.did}${id}` : id;
  const services = state.services.map((service) => ({ ...structuredClone(service), id: absolute(service.id) }));
  if (new Set(services.map((service) => service.id)).size !== services.length) {
    protocolError("invalidOperation", "Projected DID Document contains duplicate service ids.");
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

export async function resolveDidHistory(records: DidRecord[], requestedDid?: string): Promise<DidResolutionResult> {
  if (!Array.isArray(records) || records.length === 0) protocolError("notFound", "No did:sizuq operation history was supplied.");
  if (requestedDid) parseDidSizuq(requestedDid);
  const creation = records[0] as CreationRecord;
  if (!creation || typeof creation !== "object" || !("genesis" in creation)) protocolError("invalidGenesis", "First record must be a creation record.");

  let state = await verifyCreation(creation, requestedDid);
  for (let index = 1; index < records.length; index += 1) {
    const record = records[index];
    if (!record || typeof record !== "object" || !("previous" in record)) protocolError("invalidRecord", "Non-creation record must be an operation envelope.");
    await assertNoValidFork(state, records.slice(index));
    state = await applyEnvelope(state, record as OperationEnvelope);
  }
  return {
    didDocument: projectDidDocument(state),
    didResolutionMetadata: state.deactivated ? { deactivated: true } : {},
    didDocumentMetadata: { sequence: state.sequence, versionId: state.lastDigest },
    state,
  };
}
