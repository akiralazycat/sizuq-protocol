export type JsonPrimitive = null | boolean | number | string;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type VerificationPurpose = "authentication" | "assertionMethod" | string;

export interface VerificationMethod {
  id: string;
  type: "Multikey" | string;
  publicKeyMultibase: string;
  purposes: VerificationPurpose[];
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
  [key: string]: JsonValue | undefined;
}

export interface GenesisPayload {
  type: "create";
  version: 1;
  rotationKeys: string[];
  recoveryKeys: string[];
  verificationMethods: VerificationMethod[];
  services: Service[];
}

export interface Proof {
  key: string;
  signatureMultibase: string;
}

export interface CreationRecord {
  did: string;
  sequence: 0;
  genesis: GenesisPayload;
  proof: Proof;
}

export interface UpdateOperation {
  type: "update";
  rotationKeys: string[];
  verificationMethods: VerificationMethod[];
  services: Service[];
}

export interface RecoverOperation {
  type: "recover";
  rotationKeys: string[];
  recoveryKeys: string[];
  verificationMethods: VerificationMethod[];
  services: Service[];
}

export interface DeactivateOperation {
  type: "deactivate";
}

export type DidOperation = UpdateOperation | RecoverOperation | DeactivateOperation;

export interface OperationEnvelope {
  did: string;
  sequence: number;
  previous: string;
  timestamp: string;
  operation: DidOperation;
  proof: Proof;
}

export type DidRecord = CreationRecord | OperationEnvelope;

export interface DidState {
  did: string;
  sequence: number;
  rotationKeys: string[];
  recoveryKeys: string[];
  verificationMethods: VerificationMethod[];
  services: Service[];
  deactivated: boolean;
  lastDigest: string;
}

export interface DidDocument {
  "@context": string[];
  id: string;
  verificationMethod: Array<{
    id: string;
    controller: string;
    type: string;
    publicKeyMultibase: string;
  }>;
  authentication?: string[];
  assertionMethod?: string[];
  service?: Service[];
}

export interface DidResolutionResult {
  didDocument: DidDocument | null;
  didResolutionMetadata: {
    deactivated?: true;
    error?: string;
  };
  didDocumentMetadata: {
    sequence: number;
    versionId: string;
  };
  state: DidState;
}

export interface ParsedSqUri {
  scheme: "sq";
  root: string;
  path: string | null;
  query: string | null;
  fragment: string | null;
  canonicalPrimary: string;
  canonical: string;
}

export interface GeneratedEd25519KeyPair {
  keyPair: CryptoKeyPair;
  publicKeyMultibase: string;
}
