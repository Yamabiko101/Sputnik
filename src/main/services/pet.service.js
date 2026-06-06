import {
  getCurrentPet,
  listPetSkins,
  selectPetSkin
} from '../database/repositories/pets.repository.js'
import { getUserProfile } from '../database/repositories/settings.repository.js'

export function getCurrentPetService() {
  return getCurrentPet()
}

export function getPetSkinsService() {
  const profile = getUserProfile()
  return listPetSkins().map((skin) => ({
    ...skin,
    locked: Boolean(skin.is_premium && profile.current_plan !== 'pro')
  }))
}

export function selectPetSkinService(id) {
  const profile = getUserProfile()
  return selectPetSkin(id, profile.current_plan)
}
