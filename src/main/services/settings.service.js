import {
  getUserProfile,
  listSettings,
  setSetting
} from '../database/repositories/settings.repository.js'
import { activateProPlanWorkflow } from '../workflows/activateProPlan.workflow.js'
import { syncActiveProfilePlan } from './auth.service.js'

const NUMERIC_SETTING_LIMITS = {
  focus_minutes: { min: 1, max: 120 },
  short_break_minutes: { min: 1, max: 30 },
  long_break_minutes: { min: 1, max: 60 }
}

export function getSettings() {
  return listSettings()
}

export function setSettingService(key, value) {
  if (!key) throw new Error('Setting key is required.')
  if (NUMERIC_SETTING_LIMITS[key]) {
    const numberValue = Number(value)
    const { min, max } = NUMERIC_SETTING_LIMITS[key]
    if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
      throw new Error(`${key} must be an integer between ${min} and ${max}.`)
    }
    return setSetting(key, numberValue)
  }
  return setSetting(key, value)
}

export function activateProSimulationService() {
  const profile = activateProPlanWorkflow()
  syncActiveProfilePlan(profile.current_plan)
  return profile
}

export function getUserProfileService() {
  return getUserProfile()
}
