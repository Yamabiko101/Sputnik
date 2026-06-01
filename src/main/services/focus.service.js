import {
  cancelFocusSession,
  startFocusSession
} from '../database/repositories/focus.repository.js'
import { listSettings } from '../database/repositories/settings.repository.js'
import { completeFocusSessionWorkflow } from '../workflows/completeFocusSession.workflow.js'

export function getFocusDefaults() {
  const settings = listSettings()
  return {
    focusMinutes: Number(settings.focus_minutes ?? 25),
    shortBreakMinutes: Number(settings.short_break_minutes ?? 5),
    longBreakMinutes: Number(settings.long_break_minutes ?? 15)
  }
}

export function startFocusSessionService(data) {
  return startFocusSession({
    ...data,
    plannedMinutes: Number(data?.plannedMinutes ?? getFocusDefaults().focusMinutes)
  })
}

export function completeFocusSessionService(data) {
  return completeFocusSessionWorkflow({
    ...data,
    plannedMinutes: Number(data?.plannedMinutes ?? getFocusDefaults().focusMinutes),
    actualMinutes: Number(data?.actualMinutes ?? data?.plannedMinutes ?? getFocusDefaults().focusMinutes)
  })
}

export function cancelFocusSessionService(id) {
  return cancelFocusSession(id)
}
