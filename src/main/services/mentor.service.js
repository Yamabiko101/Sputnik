import { safeStorage } from 'electron'
import { getDb } from '../database/connection.js'
import { deleteSetting, listSettings, setSetting } from '../database/repositories/settings.repository.js'
import { getAllMissions } from './mission.service.js'
import { getAllNotes } from './note.service.js'
import { getDashboardStats } from './stats.service.js'
import { getUserProfileService, getSettings } from './settings.service.js'
import { getCurrentPetService } from './pet.service.js'

const MODEL = 'gemini-2.5-flash'
const API_KEY_SETTING = 'kosmo_ai_gemini_api_key'
const MAX_HISTORY_MESSAGES = 12
const MAX_MESSAGE_CHARS = 4000
const MAX_CONTEXT_ITEMS = 6
const FREE_DAILY_MESSAGE_LIMIT = 10
const DAILY_USAGE_SETTING = 'kosmo_ai_daily_usage'

const KOSMO_SYSTEM_PROMPT = `
You are Kosmo AI, Sputnik's friendly microprofessor.
Sputnik is a local mission-control productivity app with missions, tasks, focus sessions, notes, stats, and Laika the companion.

Your job:
- Help the user understand, plan, study, and move one step forward.
- Be warm, brief, practical, and lightly playful.
- Match the user's language.
- Explain ideas step by step when teaching.
- Ask one useful clarifying question when the request is vague.
- Prefer small next actions over big abstract advice.
- Use Sputnik context when it helps, but do not invent missing data.

Limits:
- You cannot edit missions, tasks, notes, settings, or timers.
- Do not claim you changed app data.
- Do not request secrets or API keys.
`.trim()

function getConfiguredApiKey() {
  const savedKey = getSavedApiKey()
  if (savedKey) return { apiKey: savedKey, source: 'saved' }
  if (process.env.GEMINI_API_KEY) return { apiKey: process.env.GEMINI_API_KEY, source: 'env' }
  return { apiKey: null, source: null }
}

function getSavedApiKey() {
  const encrypted = listSettings()[API_KEY_SETTING]
  if (!encrypted || !safeStorage.isEncryptionAvailable()) return null

  try {
    return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
  } catch {
    return null
  }
}

function todayKey() {
  const date = new Date()
  return date.toISOString().slice(0, 10)
}

function getDailyUsage() {
  const raw = listSettings()[DAILY_USAGE_SETTING]
  if (!raw) return { day: todayKey(), count: 0 }

  try {
    const parsed = JSON.parse(raw)
    if (parsed.day === todayKey()) {
      return { day: parsed.day, count: Number(parsed.count ?? 0) }
    }
  } catch {
    // Ignore old or malformed local usage metadata.
  }

  return { day: todayKey(), count: 0 }
}

function getUsageStatus() {
  const profile = getUserProfileService()
  const plan = profile?.current_plan ?? 'free'
  const usage = getDailyUsage()
  return {
    plan,
    limit: plan === 'pro' ? null : FREE_DAILY_MESSAGE_LIMIT,
    used: usage.count,
    remaining: plan === 'pro' ? null : Math.max(0, FREE_DAILY_MESSAGE_LIMIT - usage.count)
  }
}

function assertCanSendMessage() {
  const usageStatus = getUsageStatus()
  if (usageStatus.limit !== null && usageStatus.remaining <= 0) {
    throw new Error('Kosmo AI Free has reached today\'s message limit. Sputnik Pro removes the daily limit.')
  }
  return usageStatus
}

function recordSentMessage() {
  const usageStatus = getUsageStatus()
  if (usageStatus.limit === null) return getUsageStatus()
  const nextUsage = { day: todayKey(), count: usageStatus.used + 1 }
  setSetting(DAILY_USAGE_SETTING, JSON.stringify(nextUsage))
  return getUsageStatus()
}

function cleanText(value, fallback = '') {
  return String(value ?? fallback).trim().slice(0, MAX_MESSAGE_CHARS)
}

function formatTasks(tasks = []) {
  if (!tasks.length) return 'No tasks yet.'
  return tasks
    .slice(0, MAX_CONTEXT_ITEMS)
    .map((task) => `- [${task.status === 'done' ? 'done' : 'todo'}] ${task.title}`)
    .join('\n')
}

