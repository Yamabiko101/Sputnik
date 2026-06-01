import { activateProPlan, listSettings, setSetting } from '../database/repositories/settings.repository.js'

export function getSettings() {
  return listSettings()
}

export function setSettingService(key, value) {
  if (!key) throw new Error('Setting key is required.')
  return setSetting(key, value)
}

export function activateProSimulationService() {
  return activateProPlan()
}
