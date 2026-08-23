import type { CreationRecord, GenesisPayload } from "./types";

export const V01_ROTATION_MULTIKEY = "z6MkehRgf7yJbgaGfYsdoAsKdBPE3dj2CYhowQdcjqSJgvVd";
export const V01_RECOVERY_MULTIKEY = "z6MkhFwXNFWosLeugvSf4wcL9t3uuRXueGSFTRgSvHhWj5G2";
export const V01_METHOD_SPECIFIC_ID = "z75o3YCSEJnivnVp76pexncihFSzBTaRJ7jdCtaXURwtM";
export const V01_DID = `did:sizuq:${V01_METHOD_SPECIFIC_ID}`;
export const V01_CREATION_SIGNATURE = "z5WveVFfwMik3o6V19rxoKNVbSokiXQiQVr55aKGmpm1RuakwFy4gTAEGaRaY2Y2GCh9hRVJf45mCqjG9CSsBGMUg";
export const V01_CREATION_DIGEST = "zG7ckLYBhXPL78MASw4hpG2usWsd9bjo7ixp8DvnCZgK1";

export const V01_GENESIS: GenesisPayload = {
  type: "create",
  version: 1,
  rotationKeys: [V01_ROTATION_MULTIKEY],
  recoveryKeys: [V01_RECOVERY_MULTIKEY],
  verificationMethods: [
    {
      id: "#auth-1",
      type: "Multikey",
      publicKeyMultibase: V01_ROTATION_MULTIKEY,
      purposes: ["authentication", "assertionMethod"],
    },
  ],
  services: [],
};

export const V01_CREATION_RECORD: CreationRecord = {
  did: V01_DID,
  sequence: 0,
  genesis: V01_GENESIS,
  proof: {
    key: V01_ROTATION_MULTIKEY,
    signatureMultibase: V01_CREATION_SIGNATURE,
  },
};
