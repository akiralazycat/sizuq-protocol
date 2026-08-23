import { base58btcDecode } from "./encoding";
import { protocolError, SizuqProtocolError } from "./errors";
import type { DidResolutionResult, ParsedSqUri, Service } from "./types";

const ROOT_RE = /^z[1-9A-HJ-NP-Za-km-z]+$/;

function validatePercentEncoding(value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === "%") {
      if (!/^[0-9A-Fa-f]{2}$/.test(value.slice(i + 1, i + 3))) protocolError("invalidSqUri", "Invalid percent-encoding in sq: URI.");
      i += 2;
    }
  }
}

export function parseSqUri(input: string): ParsedSqUri {
  if (typeof input !== "string") protocolError("invalidSqUri", "sq: URI must be a string.");
  const colon = input.indexOf(":");
  if (colon <= 0 || input.slice(0, colon).toLowerCase() !== "sq") protocolError("invalidSqUri", "URI scheme must be sq:.");
  let rest = input.slice(colon + 1);
  validatePercentEncoding(rest);

  let fragment: string | null = null;
  const hash = rest.indexOf("#");
  if (hash >= 0) {
    fragment = rest.slice(hash + 1);
    rest = rest.slice(0, hash);
  }

  let query: string | null = null;
  const question = rest.indexOf("?");
  if (question >= 0) {
    query = rest.slice(question + 1);
    rest = rest.slice(0, question);
  }

  const slash = rest.indexOf("/");
  const root = slash >= 0 ? rest.slice(0, slash) : rest;
  const path = slash >= 0 ? rest.slice(slash + 1) : null;
  if (!root || !ROOT_RE.test(root)) protocolError("invalidSqUri", "sq: URI is missing a valid base58btc identity root.");
  try {
    if (base58btcDecode(root).length !== 32) protocolError("invalidSqUri", "sq: v0.1 roots must decode to exactly 32 bytes.");
  } catch (error) {
    if (error instanceof SizuqProtocolError && error.code === "invalidSqUri") throw error;
    protocolError("invalidSqUri", "Invalid sq: identity root.");
  }
  if (path === "") protocolError("invalidSqUri", "sq: path must not be an empty trailing segment after the root.");

  const base = `sq:${root}${path === null ? "" : `/${path}`}`;
  const withQuery = query === null ? base : `${base}?${query}`;
  return {
    scheme: "sq",
    root,
    path,
    query,
    fragment,
    canonicalPrimary: withQuery,
    canonical: fragment === null ? withQuery : `${withQuery}#${fragment}`,
  };
}

export function identityDidForSq(uri: ParsedSqUri | string): string {
  const parsed = typeof uri === "string" ? parseSqUri(uri) : uri;
  return `did:sizuq:${parsed.root}`;
}

export function findResourceService(resolution: DidResolutionResult): Service {
  const service = resolution.state.services.find((entry) => entry.type === "SizuqResourceService");
  if (!service) protocolError("resourceServiceNotFound", "Resolved identity does not declare a SizuqResourceService.");
  return service;
}

export interface SqDereferenceOptions {
  resolve: (did: string) => Promise<DidResolutionResult>;
  /**
   * Server-side callers MUST provide a policy-aware fetch implementation that
   * applies their SSRF, redirect, timeout, and response-size controls. Browsers
   * may omit this and use the browser's fetch implementation.
   */
  fetch?: typeof globalThis.fetch;
  accept?: string;
}

export interface SqDereferenceResult {
  uri: ParsedSqUri;
  did: string;
  resolution: DidResolutionResult;
  service: Service | null;
  response: Response | null;
}

export async function dereferenceSqUri(input: string, options: SqDereferenceOptions): Promise<SqDereferenceResult> {
  const uri = parseSqUri(input);
  const did = identityDidForSq(uri);
  const resolution = await options.resolve(did);
  if (uri.path === null) return { uri, did, resolution, service: null, response: null };

  const service = findResourceService(resolution);
  const browserFetch = typeof window !== "undefined" ? globalThis.fetch : undefined;
  const fetcher = options.fetch ?? browserFetch;
  if (!fetcher) {
    protocolError(
      "networkError",
      "Server-side sq: dereferencing requires an explicit policy-aware fetch implementation with SSRF controls.",
    );
  }
  const endpoint = service.serviceEndpoint.replace(/\/$/, "");
  const target = `${endpoint}/${uri.path}`;
  let response: Response;
  try {
    response = await fetcher(target, {
      headers: {
        Accept: options.accept ?? "application/json, text/html;q=0.9, */*;q=0.1",
        "Sizuq-Resource-URI": uri.canonicalPrimary,
      },
      redirect: "follow",
    });
  } catch {
    protocolError("networkError", `Failed to dereference ${target}.`);
  }
  return { uri, did, resolution, service, response };
}
