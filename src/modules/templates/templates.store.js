import { defaultTemplates } from './templates.defaults.js'

const KEY = 'user_templates'

export function getTemplates() {
  const saved = localStorage.getItem(KEY)
  return saved ? JSON.parse(saved) : defaultTemplates
}

export function saveTemplates(templates) {
  localStorage.setItem(KEY, JSON.stringify(templates))
}
