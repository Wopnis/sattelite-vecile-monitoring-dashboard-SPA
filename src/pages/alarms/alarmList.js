import { el } from '../../utils/dom.js'
import { store, setSelectedAlarm } from '../../store.js'
import { showModal, showInputModal } from '../../utils/modal.js'
import { openCommentModal } from './commentModal.js'


/* =========================
   PREVIEW
========================= */
function alarmPreview(a) {
  return `
    <div style="font-size:14px">
      <div>🕒 <b>Время:</b> ${new Date(a.timestamp).toLocaleString()}</div>
      <div>🚗 <b>Марка:</b> ${a.brand || '—'}</div>
      <div>🔑 <b>VIN:</b> ${a.vin || '—'}</div>
      <div>📄 <b>Договор:</b> ${a.contract || '—'}</div>
      <div style="margin-top:8px"><b>❗ Сообщение:</b></div>
      <div style="margin-left:6px">${a.message || '—'}</div>
    </div>
  `
}

/* =========================
   ITEM
========================= */
function renderItem(a) {
  const node = el(
    'div',
    { class: `alarm-item ${a.status === 'closed' ? 'closed' : 'open'}` },

    el('div', { class: 'alarm-main' }, [
      el('div', { class: 'small' }, `${a.brand || '—'} · ${a.license || ''}`),
      el('div', { class: 'small' }, (a.message || '').slice(0, 120)),
    ]),

    el('div', { class: 'alarm-actions' }, [
      el('button', {
        class: 'btn ghost',
        onClick: e => {
          e.stopPropagation()
          showModal('Тревога', alarmPreview(a))
        },
      }, '🔍'),

      a.status === 'open'
        ? el('button', {
            class: 'btn warn',
            onClick: async e => {
              e.stopPropagation()
              const ok = await showModal(
                'Закрыть тревогу',
                'Подтвердите закрытие тревоги'
              )
              if (ok) {
                store.updateAlarm(a.id, {
                  status: 'closed',
                  closed_at: new Date().toISOString(),
                })
                window.dispatchEvent(new Event('alarms:changed'))
              }
            },
          }, 'Закрыть')
        : null,
    ])
  )

  node.dataset.id = a.id
  return node
}

/* =========================
   CONTEXT MENU
========================= */
function showContextMenu(x, y, items) {
  const menu = el('div', { class: 'context-menu' })

  items.forEach(i => {
    const row = el('div', { class: 'context-item' }, i.label)
    row.onclick = () => {
      i.action()
      menu.remove()
    }
    menu.appendChild(row)
  })

  menu.style.left = x + 'px'
  menu.style.top = y + 'px'
  document.body.appendChild(menu)

  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true })
  })
}

/* =========================
   MAIN
========================= */
export default function AlarmList() {
  const wrap = el('div')
  const list = el('div', { class: 'alarm-list' })
  wrap.appendChild(list)

  function redraw() {
    list.innerHTML = ''
    const alarms = store.getState().alarms.slice().reverse()
    alarms.forEach(a => list.appendChild(renderItem(a)))
  }

  /* ===== DOUBLE CLICK ===== */
  list.addEventListener('dblclick', e => {
    const row = e.target.closest('.alarm-item')
    if (!row) return

    const alarm = store.getState().alarms.find(a => a.id === row.dataset.id)
    if (!alarm) return

    // только подстановка данных
    setSelectedAlarm(alarm)
    window.dispatchEvent(new Event('alarm:selected'))
  })

  /* ===== RIGHT CLICK ===== */
  list.addEventListener('contextmenu', e => {
    const row = e.target.closest('.alarm-item')
    if (!row) return
    e.preventDefault()

    const alarm = store.getState().alarms.find(a => a.id === row.dataset.id)
    if (!alarm) return

    const items = []

    // 💬 КОММЕНТАРИЙ — ВСЕГДА
    items.push({
      label: '💬 Комментарий',
      action: () => openCommentModal(alarm)
    })

    /* редактирование — только активная */
    if (alarm.status === 'open') {
      items.push({
        label: '✏️ Редактировать тревогу',
        action: async () => {
          const text = await showInputModal(
            'Редактирование тревоги',
            'Сообщение',
            alarm.message || ''
          )
          if (text && text.trim()) {
            store.updateAlarm(alarm.id, { message: text.trim() })
            window.dispatchEvent(new Event('alarms:changed'))
          }
        },
      })
    }

    /* комментарий — всегда */
    items.push({
      label: '💬 Добавить комментарий',
      action: async () => {
        const last =
          alarm.comments && alarm.comments.length
            ? alarm.comments[alarm.comments.length - 1].text
            : ''

        const txt = await showInputModal(
          'Комментарий',
          'Комментарий',
          last
        )

        if (txt && txt.trim()) {
          store.addComment(alarm.id, {
            text: txt.trim(),
            at: new Date().toISOString(),
          })
          window.dispatchEvent(new Event('alarms:changed'))
        }
      },
    })

    /* медиа — всегда */
    items.push({
      label: '📎 Добавить медиа',
      action: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*,video/*'
        input.multiple = true
        input.onchange = () => {
          const files = Array.from(input.files)
          const readers = files.map(
            f =>
              new Promise(res => {
                const r = new FileReader()
                r.onload = () => res(r.result)
                r.readAsDataURL(f)
              })
          )
          Promise.all(readers).then(data => {
            store.addMediaToAlarm(alarm.id, data)
            window.dispatchEvent(new Event('alarms:changed'))
          })
        }
        input.click()
      },
    })

    showContextMenu(e.pageX, e.pageY, items)
  })

  window.addEventListener('alarms:changed', redraw)
  redraw()
  return wrap
}
