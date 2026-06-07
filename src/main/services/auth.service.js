import Database from 'better-sqlite3'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import {
  closeDatabase,
  getActiveProfileId,
  getSputnikDataDirectory,
  initializeProfileDatabase
} from '../database/connection.js'
import { runMigrations } from '../database/migrate.js'
import { seedDatabase } from '../database/seed.js'
import { getDb } from '../database/connection.js'

const AVATAR_KEYS = new Set(['orbital-satellite', 'cosmonaut-signal'])
let accountsDb

function getAccountsDb() {
  if (accountsDb) return accountsDb

  const dataDirectory = getSputnikDataDirectory()
  if (!existsSync(dataDirectory)) {
    mkdirSync(dataDirectory, { recursive: true })
  }

  accountsDb = new Database(join(dataDirectory, 'accounts.sqlite'))
  accountsDb.pragma('foreign_keys = ON')
  accountsDb.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_key TEXT NOT NULL DEFAULT 'orbital-satellite',
      current_plan TEXT NOT NULL DEFAULT 'free',
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT,
      CHECK (current_plan IN ('free', 'pro'))
    );
  `)
  return accountsDb
}

function publicProfile(profile) {
  if (!profile) return null
  return {
    id: profile.id,
    display_name: profile.display_name,
    avatar_key: profile.avatar_key,
    current_plan: profile.current_plan,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    last_login_at: profile.last_login_at
  }
}

function requirePassword(password) {
  if (!password || String(password).length < 1) {
    throw new Error('Password is required.')
  }
}

function requireDisplayName(displayName) {
  if (!displayName || !String(displayName).trim()) {
    throw new Error('Profile name is required.')
  }
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 64).toString('hex')
  return { hash, salt }
}

function verifyPassword(profile, password) {
  requirePassword(password)
  const { hash } = hashPassword(password, profile.password_salt)
  const expected = Buffer.from(profile.password_hash, 'hex')
  const actual = Buffer.from(hash, 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function getProfileRow(profileId) {
  return getAccountsDb().prepare('SELECT * FROM profiles WHERE id = ?').get(profileId)
}

function openProfile(profile) {
  initializeProfileDatabase(profile.id)
  runMigrations()
  seedDatabase()
  getDb().prepare(`
    UPDATE user_profile
    SET display_name = ?,
        current_plan = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(profile.display_name, profile.current_plan)
}

export function initializeAccounts() {
  getAccountsDb()
}

export function listProfilesService() {
  return getAccountsDb()
    .prepare('SELECT * FROM profiles ORDER BY COALESCE(last_login_at, created_at) DESC')
    .all()
    .map(publicProfile)
}

export function getCurrentProfileService() {
  const activeProfileId = getActiveProfileId()
  if (!activeProfileId) return null
  return publicProfile(getProfileRow(activeProfileId))
}

export function createProfileService(data) {
  requireDisplayName(data?.displayName)
  requirePassword(data?.password)

  const avatarKey = data?.avatarKey && AVATAR_KEYS.has(data.avatarKey)
    ? data.avatarKey
    : 'orbital-satellite'
  if (avatarKey === 'cosmonaut-signal') {
    throw new Error('Cosmonaut Signal requires Sputnik Pro.')
  }

  const id = randomUUID()
  const { hash, salt } = hashPassword(data.password)
  getAccountsDb().prepare(`
    INSERT INTO profiles (id, display_name, avatar_key, password_hash, password_salt, last_login_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(id, String(data.displayName).trim(), avatarKey, hash, salt)

  const profile = getProfileRow(id)
  openProfile(profile)
  return { profile: publicProfile(profile), profiles: listProfilesService() }
}

export function loginProfileService(data) {
  const profile = getProfileRow(data?.profileId)
  if (!profile) throw new Error('Profile not found.')
  if (!verifyPassword(profile, data?.password)) {
    throw new Error('Incorrect password.')
  }

  openProfile(profile)
  getAccountsDb().prepare(`
    UPDATE profiles
    SET last_login_at = datetime('now'),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(profile.id)

  return { profile: publicProfile(getProfileRow(profile.id)), profiles: listProfilesService() }
}

export function logoutProfileService() {
  closeDatabase()
  return { profile: null, profiles: listProfilesService() }
}

export function updateProfileService(data) {
  const activeProfileId = getActiveProfileId()
  if (!activeProfileId) throw new Error('No profile is active.')
  const current = getProfileRow(activeProfileId)
  if (!current) throw new Error('Profile not found.')

  const displayName = data?.displayName !== undefined
    ? String(data.displayName).trim()
    : current.display_name
  requireDisplayName(displayName)

  const avatarKey = data?.avatarKey ?? current.avatar_key
  if (!AVATAR_KEYS.has(avatarKey)) throw new Error('Unknown avatar.')
  if (avatarKey === 'cosmonaut-signal' && current.current_plan !== 'pro') {
    throw new Error('Cosmonaut Signal requires Sputnik Pro.')
  }

  getAccountsDb().prepare(`
    UPDATE profiles
    SET display_name = ?,
        avatar_key = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(displayName, avatarKey, activeProfileId)

  getDb().prepare(`
    UPDATE user_profile
    SET display_name = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(displayName)

  return { profile: publicProfile(getProfileRow(activeProfileId)), profiles: listProfilesService() }
}

export function changePasswordService(data) {
  const activeProfileId = getActiveProfileId()
  if (!activeProfileId) throw new Error('No profile is active.')
  const profile = getProfileRow(activeProfileId)
  if (!verifyPassword(profile, data?.currentPassword)) {
    throw new Error('Incorrect password.')
  }
  requirePassword(data?.nextPassword)

  const { hash, salt } = hashPassword(data.nextPassword)
  getAccountsDb().prepare(`
    UPDATE profiles
    SET password_hash = ?,
        password_salt = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(hash, salt, activeProfileId)

  return { profile: publicProfile(getProfileRow(activeProfileId)), profiles: listProfilesService() }
}

export function deleteProfileService(data) {
  const profileId = data?.profileId ?? getActiveProfileId()
  const profile = getProfileRow(profileId)
  if (!profile) throw new Error('Profile not found.')
  if (!verifyPassword(profile, data?.password)) {
    throw new Error('Incorrect password.')
  }

  if (getActiveProfileId() === profile.id) {
    closeDatabase()
  }

  getAccountsDb().prepare('DELETE FROM profiles WHERE id = ?').run(profile.id)
  const profileDirectory = join(getSputnikDataDirectory(), 'profiles', String(profile.id))
  if (existsSync(profileDirectory)) {
    rmSync(profileDirectory, { recursive: true, force: true })
  }

  return { profile: null, profiles: listProfilesService() }
}

export function syncActiveProfilePlan(plan) {
  const activeProfileId = getActiveProfileId()
  if (!activeProfileId) return null
  getAccountsDb().prepare(`
    UPDATE profiles
    SET current_plan = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(plan, activeProfileId)
  return publicProfile(getProfileRow(activeProfileId))
}
