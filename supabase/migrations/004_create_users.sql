CREATE TABLE users (
  wallet TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);
