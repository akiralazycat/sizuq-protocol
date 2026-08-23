import { parseDidSizuq, resolveDidHistory } from "./did";
import { protocolError } from "./errors";
import type { DidRecord, DidResolutionResult } from "./types";

export interface DirectoryResolverOptions {
  endpoint: string;
  fetch?: typeof globalThis.fetch;
}

export function directoryOperationsUrl(endpoint: string, did: string): string {
  const root = parseDidSizuq(did);
  return `${endpoint.replace(/\/$/, "")}/.well-known/sizuq/did/${root}/operations`;
}

export async function fetchDidHistory(did: string, options: DirectoryResolverOptions): Promise<DidRecord[]> {
  const fetcher = options.fetch ?? globalThis.fetch;
  if (!fetcher) protocolError("networkError", "No fetch implementation is available.");
  const url = directoryOperationsUrl(options.endpoint, did);
  let response: Response;
  try {
    response = await fetcher(url, { headers: { Accept: "application/json" } });
  } catch {
    protocolError("networkError", `Directory request failed: ${url}`);
  }
  if (response.status === 404) protocolError("notFound", `DID was not found at ${options.endpoint}.`);
  if (!response.ok) protocolError("networkError", `Directory returned HTTP ${response.status}.`);
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    protocolError("invalidRecord", "Directory did not return valid JSON.");
  }
  if (!Array.isArray(json)) protocolError("invalidRecord", "Directory operation representation must be a JSON array.");
  return json as DidRecord[];
}

export function createDirectoryResolver(options: DirectoryResolverOptions): (did: string) => Promise<DidResolutionResult> {
  return async (did: string) => resolveDidHistory(await fetchDidHistory(did, options), did);
}