function buildSputnikContext() {
  const missions = getAllMissions()
  const notes = getAllNotes()
  const stats = getDashboardStats()
  const profile = getUserProfileService()
  const pet = getCurrentPetService()
  const settings = getSettings()
  const activeMission = missions.find((mission) => mission.status === 'active') ?? missions[0] ?? null

  const missionLines = missions.slice(0, MAX_CONTEXT_ITEMS).map((mission) => {
    const due = mission.due_date ? ` due ${mission.due_date}` : ''
    return `- ${mission.title} (${mission.status}, ${mission.priority}, ${mission.progress}% complete${due})`
  })

  const noteLines = notes.slice(0, MAX_CONTEXT_ITEMS).map((note) => {
    const mission = note.mission_title ? ` for ${note.mission_title}` : ''
    const body = cleanText(note.body, 'No body.').replace(/\s+/g, ' ').slice(0, 240)
    return `- ${note.title}${mission}: ${body}`
  })

  return `
Current Sputnik context:
- Profile: ${profile?.display_name ?? 'Commander'}
- Companion: ${pet?.name ?? 'Laika'} is ${pet?.mood ?? 'ready'}, level ${pet?.level ?? 1}
- Focus defaults: ${settings.focus_minutes ?? 25}/${settings.short_break_minutes ?? 5}/${settings.long_break_minutes ?? 15} minutes
- Today: ${stats.focusMinutesToday ?? 0} focus minutes, ${stats.completedTasksToday ?? 0} tasks completed, ${stats.currentStreak ?? 0}-day streak

Active mission:
${activeMission ? `${activeMission.title}
Description: ${activeMission.description || 'No description.'}
Progress: ${activeMission.progress ?? 0}%
Tasks:
${formatTasks(activeMission.tasks)}` : 'No active mission selected.'}

Recent missions:
${missionLines.length ? missionLines.join('\n') : 'No missions yet.'}

Recent Crew Log notes:
${noteLines.length ? noteLines.join('\n') : 'No notes yet.'}
`.trim()
}

function toGeminiContent(message) {
  const role = message.role === 'assistant' ? 'model' : 'user'
  return {
    role,
    parts: [{ text: cleanText(message.content) }]
  }
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) throw new Error('Messages are required.')

  const normalized = messages
    .filter((message) => message && ['user', 'assistant'].includes(message.role))
    .map((message) => ({
      role: message.role,
      content: cleanText(message.content)
    }))
    .filter((message) => message.content)
    .slice(-MAX_HISTORY_MESSAGES)

  if (!normalized.length || normalized[normalized.length - 1].role !== 'user') {
    throw new Error('A user message is required.')
  }

  return normalized
}

function parseGeminiText(data) {
  const candidate = data?.candidates?.[0]
  const text = candidate?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim()

  if (text) return text

  const blockReason = data?.promptFeedback?.blockReason ?? candidate?.finishReason
  if (blockReason) {
    throw new Error(`Kosmo AI could not answer this one (${blockReason}). Try rephrasing it.`)
  }

  throw new Error('Kosmo AI returned an empty response.')
}

function serializeSession(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messageCount: Number(row.message_count ?? 0)
  }
}

function serializeMessage(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at
  }
}

function titleFromMessage(content) {
  const title = cleanText(content, 'Kosmo session').replace(/\s+/g, ' ').slice(0, 48)
  return title || 'Kosmo session'
}

function getSessionRow(id) {
  return getDb().prepare('SELECT * FROM kosmo_chat_sessions WHERE id = ?').get(id)
}

function getSessionMessages(id) {
  return getDb().prepare(`
    SELECT * FROM kosmo_chat_messages
    WHERE session_id = ?
    ORDER BY created_at ASC, id ASC
  `).all(id).map(serializeMessage)
}

function ensureSession(sessionId, firstMessage) {
  const id = Number(sessionId)
  if (Number.isInteger(id) && id > 0) {
    const existing = getSessionRow(id)
    if (existing) return existing
  }

  const result = getDb().prepare(`
    INSERT INTO kosmo_chat_sessions (title)
    VALUES (?)
  `).run(titleFromMessage(firstMessage))

  return getSessionRow(result.lastInsertRowid)
}

