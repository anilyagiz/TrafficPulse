CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id BIGINT NOT NULL REFERENCES rounds(round_id),
  wallet TEXT NOT NULL,
  bin_id INTEGER NOT NULL CHECK (bin_id BETWEEN 0 AND 4),
  amount BIGINT NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bets_round ON bets(round_id);
CREATE INDEX idx_bets_wallet ON bets(wallet);
