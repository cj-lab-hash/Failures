CREATE TABLE IF NOT EXISTS failures (
  id SERIAL PRIMARY KEY,
  line VARCHAR(100),
  station VARCHAR(100),
  machine VARCHAR(150),
  model VARCHAR(150),
  part_no VARCHAR(150),
  failure_code VARCHAR(100),
  failure_title VARCHAR(200) NOT NULL,
  symptom TEXT,
  root_cause TEXT,
  action_taken TEXT,
  owner_name VARCHAR(150),
  status VARCHAR(50) DEFAULT 'Open',
  extra_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
