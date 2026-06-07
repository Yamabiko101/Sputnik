import { ipcMain } from 'electron'
import {
  changePasswordService,
  createProfileService,
  deleteProfileService,
  getCurrentProfileService,
  listProfilesService,
  loginProfileService,
  logoutProfileService,
  updateProfileService
} from '../services/auth.service.js'
import {
  createMissionService,
  getAllMissions,
  getMissionById,
  removeMissionService,
  updateMissionService
} from '../services/mission.service.js'
import {
  completeTaskService,
  createTaskService,
  removeTaskService,
  updateTaskService
} from '../services/task.service.js'
import {
  createNoteService,
  getAllNotes,
  removeNoteService,
  updateNoteService
} from '../services/note.service.js'
import {
  cancelFocusSessionService,
  completeFocusSessionService,
  getFocusDefaults,
  startFocusSessionService
} from '../services/focus.service.js'
import { getDashboardStats, getWeeklyStats } from '../services/stats.service.js'
import { getCurrentPetService } from '../services/pet.service.js'
import {
  getPetSkinsService,
  selectPetSkinService
} from '../services/pet.service.js'
import {
  activateProSimulationService,
  getUserProfileService,
  getSettings,
  setSettingService
} from '../services/settings.service.js'
import { getAchievements } from '../services/achievement.service.js'
import { getRecentActivity } from '../services/activity.service.js'

function handle(channel, listener) {
  ipcMain.handle(channel, (_event, payload) => listener(payload))
}

export function registerIpcHandlers() {
  handle('auth:listProfiles', () => listProfilesService())
  handle('auth:getCurrentProfile', () => getCurrentProfileService())
  handle('auth:createProfile', (data) => createProfileService(data))
  handle('auth:login', (data) => loginProfileService(data))
  handle('auth:logout', () => logoutProfileService())
  handle('auth:updateProfile', (data) => updateProfileService(data))
  handle('auth:changePassword', (data) => changePasswordService(data))
  handle('auth:deleteProfile', (data) => deleteProfileService(data))

  handle('missions:getAll', () => getAllMissions())
  handle('missions:getById', (id) => getMissionById(id))
  handle('missions:create', (data) => createMissionService(data))
  handle('missions:update', ({ id, data }) => updateMissionService(id, data))
  handle('missions:remove', (id) => removeMissionService(id))

  handle('tasks:create', (data) => createTaskService(data))
  handle('tasks:update', ({ id, data }) => updateTaskService(id, data))
  handle('tasks:complete', (id) => completeTaskService(id))
  handle('tasks:remove', (id) => removeTaskService(id))

  handle('notes:getAll', () => getAllNotes())
  handle('notes:create', (data) => createNoteService(data))
  handle('notes:update', ({ id, data }) => updateNoteService(id, data))
  handle('notes:remove', (id) => removeNoteService(id))

  handle('focus:getDefaults', () => getFocusDefaults())
  handle('focus:startSession', (data) => startFocusSessionService(data))
  handle('focus:completeSession', (data) => completeFocusSessionService(data))
  handle('focus:cancelSession', (id) => cancelFocusSessionService(id))

  handle('stats:getDashboard', () => getDashboardStats())
  handle('stats:getWeekly', () => getWeeklyStats())
  handle('activity:getRecent', (limit) => getRecentActivity(limit))
  handle('pets:getCurrent', () => getCurrentPetService())
  handle('pets:getSkins', () => getPetSkinsService())
  handle('pets:selectSkin', (id) => selectPetSkinService(id))
  handle('achievements:getAll', () => getAchievements())
  handle('settings:getAll', () => getSettings())
  handle('settings:set', ({ key, value }) => setSettingService(key, value))
  handle('pro:getProfile', () => getUserProfileService())
  handle('pro:activateSimulation', () => activateProSimulationService())
}
