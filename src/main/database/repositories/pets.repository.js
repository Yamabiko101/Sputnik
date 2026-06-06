import { getDb } from '../connection.js'

export function getCurrentPet() {
  const pet = getDb().prepare(`
    SELECT
      pets.*,
      pet_skins.key AS skin_key,
      pet_skins.name AS skin_name,
      pet_skins.palette AS skin_palette,
      pet_skins.is_premium AS skin_is_premium
    FROM pets
    LEFT JOIN pet_skins ON pet_skins.id = pets.current_skin_id
    WHERE pets.id = 1
  `).get()

  return {
    ...pet,
    next_level_xp: getNextLevelXp(pet?.level ?? 1),
    progress_to_next_level: getLevelProgress(pet?.xp ?? 0, pet?.level ?? 1)
  }
}

export function setPetMood(mood) {
  getDb().prepare(`
    UPDATE pets
    SET mood = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(mood)

  return getCurrentPet()
}

export function addPetXp(amount, mood = 'celebrating') {
  const pet = getCurrentPet()
  const nextXp = Number(pet.xp ?? 0) + Number(amount)
  const nextLevel = calculateLevel(nextXp)

  getDb().prepare(`
    UPDATE pets
    SET xp = ?,
        level = ?,
        mood = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(nextXp, nextLevel, mood)

  return getCurrentPet()
}

export function listPetSkins() {
  return getDb().prepare(`
    SELECT * FROM pet_skins
    ORDER BY is_premium ASC, id ASC
  `).all()
}

export function selectPetSkin(skinId, currentPlan) {
  const skin = getDb().prepare('SELECT * FROM pet_skins WHERE id = ?').get(skinId)
  if (!skin) throw new Error('Skin not found.')
  if (skin.is_premium && currentPlan !== 'pro') {
    throw new Error('This skin requires Sputnik Pro simulation.')
  }

  getDb().prepare(`
    UPDATE pets
    SET current_skin_id = ?,
        mood = 'ready',
        updated_at = datetime('now')
    WHERE id = 1
  `).run(skinId)

  return getCurrentPet()
}

function calculateLevel(xp) {
  return Math.max(1, Math.floor(Number(xp) / 100) + 1)
}

function getNextLevelXp(level) {
  return Number(level) * 100
}

function getLevelProgress(xp, level) {
  const currentLevelStart = (Number(level) - 1) * 100
  const progress = Number(xp) - currentLevelStart
  return Math.max(0, Math.min(100, progress))
}
