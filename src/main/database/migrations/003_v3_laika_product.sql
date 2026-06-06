PRAGMA foreign_keys = ON;

ALTER TABLE pets ADD COLUMN xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pets ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE pets ADD COLUMN current_skin_id INTEGER;

CREATE TABLE IF NOT EXISTS pet_skins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  palette TEXT NOT NULL DEFAULT 'classic',
  is_premium INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_achievements (
  achievement_id INTEGER PRIMARY KEY,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO pet_skins (id, key, name, palette, is_premium)
VALUES
  (1, 'classic', 'Classic Laika', 'classic', 0),
  (2, 'cosmonaut', 'Cosmonaut Laika', 'cosmonaut', 0),
  (3, 'aurora', 'Aurora Laika', 'aurora', 1),
  (4, 'gold-star', 'Gold Star Laika', 'gold', 1);

UPDATE pets
SET current_skin_id = COALESCE(current_skin_id, 1)
WHERE id = 1;

INSERT OR IGNORE INTO achievements (key, title, description, condition_type, condition_value)
VALUES
  ('first_mission', 'First Signal', 'Create your first mission.', 'missions_created', 1),
  ('first_focus', 'Launch Sequence', 'Complete your first focus session.', 'focus_sessions', 1),
  ('focus_five', 'Steady Orbit', 'Complete five focus sessions.', 'focus_sessions', 5),
  ('task_one', 'Checklist Clear', 'Complete your first task.', 'tasks_completed', 1),
  ('log_one', 'Crew Historian', 'Write your first Crew Log entry.', 'notes_created', 1),
  ('mission_one', 'Mission Complete', 'Complete your first mission.', 'missions_completed', 1),
  ('pro_sim', 'Pro Simulator', 'Activate Sputnik Pro simulation.', 'pro_activated', 1);
