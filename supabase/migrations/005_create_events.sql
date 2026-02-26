CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  event_name TEXT NOT NULL,
  round_id BIGINT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_events_wallet ON events(wallet);
CREATE INDEX idx_events_name ON events(event_name);
