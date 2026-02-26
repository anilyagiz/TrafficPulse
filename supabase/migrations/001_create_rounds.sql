CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id BIGINT UNIQUE NOT NULL,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED', 'RESOLVED', 'FINALIZED')),
  commit_hash BYTEA,
  reveal_seed BYTEA,
  result_bin INTEGER CHECK (result_bin BETWEEN 0 AND 4),
  total_pool BIGINT DEFAULT 0,
  bin_totals BIGINT[5] DEFAULT ARRAY[0,0,0,0,0],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_rounds_start ON rounds(start_ts);
