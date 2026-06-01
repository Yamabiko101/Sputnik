import { contextBridge, ipcRenderer } from 'electron'

const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload)

contextBridge.exposeInMainWorld('sputnik', {
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
  pets: {
    getCurrent: () => invoke('pets:getCurrent')
  },
  achievements: {
    getAll: () => invoke('achievements:getAll')
  },
  settings: {
    getAll: () => invoke('settings:getAll'),
    set: (key, value) => invoke('settings:set', { key, value })
  },
  pro: {
    activateSimulation: () => invoke('pro:activateSimulation')
  }
})
