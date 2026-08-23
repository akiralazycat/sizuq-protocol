import type { CreationRecord } from "./types";

/**
 * Public, non-normative interoperability fixture hosted by sizuq.org.
 *
 * Its private rotation and recovery keys were generated ephemerally for the
 * signed creation record and were not retained. The fixture is intentionally
 * immutable: lifecycle behavior is covered by the writer/playground and test
 * vectors, while this identity gives independent clients a stable network
 * target for resolve -> verify -> dereference checks.
 */
export const INTEROP_ROOT = "zBNK1XN8HAhM1buSETkPJRV6dAhR98q27wkunKaqMVoT5";
export const INTEROP_DID = `did:sizuq:${INTEROP_ROOT}`;
export const INTEROP_CREATION_DIGEST = "z3SNf1w48swHFvCnvZeMkfzmgdNxPJmPY2iQS6FoYW9mL";
export const INTEROP_RESOURCE_ENDPOINT = "https://sizuq.org/api/reference/resource";
export const INTEROP_PROFILE_SQ = `sq:${INTEROP_ROOT}/profile`;
export const INTEROP_POST_SQ = `sq:${INTEROP_ROOT}/post/hello-world`;

export const INTEROP_CREATION_RECORD: CreationRecord = {
  did: INTEROP_DID,
  sequence: 0,
  genesis: {
    type: "create",
    version: 1,
    rotationKeys: ["z6MkhKiQui6ZFnp5DeV71xbpZcq7kfP4DhiETCENSemBE5Jr"],
    recoveryKeys: ["z6Mkn2uTWLL2uxbPN3UZFsRcuZ9BUPGuWRbRToiniTbBbv44"],
    verificationMethods: [
      {
        id: "#auth-1",
        type: "Multikey",
        publicKeyMultibase: "z6MkhKiQui6ZFnp5DeV71xbpZcq7kfP4DhiETCENSemBE5Jr",
        purposes: ["authentication", "assertionMethod"],
      },
    ],
    services: [
      {
        id: "#resources",
        type: "SizuqResourceService",
        serviceEndpoint: INTEROP_RESOURCE_ENDPOINT,
      },
    ],
  },
  proof: {
    key: "z6MkhKiQui6ZFnp5DeV71xbpZcq7kfP4DhiETCENSemBE5Jr",
    signatureMultibase: "z2N4Nxn5iFWojKXKroEREtT9iwpkmxqAgegKgPz2n51oHdLp9EsGAFsCgPrYzwikrmHqbFc4HmtwcjxNd2uqs1QKP",
  },
};
