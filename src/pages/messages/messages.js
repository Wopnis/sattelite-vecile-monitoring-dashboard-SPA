import { el } from '../../utils/dom.js'
import { getTemplates } from '../../modules/templates/templates.store.js'
import { getSelectedAlarm, setSelectedAlarm } from '../../store.js'

const MessagesPage = {
  render() {
    const root = el('div', { class: 'messages-page' })

    const title = el('h2', {}, '📨 Сообщения')

    // ===== БЛОК ВЫБРАННОЙ ТРЕВОГИ =====
    const info = el('div', { class: 'current-alarm-box' })

    const brandEl = el('span', { class: 'alarm-value' }, '—')
    const vinEl = el('span', { class: 'alarm-value' }, '—')
    const contractEl = el('span', { class: 'alarm-value' }, '—')

    info.append(
      el('div', {}, ['Марка: ', brandEl]),
      el('div', {}, ['VIN: ', vinEl]),
      el('div', {}, ['Договор: ', contractEl])
    )

    // ===== ШАБЛОНЫ =====
    const templates = getTemplates()

    const select = el(
      'select',
      { class: 'input' },
      el('option', { value: '' }, '— Выберите шаблон —'),
      ...templates.map(t =>
        el('option', { value: t.id }, t.title)
      )
    )

    const textarea = el('textarea', {
      class: 'message-textarea',
      rows: 10,
      placeholder: 'Текст сообщения...',
    })

    // ===== КНОПКИ =====
    const btnGenerate = el('button', { class: 'btn primary' }, '📨 Сформировать сообщение')
    const btnClear = el('button', { class: 'btn ghost' }, '🧹 Очистить')

    const buttons = el('div', { class: 'message-buttons' }, btnGenerate, btnClear)

    // ===== ЛОГИКА =====
    let currentAlarm = null

    function applyTemplate(text, alarm) {
      if (!text || !alarm) return text || ''

      return text
        .replace(/ТС\s[_\s]+/gi, `ТС ${alarm.brand || '—'} `)
        .replace(/VIN\s[_\s]+/gi, `VIN ${alarm.vin || '—'} `)
        .replace(/ДЛ\s[_\s]+/gi, `ДЛ ${alarm.contract || '—'} `)
        .replace(/ЛП\s[_\s]+/gi, `ЛП ${alarm.lessee || '—'} `)
    }


    function syncFromStore() {
      const a = getSelectedAlarm()
      if (!a) return

      currentAlarm = a

      brandEl.textContent = a.brand || '—'
      vinEl.textContent = a.vin || '—'
      contractEl.textContent = a.contract || '—'

      const tpl = templates.find(t => t.id === select.value)
      if (tpl) {
        textarea.value = applyTemplate(tpl.text, currentAlarm)
      }
    }

    select.onchange = () => {
      const tpl = templates.find(t => t.id === select.value)
      if (tpl) {
        textarea.value = applyTemplate(tpl.text, currentAlarm)
      }
    }

    btnGenerate.onclick = () => {
      if (!currentAlarm) {
        alert('Сначала выберите тревогу двойным кликом')
        return
      }

      const tpl = templates.find(t => t.id === select.value)
      if (!tpl) {
        alert('Выберите шаблон')
        return
      }

      textarea.value = applyTemplate(tpl.text, currentAlarm)
    }

    btnClear.onclick = () => {
      textarea.value = ''
      select.value = ''
      brandEl.textContent = '—'
      vinEl.textContent = '—'
      contractEl.textContent = '—'
      setSelectedAlarm(null)
    }

    // ✅ СЛУШАЕМ ДВОЙНЫЕ КЛИКИ ИЗ ТРЕВОГ
    window.addEventListener('alarm:selected', () => {
      syncFromStore()
    })

    // если тревога уже выбрана
    syncFromStore()

    // ===== СБОРКА =====
    root.append(
      title,
      el('h4', {}, 'Обрабатываемая тревога'),
      info,
      el('h4', {}, 'Шаблоны сообщений'),
      select,
      textarea,
      buttons
    )

    return root
  }
}

export default MessagesPage
