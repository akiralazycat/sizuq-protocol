import { protocolError } from "./errors";
import type { JsonValue } from "./types";

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const alphabetMap = new Map([...alphabet].map((char, index) => [char, index] as const));
const encoder = new TextEncoder();

export function utf8(value: string): Uint8Array {
  return encoder.encode(value);
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function base58btcEncode(bytes: Uint8Array): string {
  if (bytes.length === 0) return "z";
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i += 1) {
      const value = digits[i] * 256 + carry;
      digits[i] = value % 58;
      carry = Math.floor(value / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let encoded = "";
  for (let i = 0; i < bytes.length - 1 && bytes[i] === 0; i += 1) encoded += "1";
  for (let i = digits.length - 1; i >= 0; i -= 1) encoded += alphabet[digits[i]];
  return `z${encoded}`;
}

export function base58btcDecode(value: string): Uint8Array {
  if (!value.startsWith("z")) protocolError("invalidRecord", "Expected a multibase base58btc value beginning with z.");
  const text = value.slice(1);
  if (text.length === 0) return new Uint8Array();
  const bytes = [0];
  for (const char of text) {
    const digit = alphabetMap.get(char);
    if (digit === undefined) protocolError("invalidRecord", `Invalid base58btc character: ${char}`);
    let carry = digit;
    for (let i = 0; i < bytes.length; i += 1) {
      const current = bytes[i] * 58 + carry;
      bytes[i] = current & 0xff;
      carry = current >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff;
      carry >>= 8;
    }
  }
  for (let i = 0; i < text.length - 1 && text[i] === "1"; i += 1) bytes.push(0);
  return Uint8Array.from(bytes.reverse());
}

function assertJsonValue(value: unknown): asserts value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("JCS does not permit NaN or Infinity.");
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) assertJsonValue(entry);
    return;
  }
  if (typeof value === "object") {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (entry === undefined) throw new TypeError("JCS input must not contain undefined values.");
      assertJsonValue(entry);
    }
    return;
  }
  throw new TypeError(`Unsupported JCS value: ${typeof value}`);
}

function canonicalizeValue(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalizeValue).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalizeValue(value[key])}`).join(",")}}`;
}

export function canonicalize(value: unknown): string {
  assertJsonValue(value);
  return canonicalizeValue(value);
}

export function withoutProof<T extends { proof: unknown }>(record: T): Omit<T, "proof"> {
  const { proof: _proof, ...unsigned } = record;
  return unsigned;
}
