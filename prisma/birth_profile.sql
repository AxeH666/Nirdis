CREATE TABLE IF NOT EXISTS birth_profiles (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TEXT NOT NULL,
  time_confidence TEXT NOT NULL CHECK (time_confidence IN ('exact', 'approx', 'unknown')),
  birth_place_input TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timezone TEXT NOT NULL,
  birth_utc TIMESTAMP NOT NULL,
  locked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_birth_profile_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
