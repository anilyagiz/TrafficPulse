CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id BIGINT NOT NULL REFERENCES rounds(round_id),
  wallet TEXT NOT NULL,
  payout BIGINT NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_claims_round ON claims(round_id);
CREATE INDEX idx_claims_wallet ON claims(wallet);
