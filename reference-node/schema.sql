-- Sizuq Protocol reference-node persistence template
--
-- This schema intentionally contains no deployment-specific account or project
-- identifiers. Operators MUST replace the placeholder claim values before use.
-- The official sizuq.org deployment may use stricter claim matching.

CREATE TABLE IF NOT EXISTS public.sizuq_operations (
  did text NOT NULL,
  sequence integer NOT NULL CHECK (sequence >= 0),
  digest text NOT NULL UNIQUE,
  previous_digest text,
  record_text text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (did, sequence),
  CONSTRAINT sizuq_operations_successor_unique UNIQUE (did, previous_digest),
  CONSTRAINT sizuq_operations_chain_shape CHECK (
    (sequence = 0 AND previous_digest IS NULL)
    OR (sequence > 0 AND previous_digest IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS sizuq_operations_did_sequence_idx
  ON public.sizuq_operations (did, sequence);

ALTER TABLE public.sizuq_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizuq_operations FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.sizuq_operations FROM anonymous, authenticated;
GRANT USAGE ON SCHEMA public TO anonymous, authenticated;
GRANT SELECT, INSERT ON TABLE public.sizuq_operations TO anonymous, authenticated;

DROP POLICY IF EXISTS sizuq_reference_select ON public.sizuq_operations;
DROP POLICY IF EXISTS sizuq_reference_insert ON public.sizuq_operations;

-- Replace these placeholders with claims identifying the operator's own
-- deployment. Do not deploy this template unchanged.
CREATE POLICY sizuq_reference_select
  ON public.sizuq_operations
  FOR SELECT
  TO anonymous, authenticated
  USING (
    COALESCE(auth.jwt()->>'owner', '') = 'REPLACE_WITH_EXPECTED_OWNER'
    AND COALESCE(auth.jwt()->>'project', '') = 'REPLACE_WITH_EXPECTED_PROJECT'
    AND COALESCE(auth.jwt()->>'aud', '') = 'REPLACE_WITH_EXPECTED_AUDIENCE'
    AND COALESCE(auth.jwt()->>'environment', '') IN ('production', 'preview')
  );

CREATE POLICY sizuq_reference_insert
  ON public.sizuq_operations
  FOR INSERT
  TO anonymous, authenticated
  WITH CHECK (
    COALESCE(auth.jwt()->>'owner', '') = 'REPLACE_WITH_EXPECTED_OWNER'
    AND COALESCE(auth.jwt()->>'project', '') = 'REPLACE_WITH_EXPECTED_PROJECT'
    AND COALESCE(auth.jwt()->>'aud', '') = 'REPLACE_WITH_EXPECTED_AUDIENCE'
    AND COALESCE(auth.jwt()->>'environment', '') IN ('production', 'preview')
  );

-- No UPDATE or DELETE grant is provided for accepted operations.
-- Uniqueness of (did, sequence) and (did, previous_digest) makes conflicting
-- successor acceptance fail at the persistence boundary as well as in protocol
-- validation.