function appendSessionMessage(sessionId, role, content) {
  const message = cleanText(content)
  if (!message) throw new Error('Message content is required.')

  const result = getDb().prepare(`
    INSERT INTO kosmo_chat_messages (session_id, role, content)
    VALUES (?, ?, ?)
  `).run(sessionId, role, message)

  getDb().prepare(`
    UPDATE kosmo_chat_sessions
    SET updated_at = datetime('now')
    WHERE id = ?
  `).run(sessionId)

  return getDb().prepare('SELECT * FROM kosmo_chat_messages WHERE id = ?').get(result.lastInsertRowid)
}

function getRecentSessionMessages(sessionId) {
  return getDb().prepare(`
    SELECT role, content FROM (
      SELECT * FROM kosmo_chat_messages
      WHERE session_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    )
    ORDER BY created_at ASC, id ASC
  `).all(sessionId, MAX_HISTORY_MESSAGES)
}

export function getMentorStatusService() {
  const savedConfigured = Boolean(getSavedApiKey())
  const envConfigured = Boolean(process.env.GEMINI_API_KEY)
  return {
    configured: savedConfigured || envConfigured,
    source: savedConfigured ? 'saved' : envConfigured ? 'env' : null,
    encryptionAvailable: safeStorage.isEncryptionAvailable(),
    model: MODEL,
    usage: getUsageStatus()
  }
}

export function saveMentorApiKeyService(data) {
  const apiKey = cleanText(data?.apiKey)
  if (!apiKey) throw new Error('API key is required.')
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Secure key storage is not available on this device.')
  }

  const encrypted = safeStorage.encryptString(apiKey).toString('base64')
  setSetting(API_KEY_SETTING, encrypted)
  return getMentorStatusService()
}

export function clearMentorApiKeyService() {
  deleteSetting(API_KEY_SETTING)
  return getMentorStatusService()
}

export function listMentorSessionsService() {
  return getDb().prepare(`
    SELECT
      kosmo_chat_sessions.*,
      COUNT(kosmo_chat_messages.id) AS message_count
    FROM kosmo_chat_sessions
    LEFT JOIN kosmo_chat_messages
      ON kosmo_chat_messages.session_id = kosmo_chat_sessions.id
    GROUP BY kosmo_chat_sessions.id
    ORDER BY kosmo_chat_sessions.updated_at DESC, kosmo_chat_sessions.id DESC
  `).all().map(serializeSession)
}

export function createMentorSessionService(data = {}) {
  const title = cleanText(data.title, 'New Kosmo session') || 'New Kosmo session'
  const result = getDb().prepare(`
    INSERT INTO kosmo_chat_sessions (title)
    VALUES (?)
  `).run(title.slice(0, 64))

  return getMentorSessionService(result.lastInsertRowid)
}

export function getMentorSessionService(id) {
  const session = getSessionRow(Number(id))
  if (!session) throw new Error('Kosmo chat session not found.')
  return {
    session: serializeSession(session),
    messages: getSessionMessages(session.id),
    usage: getUsageStatus()
  }
}

export function deleteMentorSessionService(id) {
  getDb().prepare('DELETE FROM kosmo_chat_sessions WHERE id = ?').run(Number(id))
  return listMentorSessionsService()
}

export async function sendMentorMessageService(data) {
  const { apiKey } = getConfiguredApiKey()
  if (!apiKey) throw new Error('Kosmo AI is not configured on this device yet.')
  if (typeof fetch !== 'function') throw new Error('Network requests are not available in this runtime.')
  assertCanSendMessage()

  const content = cleanText(data?.content)
  if (!content) throw new Error('Message content is required.')

  const session = ensureSession(data?.sessionId, content)
  appendSessionMessage(session.id, 'user', content)
  const messages = normalizeMessages(getRecentSessionMessages(session.id))
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${KOSMO_SYSTEM_PROMPT}\n\n${buildSputnikContext()}` }]
        },
        contents: messages.map(toGeminiContent),
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 900
        }
      })
    }
  )

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMessage = result?.error?.message ?? 'AI request failed.'
    throw new Error(errorMessage)
  }

  const reply = parseGeminiText(result)
  appendSessionMessage(session.id, 'assistant', reply)
  const usage = recordSentMessage()

  return {
    session: serializeSession(getSessionRow(session.id)),
    messages: getSessionMessages(session.id),
    usage,
    reply: {
      role: 'assistant',
      content: reply
    }
  }
}
