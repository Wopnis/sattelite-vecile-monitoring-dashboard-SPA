import { el } from '../../utils/dom.js'
import AlarmForm from './alarmForm.js'
import AlarmList from './alarmList.js'

export default {
  render() {
    const container = el('div', { class: 'layout' })
    const left = el('div', { class: 'left' })
    const right = el('div', { class: 'right' })

    left.appendChild(AlarmForm())
    right.appendChild(AlarmList())

    container.appendChild(left)
    container.appendChild(right)
    return container
  },
}
