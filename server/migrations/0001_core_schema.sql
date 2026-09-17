CREATE TABLE users (
  id uuid PRIMARY KEY,
  name text NOT NULL CONSTRAINT users_name_present CHECK (btrim(name) <> ''),
  email text NOT NULL CONSTRAINT users_email_normalized CHECK (email = lower(btrim(email)) AND email <> ''),
  password_hash text NOT NULL CONSTRAINT users_password_hash_present CHECK (btrim(password_hash) <> ''),
  email_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT users_updated_after_creation CHECK (updated_at >= created_at),
  CONSTRAINT users_deleted_after_creation CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE UNIQUE INDEX users_email_unique ON users (lower(email));

CREATE TABLE couples (
  id uuid PRIMARY KEY,
  status text NOT NULL CONSTRAINT couples_status CHECK (status IN ('waiting', 'active', 'closed')),
  anniversary date,
  timezone text NOT NULL CONSTRAINT couples_timezone_present CHECK (btrim(timezone) <> ''),
  invite_token_hash text,
  invite_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  paired_at timestamptz,
  closed_at timestamptz,
  CONSTRAINT couples_invite_complete CHECK (
    (invite_token_hash IS NULL AND invite_expires_at IS NULL)
    OR (invite_token_hash IS NOT NULL AND invite_expires_at IS NOT NULL)
  ),
  CONSTRAINT couples_paired_after_creation CHECK (paired_at IS NULL OR paired_at >= created_at),
  CONSTRAINT couples_closed_after_creation CHECK (closed_at IS NULL OR closed_at >= created_at),
  CONSTRAINT couples_state_dates CHECK (
    (status = 'waiting' AND paired_at IS NULL AND closed_at IS NULL)
    OR (status = 'active' AND paired_at IS NOT NULL AND closed_at IS NULL)
    OR (status = 'closed' AND closed_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX couples_invite_token_unique
  ON couples (invite_token_hash)
  WHERE invite_token_hash IS NOT NULL;

CREATE TABLE couple_members (
  id uuid PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES couples (id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  slot smallint NOT NULL CONSTRAINT couple_members_slot CHECK (slot IN (1, 2)),
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  CONSTRAINT couple_members_id_couple_unique UNIQUE (id, couple_id),
  CONSTRAINT couple_members_leave_order CHECK (left_at IS NULL OR left_at >= joined_at)
);

CREATE INDEX couple_members_couple_index ON couple_members (couple_id);
CREATE INDEX couple_members_user_index ON couple_members (user_id);
CREATE UNIQUE INDEX couple_members_active_user_unique
  ON couple_members (user_id)
  WHERE left_at IS NULL;
CREATE UNIQUE INDEX couple_members_active_slot_unique
  ON couple_members (couple_id, slot)
  WHERE left_at IS NULL;

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  token_hash text NOT NULL UNIQUE CONSTRAINT auth_sessions_token_present CHECK (btrim(token_hash) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  CONSTRAINT auth_sessions_expiry_order CHECK (expires_at > created_at),
  CONSTRAINT auth_sessions_seen_order CHECK (last_seen_at IS NULL OR last_seen_at >= created_at),
  CONSTRAINT auth_sessions_revoked_order CHECK (revoked_at IS NULL OR revoked_at >= created_at)
);

CREATE INDEX auth_sessions_user_expiry_index ON auth_sessions (user_id, expires_at);

CREATE TABLE game_sessions (
  id uuid PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES couples (id) ON DELETE RESTRICT,
  mode text NOT NULL CONSTRAINT game_sessions_mode CHECK (mode IN ('questions', 'challenges', 'mixed')),
  status text NOT NULL CONSTRAINT game_sessions_status CHECK (status IN ('ready', 'active', 'completed', 'abandoned')),
  timezone text NOT NULL CONSTRAINT game_sessions_timezone_present CHECK (btrim(timezone) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz,
  CONSTRAINT game_sessions_id_couple_unique UNIQUE (id, couple_id),
  CONSTRAINT game_sessions_start_order CHECK (started_at IS NULL OR started_at >= created_at),
  CONSTRAINT game_sessions_end_order CHECK (ended_at IS NULL OR ended_at >= COALESCE(started_at, created_at)),
  CONSTRAINT game_sessions_state_dates CHECK (
    (status = 'ready' AND started_at IS NULL AND ended_at IS NULL)
    OR (status = 'active' AND started_at IS NOT NULL AND ended_at IS NULL)
    OR (status IN ('completed', 'abandoned') AND started_at IS NOT NULL AND ended_at IS NOT NULL)
  )
);

CREATE INDEX game_sessions_couple_created_index ON game_sessions (couple_id, created_at);

CREATE TABLE session_participants (
  session_id uuid NOT NULL,
  couple_id uuid NOT NULL,
  member_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, member_id),
  FOREIGN KEY (session_id, couple_id) REFERENCES game_sessions (id, couple_id) ON DELETE RESTRICT,
  FOREIGN KEY (member_id, couple_id) REFERENCES couple_members (id, couple_id) ON DELETE RESTRICT
);

CREATE INDEX session_participants_member_couple_index
  ON session_participants (member_id, couple_id);

CREATE TABLE session_rounds (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES game_sessions (id) ON DELETE RESTRICT,
  position integer NOT NULL CONSTRAINT session_rounds_position_positive CHECK (position > 0),
  activity_key text NOT NULL CONSTRAINT session_rounds_activity_present CHECK (btrim(activity_key) <> ''),
  content_version text NOT NULL CONSTRAINT session_rounds_version_present CHECK (btrim(content_version) <> ''),
  theme_key text NOT NULL CONSTRAINT session_rounds_theme_present CHECK (btrim(theme_key) <> ''),
  kind text NOT NULL CONSTRAINT session_rounds_kind CHECK (kind IN ('open_text', 'multiple_choice', 'challenge')),
  prompt_snapshot text NOT NULL CONSTRAINT session_rounds_prompt_present CHECK (btrim(prompt_snapshot) <> ''),
  options_snapshot jsonb,
  status text NOT NULL DEFAULT 'pending' CONSTRAINT session_rounds_status CHECK (status IN ('pending', 'resolved', 'skipped')),
  revealed_at timestamptz,
  resolved_at timestamptz,
  CONSTRAINT session_rounds_id_session_unique UNIQUE (id, session_id),
  CONSTRAINT session_rounds_position_unique UNIQUE (session_id, position),
  CONSTRAINT session_rounds_options_shape CHECK (
    (kind = 'multiple_choice' AND options_snapshot IS NOT NULL AND jsonb_typeof(options_snapshot) = 'array')
    OR (kind <> 'multiple_choice' AND options_snapshot IS NULL)
  ),
  CONSTRAINT session_rounds_resolution_state CHECK (
    (status = 'pending' AND resolved_at IS NULL AND revealed_at IS NULL)
    OR (status = 'skipped' AND resolved_at IS NOT NULL AND revealed_at IS NULL)
    OR (status = 'resolved' AND resolved_at IS NOT NULL)
  )
);

CREATE TABLE answers (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL,
  round_id uuid NOT NULL,
  member_id uuid NOT NULL,
  kind text NOT NULL CONSTRAINT answers_kind CHECK (kind IN ('open_text', 'multiple_choice', 'challenge')),
  text_value text,
  option_key text,
  challenge_completed boolean,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT answers_round_member_unique UNIQUE (round_id, member_id),
  CONSTRAINT answers_update_order CHECK (updated_at >= submitted_at),
  CONSTRAINT answers_payload_by_kind CHECK (
    (kind = 'open_text' AND text_value IS NOT NULL AND btrim(text_value) <> '' AND option_key IS NULL AND challenge_completed IS NULL)
    OR (kind = 'multiple_choice' AND text_value IS NULL AND option_key IS NOT NULL AND btrim(option_key) <> '' AND challenge_completed IS NULL)
    OR (kind = 'challenge' AND text_value IS NULL AND option_key IS NULL AND challenge_completed IS NOT NULL)
  ),
  FOREIGN KEY (round_id, session_id) REFERENCES session_rounds (id, session_id) ON DELETE RESTRICT,
  FOREIGN KEY (session_id, member_id) REFERENCES session_participants (session_id, member_id) ON DELETE RESTRICT
);

CREATE INDEX answers_session_member_index ON answers (session_id, member_id);

CREATE TABLE progress_events (
  id uuid PRIMARY KEY,
  couple_id uuid NOT NULL,
  session_id uuid NOT NULL,
  round_id uuid NOT NULL UNIQUE,
  kind text NOT NULL CONSTRAINT progress_events_kind CHECK (kind IN ('mutual_answer', 'mutual_challenge')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  activity_date date NOT NULL,
  FOREIGN KEY (session_id, couple_id) REFERENCES game_sessions (id, couple_id) ON DELETE RESTRICT,
  FOREIGN KEY (round_id, session_id) REFERENCES session_rounds (id, session_id) ON DELETE RESTRICT
);

CREATE INDEX progress_events_couple_date_index ON progress_events (couple_id, activity_date);

CREATE TABLE couple_progress (
  couple_id uuid PRIMARY KEY REFERENCES couples (id) ON DELETE RESTRICT,
  completed_rounds integer NOT NULL DEFAULT 0,
  completed_challenges integer NOT NULL DEFAULT 0,
  last_activity_date date,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT couple_progress_nonnegative CHECK (
    completed_rounds >= 0
    AND completed_challenges >= 0
    AND current_streak >= 0
    AND longest_streak >= 0
    AND longest_streak >= current_streak
  )
);

CREATE TABLE analytics_events (
  id uuid PRIMARY KEY,
  name text NOT NULL CONSTRAINT analytics_events_name_present CHECK (btrim(name) <> ''),
  user_id uuid REFERENCES users (id) ON DELETE RESTRICT,
  couple_id uuid REFERENCES couples (id) ON DELETE RESTRICT,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT analytics_events_properties_object CHECK (jsonb_typeof(properties) = 'object')
);

CREATE INDEX analytics_events_user_time_index ON analytics_events (user_id, occurred_at);
CREATE INDEX analytics_events_couple_time_index ON analytics_events (couple_id, occurred_at);
CREATE INDEX analytics_events_name_time_index ON analytics_events (name, occurred_at);
