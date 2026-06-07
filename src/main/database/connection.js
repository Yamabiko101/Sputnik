import Database from 'better-sqlite3'
import { app } from 'electron'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

let db
let activeProfileId = null

function getSputnikDirectory() {
  const databaseDirectory = join(app.getPath('userData'), 'sputnik')
  if (!existsSync(databaseDirectory)) {
    mkdirSync(databaseDirectory, { recursive: true })
  }
  return databaseDirectory
}

export function initializeDatabase() {
  if (db) return db

  const databaseDirectory = getSputnikDirectory()
  db = new Database(join(databaseDirectory, 'sputnik.sqlite'))
  db.pragma('foreign_keys = ON')
  return db
}

export function initializeProfileDatabase(profileId) {
  if (!profileId) throw new Error('Profile id is required.')
  if (db && activeProfileId === profileId) return db
  closeDatabase()

  const profileDirectory = join(getSputnikDirectory(), 'profiles', String(profileId))
  if (!existsSync(profileDirectory)) {
    mkdirSync(profileDirectory, { recursive: true })
  }

  db = new Database(join(profileDirectory, 'sputnik.sqlite'))
  db.pragma('foreign_keys = ON')
  activeProfileId = String(profileId)
  return db
}

export function getDb() {
  if (!db) throw new Error('No Sputnik profile is active.')
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = undefined
    activeProfileId = null
  }
}

export function getActiveProfileId() {
  return activeProfileId
}

export function getSputnikDataDirectory() {
  return getSputnikDirectory()
}
