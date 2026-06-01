import Database from 'better-sqlite3'
import { app } from 'electron'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

let db

export function initializeDatabase() {
  if (db) return db

  const databaseDirectory = join(app.getPath('userData'), 'sputnik')
  if (!existsSync(databaseDirectory)) {
    mkdirSync(databaseDirectory, { recursive: true })
  }

  db = new Database(join(databaseDirectory, 'sputnik.sqlite'))
  db.pragma('foreign_keys = ON')
  return db
}

export function getDb() {
  return db || initializeDatabase()
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = undefined
  }
}
