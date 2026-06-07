PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS kosmo_chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT 'Kosmo session',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kosmo_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (role IN ('user', 'assistant')),
  FOREIGN KEY (session_id) REFERENCES kosmo_chat_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kosmo_chat_sessions_updated_at
  ON kosmo_chat_sessions(updated_at);

CREATE INDEX IF NOT EXISTS idx_kosmo_chat_messages_session_id
  ON kosmo_chat_messages(session_id);
