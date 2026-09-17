CREATE TABLE IF NOT EXISTS mpv_feedback (
  id uuid PRIMARY KEY,
  submission_id varchar(80) UNIQUE NOT NULL,
  game_id varchar(40) NOT NULL,
  clarity varchar(3) NOT NULL,
  connection varchar(3) NOT NULL,
  replay_intent varchar(3) NOT NULL,
  suggestion varchar(500) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mpv_feedback_submission_format CHECK (submission_id ~ '^[a-zA-Z0-9_-]{16,80}$'),
  CONSTRAINT mpv_feedback_game CHECK (game_id IN ('discovery-together', 'guess-about-me', 'love-style-sample')),
  CONSTRAINT mpv_feedback_clarity CHECK (clarity IN ('yes', 'no')),
  CONSTRAINT mpv_feedback_connection CHECK (connection IN ('yes', 'no')),
  CONSTRAINT mpv_feedback_replay CHECK (replay_intent IN ('yes', 'no'))
);

ALTER TABLE mpv_feedback ADD COLUMN IF NOT EXISTS suggestion varchar(500) NOT NULL DEFAULT '';
ALTER TABLE mpv_feedback DROP CONSTRAINT IF EXISTS mpv_feedback_submission_format;
ALTER TABLE mpv_feedback
  ADD CONSTRAINT mpv_feedback_submission_format
  CHECK (submission_id ~ '^[a-zA-Z0-9_-]{16,80}$');
ALTER TABLE mpv_feedback DROP CONSTRAINT IF EXISTS mpv_feedback_game;
ALTER TABLE mpv_feedback
  ADD CONSTRAINT mpv_feedback_game
  CHECK (game_id IN ('discovery-together', 'guess-about-me', 'love-style-sample'));
ALTER TABLE mpv_feedback DROP CONSTRAINT IF EXISTS mpv_feedback_clarity;
ALTER TABLE mpv_feedback
  ADD CONSTRAINT mpv_feedback_clarity
  CHECK (clarity IN ('yes', 'no'));
ALTER TABLE mpv_feedback DROP CONSTRAINT IF EXISTS mpv_feedback_connection;
ALTER TABLE mpv_feedback
  ADD CONSTRAINT mpv_feedback_connection
  CHECK (connection IN ('yes', 'no'));
ALTER TABLE mpv_feedback DROP CONSTRAINT IF EXISTS mpv_feedback_replay;
ALTER TABLE mpv_feedback
  ADD CONSTRAINT mpv_feedback_replay
  CHECK (replay_intent IN ('yes', 'no'));

CREATE INDEX IF NOT EXISTS mpv_feedback_created_at_index ON mpv_feedback (created_at);
