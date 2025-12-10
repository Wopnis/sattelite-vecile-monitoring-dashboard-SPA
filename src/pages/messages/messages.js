import { el } from '../../utils/dom.js'
import { getTemplates } from '../../modules/templates/templates.store.js'

export default {
  render() {
    const root = el('div', { class: 'messages-page' })

    const title = el('h2', {}, '📨 Сообщения')

    // ✅ Блок данных выбранной тревоги
    const infoBlock = el('div', { class: 'card-preview' },
      el('div', { class: 'kv' }, el('b', {}, 'VIN:'), el('span', { id: 'msg_vin' }, '—')),
      el('div', { class: 'kv' }, el('b', {}, 'Договор:'), el('span', { id: 'msg_contract' }, '—')),
      el('div', { class: 'kv' }, el('b', {}, 'Марка:'), el('span', { id: 'msg_brand' }, '—'))
    )

    // ✅ Шаблоны
    const templates = getTemplates()

    const tplSelect = el('select', { class: 'template-select' })
    tplSelect.appendChild(el('option', { value: '' }, '— Выберите шаблон —'))

    templates.forEach(t => {
      tplSelect.appendChild(
        el('option', { value: t.id }, t.title)
      )
    })

    // ✅ Кнопки
    const buildBtn = el('button', { class: 'btn primary' }, '📨 Сформировать сообщение')
    const copyBtn = el('button', { class: 'btn success' }, '📋 Копировать и очистить')
    const clearBtn = el('button', { class: 'btn ghost' }, '🧹 Очистить')

    const textarea = el('textarea', {
      class: 'message-editor',
      placeholder: 'Текст сообщения...'
    })

    // ✅ Текущая выбранная тревога
    let currentAlarm = null

    // ✅ Подстановка переменных в шаблон
    function applyTemplate(text, alarm) {
      if (!text) return ''
      const a = alarm || {}
      return text
        .replaceAll('{{VIN}}', a.vin || '—')
        .replaceAll('{{DOGOVOR}}', a.contract || '—')
        .replaceAll('{{MARKA}}', a.brand || '—')
        .replaceAll('{{LP}}', a.lessee || '—')
    }

    // ✅ Выбор шаблона
    tplSelect.onchange = () => {
      if (!tplSelect.value) return
      const tpl = templates.find(t => t.id === tplSelect.value)
      textarea.value = applyTemplate(tpl?.text || '', currentAlarm)
    }

    // ✅ Кнопка "Сформировать сообщение"
    buildBtn.onclick = () => {
      if (!tplSelect.value) {
        alert('Выберите шаблон')
        return
      }
      const tpl = templates.find(t => t.id === tplSelect.value)
      textarea.value = applyTemplate(tpl?.text || '', currentAlarm)
    }

    // ✅ Копировать и очистить
    copyBtn.onclick = async () => {
      if (!textarea.value.trim()) return
      try {
        await navigator.clipboard.writeText(textarea.value)
        textarea.value = ''
        alert('Скопировано в буфер обмена')
      } catch {
        alert('Не удалось скопировать')
      }
    }

    // ✅ Очистить вручную
    clearBtn.onclick = () => {
      textarea.value = ''
    }

    // ✅ Получение данных по двойному клику из тревог
    window.addEventListener('alarm:selected', (e) => {
      const a = e.detail
      currentAlarm = a

      const set = (id, val) => {
        const el = document.getElementById(id)
        if (el) el.textContent = val || '—'
      }

      set('msg_vin', a.vin)
      set('msg_contract', a.contract)
      set('msg_brand', a.brand)

      // если шаблон уже выбран — сразу подставляем
      if (tplSelect.value) {
        const tpl = templates.find(t => t.id === tplSelect.value)
        textarea.value = applyTemplate(tpl?.text || '', currentAlarm)
      }
    })

    // ✅ Сборка страницы
    root.append(
      title,
      infoBlock,
      el('div', { class: 'form-row' }, el('label', {}, 'Выберите шаблон:'), tplSelect),
      el('div', { class: 'row' }, buildBtn, copyBtn, clearBtn),
      textarea
    )

    return root
  }
}
