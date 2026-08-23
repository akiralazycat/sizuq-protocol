export type SizuqErrorCode =
  | "invalidDid"
  | "notFound"
  | "invalidGenesis"
  | "invalidSignature"
  | "invalidSequence"
  | "conflictingHistory"
  | "deactivated"
  | "invalidOperation"
  | "invalidRecord"
  | "invalidSqUri"
  | "resourceServiceNotFound"
  | "networkError";

export class SizuqProtocolError extends Error {
  readonly code: SizuqErrorCode;

  constructor(code: SizuqErrorCode, message: string) {
    super(message);
    this.name = "SizuqProtocolError";
    this.code = code;
  }
}

export function protocolError(code: SizuqErrorCode, message: string): never {
  throw new SizuqProtocolError(code, message);
}
