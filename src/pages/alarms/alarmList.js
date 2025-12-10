import { el } from '../../utils/dom.js'
import { store } from '../../store.js'
import { showModal, showInputModal } from '../../utils/modal.js'

function formatHtml(a) {
  return `
    <div style="font-size:14px">
      <div>🕒 <b>Время:</b> ${new Date(a.timestamp).toLocaleString()}</div>
      <div>🚗 <b>Марка:</b> ${a.brand || '—'}</div>
      <div>🔑 <b>VIN:</b> ${a.vin || '—'}</div>
      <div>📄 <b>Договор:</b> ${a.contract || '—'}</div>
      <div style="margin-top:8px"><b>❗ Сообщение:</b><div style="margin-left:6px">${(a.message||'—')}</div></div>
    </div>
  `
}

function renderItem(a) {
  const node = el('div', { class: 'alarm-item ' + (a.status === 'closed' ? 'closed' : '') },
    el('div', {}, [
      el('div', { class: 'small' }, `${a.brand || '—'} · ${a.license || ''}`),
      el('div', { class: 'small' }, (a.message || '').slice(0, 140))
    ]),
    el('div', {}, [
      el('button', { class: 'btn ghost', onClick: (e) => {
        e.stopPropagation()
        showModal('Тревога', formatHtml(a))
      } }, '🔍'),
      a.status !== 'closed' ? el('button', { class: 'btn warn', onClick: async (e) => {
        e.stopPropagation()
        const ok = await showModal('Закрыть тревогу', 'Подтвердите закрытие тревоги')
        if (ok) {
          store.updateAlarm(a.id, { status: 'closed', closed_at: new Date().toISOString() })
          window.dispatchEvent(new Event('alarms:changed'))
        }
      } }, 'Закрыть') : el('button', { class: 'btn ghost', onClick: async (e) => {
        e.stopPropagation()
        const txt = await showInputModal('Добавить комментарий', 'Комментарий')
        if (txt && txt.trim()) {
          store.addComment(a.id, { text: txt.trim(), at: new Date().toISOString() })
          window.dispatchEvent(new Event('alarms:changed'))
        }
      } }, 'Комментарий')
    ])
  )
  node.dataset.id = a.id
  return node
}

export default function AlarmList() {
  const wrap = el('div')
  const list = el('div', { class: 'alarm-list' })
  wrap.appendChild(list)

  function redraw() {
    list.innerHTML = ''
    const alarms = (store.getState().alarms || []).slice().reverse()
    alarms.forEach(a => list.appendChild(renderItem(a)))
  }

  // double click: dispatch alarm:selected to global window
  list.addEventListener('dblclick', (e) => {
    const row = e.target.closest('.alarm-item')
    if (!row) return
    const id = row.dataset.id
    const a = store.getState().alarms.find(x => x.id === id)
    if (!a) return

    // put into left form (if exists)
    const formRoot = document.getElementById('alarm-form')
    if (formRoot) {
      const setIf = (sel, v) => { const el = formRoot.querySelector(sel); if (el) el.value = v || '' }
      setIf('#brand', a.brand); setIf('#license', a.license); setIf('#vin', a.vin)
      setIf('#contract', a.contract); setIf('#lessee', a.lessee); setIf('#message', a.message)
    }

    // broadcast globally for messages tab
    window.dispatchEvent(new CustomEvent('alarm:selected', { detail: a }))
  })

  // right click: context menu simplified here: add comment or media
  list.addEventListener('contextmenu', (e) => {
    const row = e.target.closest('.alarm-item')
    if (!row) return
    e.preventDefault()
    const id = row.dataset.id
    const a = store.getState().alarms.find(x => x.id === id)
    if (!a) return

    // small custom menu via prompt for simplicity
    const choice = prompt('Выберите: 1-Добавить комментарий, 2-Добавить медиа')
    if (choice === '1') {
      showInputModal('Комментарий', 'Введите текст').then(txt => {
        if (txt && txt.trim()) {
          store.addComment(id, { text: txt.trim(), at: new Date().toISOString() })
          window.dispatchEvent(new Event('alarms:changed'))
        }
      })
    } else if (choice === '2') {
      const input = document.createElement('input')
      input.type = 'file'; input.accept = 'image/*,video/*'; input.multiple = true
      input.onchange = () => {
        const files = Array.from(input.files)
        const readers = files.map(f => new Promise(res => {
          const r = new FileReader()
          r.onload = () => res(r.result)
          r.readAsDataURL(f)
        }))
        Promise.all(readers).then(dataUrls => {
          store.addMediaToAlarm(id, dataUrls)
          window.dispatchEvent(new Event('alarms:changed'))
        })
      }
      input.click()
    }
  })

  window.addEventListener('alarms:changed', redraw)
  redraw()
  return wrap
}
