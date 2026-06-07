import { contextBridge, ipcRenderer } from 'electron'

const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload)

contextBridge.exposeInMainWorld('sputnik', {
  auth: {
    listProfiles: () => invoke('auth:listProfiles'),
    getCurrentProfile: () => invoke('auth:getCurrentProfile'),
    createProfile: (data) => invoke('auth:createProfile', data),
    login: (data) => invoke('auth:login', data),
    logout: () => invoke('auth:logout'),
    updateProfile: (data) => invoke('auth:updateProfile', data),
    changePassword: (data) => invoke('auth:changePassword', data),
    deleteProfile: (data) => invoke('auth:deleteProfile', data)
  },
  missions: {
    getAll: () => invoke('missions:getAll'),
    getById: (id) => invoke('missions:getById', id),
    create: (data) => invoke('missions:create', data),
    update: (id, data) => invoke('missions:update', { id, data }),
    remove: (id) => invoke('missions:remove', id)
  },
  tasks: {
    create: (data) => invoke('tasks:create', data),
    update: (id, data) => invoke('tasks:update', { id, data }),
    complete: (id) => invoke('tasks:complete', id),
    remove: (id) => invoke('tasks:remove', id)
  },
  notes: {
    getAll: () => invoke('notes:getAll'),
    create: (data) => invoke('notes:create', data),
    update: (id, data) => invoke('notes:update', { id, data }),
    remove: (id) => invoke('notes:remove', id)
  },
  focus: {
    getDefaults: () => invoke('focus:getDefaults'),
    startSession: (data) => invoke('focus:startSession', data),
    completeSession: (data) => invoke('focus:completeSession', data),
    cancelSession: (id) => invoke('focus:cancelSession', id)
  },
  stats: {
    getDashboard: () => invoke('stats:getDashboard'),
    getWeekly: () => invoke('stats:getWeekly')
  },
  activity: {
    getRecent: (limit) => invoke('activity:getRecent', limit)
  },
  pets: {
    getCurrent: () => invoke('pets:getCurrent'),
    getSkins: () => invoke('pets:getSkins'),
    selectSkin: (id) => invoke('pets:selectSkin', id)
  },
  achievements: {
    getAll: () => invoke('achievements:getAll')
  },
  settings: {
    getAll: () => invoke('settings:getAll'),
    set: (key, value) => invoke('settings:set', { key, value })
  },
  mentor: {
    getStatus: () => invoke('mentor:getStatus'),
    listSessions: () => invoke('mentor:listSessions'),
    createSession: (data) => invoke('mentor:createSession', data),
    getSession: (id) => invoke('mentor:getSession', id),
    deleteSession: (id) => invoke('mentor:deleteSession', id),
    saveApiKey: (apiKey) => invoke('mentor:saveApiKey', { apiKey }),
    clearApiKey: () => invoke('mentor:clearApiKey'),
    sendMessage: (data) => invoke('mentor:sendMessage', data)
  },
  pro: {
    getProfile: () => invoke('pro:getProfile'),
    activateSimulation: () => invoke('pro:activateSimulation')
  }
})
