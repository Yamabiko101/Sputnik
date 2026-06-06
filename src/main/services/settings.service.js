import {
  getUserProfile,
  listSettings,
  setSetting
} from '../database/repositories/settings.repository.js'
import { activateProPlanWorkflow } from '../workflows/activateProPlan.workflow.js'

export function getSettings() {
  return listSettings()
}

export function setSettingService(key, value) {
  if (!key) throw new Error('Setting key is required.')
  return setSetting(key, value)
}

export function activateProSimulationService() {
  return activateProPlanWorkflow()
}

export function getUserProfileService() {
  return getUserProfile()
}
