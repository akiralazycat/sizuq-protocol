import { base58btcDecode, base58btcEncode, canonicalize, concatBytes, utf8, withoutProof } from "./encoding";
import { protocolError } from "./errors";
import type { GeneratedEd25519KeyPair, Proof } from "./types";

const ED25519_MULTICODEC = new Uint8Array([0xed, 0x01]);

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

export async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", asArrayBuffer(bytes)));
}

export async function digestJson(value: unknown): Promise<string> {
  return base58btcEncode(await sha256(utf8(canonicalize(value))));
}

export async function deriveMethodSpecificId(genesis: unknown): Promise<string> {
  return digestJson(genesis);
}

export async function generateEd25519KeyPair(): Promise<GeneratedEd25519KeyPair> {
  const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey));
  return { keyPair, publicKeyMultibase: base58btcEncode(concatBytes(ED25519_MULTICODEC, raw)) };
}

export function ed25519PublicKeyBytes(multikey: string): Uint8Array {
  const decoded = base58btcDecode(multikey);
  if (decoded.length !== 34 || decoded[0] !== ED25519_MULTICODEC[0] || decoded[1] !== ED25519_MULTICODEC[1]) {
    protocolError("invalidRecord", "Expected an Ed25519 Multikey value.");
  }
  return decoded.slice(2);
}

export async function importEd25519PublicKey(multikey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", asArrayBuffer(ed25519PublicKeyBytes(multikey)), { name: "Ed25519" }, false, ["verify"]);
}

export async function signCanonicalRecord<T extends { proof: Proof }>(record: T, privateKey: CryptoKey, publicKeyMultibase: string): Promise<T> {
  const unsigned = withoutProof(record);
  const signature = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, privateKey, asArrayBuffer(utf8(canonicalize(unsigned)))));
  return { ...record, proof: { key: publicKeyMultibase, signatureMultibase: base58btcEncode(signature) } };
}

export async function verifyCanonicalRecord<T extends { proof: Proof }>(record: T): Promise<boolean> {
  try {
    const signature = base58btcDecode(record.proof.signatureMultibase);
    if (signature.length !== 64) return false;
    const publicKey = await importEd25519PublicKey(record.proof.key);
    return crypto.subtle.verify(
      { name: "Ed25519" },
      publicKey,
      asArrayBuffer(signature),
      asArrayBuffer(utf8(canonicalize(withoutProof(record)))),
    );
  } catch {
    return false;
  }
}
