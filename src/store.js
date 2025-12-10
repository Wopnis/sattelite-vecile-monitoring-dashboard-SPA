// simple client-side store using localStorage
const KEY = 'monitoring_store_v1'

function load(){
  const raw = localStorage.getItem(KEY)
  if(!raw) return {alarms:[], garage:[]}
  return JSON.parse(raw)
}
function save(state){
  localStorage.setItem(KEY, JSON.stringify(state))
}

export const store = (()=>{
  let state = load()
  return {
    getState(){ return state },
    addAlarm(a){ state.alarms = state.alarms || []; state.alarms.push(a); save(state) },
    updateAlarm(id, patch){
      state.alarms = state.alarms || []
      state.alarms = state.alarms.map(x=> x.id===id ? {...x, ...patch} : x)
      save(state)
    },
    addMediaToAlarm(id, media) {
      state.alarms = state.alarms || []
      const a = state.alarms.find(x=>x.id===id)
      if(a){
        a.media = a.media || []
        // media can be array or single
        if(Array.isArray(media)) a.media.push(...media)
        else a.media.push(media)
        save(state)
      }
    },
    addComment(id, comment){
      state.alarms = state.alarms || []
      const a = state.alarms.find(x=>x.id===id)
      if(a){
        a.comments = a.comments || []
        a.comments.push(comment)
        save(state)
      }
    },
    addToGarage(car){
      state.garage = state.garage || []
      state.garage.push(car)
      save(state)
    },
    getGarage(){
      return state.garage || []
    },
    updateVehicle(id, patch) {
      state.garage = state.garage || []
      state.garage = state.garage.map(v => v.id === id ? {...v, ...patch} : v)
      save(state)
    },
    findVehicleByVIN(vin) {
      state.garage = state.garage || []
      return state.garage.find(v => v.vin === vin)
    }
  }
})()
