let state = {
  alarms: [],
  garage: [],
}

let selectedAlarm = null

export const store = {
  getState() {
    return state
  },

  setState(newState) {
    state = newState
  },

  addAlarm(alarm) {
    state.alarms.push(alarm)
  },

  updateAlarm(id, patch) {
    const a = state.alarms.find(x => x.id === id)
    if (!a) return
    Object.assign(a, patch)
  },

  addComment(id, comment) {
    const a = state.alarms.find(x => x.id === id)
    if (!a) return
    a.comments = a.comments || []
    a.comments.push(comment)
  },

  addMediaToAlarm(id, mediaArr) {
    const a = state.alarms.find(x => x.id === id)
    if (!a) return
    a.media = a.media || []
    a.media.push(...mediaArr)
  },

  addToGarage(v) {
    state.garage.push(v)
  },

  updateVehicle(id, patch) {
    const v = state.garage.find(x => x.id === id)
    if (!v) return
    Object.assign(v, patch)
  }
}

// ✅ ГЛОБАЛЬНО ВЫБРАННАЯ ТРЕВОГА
export function setSelectedAlarm(alarm) {
  selectedAlarm = alarm
}

export function getSelectedAlarm() {
  return selectedAlarm
}
