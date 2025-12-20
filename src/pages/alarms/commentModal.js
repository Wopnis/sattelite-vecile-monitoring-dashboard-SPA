import { el } from '../../utils/dom.js'
import { store } from '../../store.js'
import { showModal } from '../../utils/modal.js'

export function openCommentModal(alarm) {
  const lastComment =
    alarm.comments && alarm.comments.length
      ? alarm.comments[alarm.comments.length - 1].text
      : ''

  const textarea = el('textarea', {
    class: 'input',
    style: 'width:100%;min-height:120px',
  })
  textarea.value = lastComment

  const content = el('div', {}, [
    el('div', { style: 'margin-bottom:8px;color:#aaa' },
      'Комментарий к тревоге'
    ),
    textarea,
  ])

  showModal('Комментарий', content, {
    okText: 'Сохранить',
    cancelText: 'Отмена',
    onOk: () => {
      const text = textarea.value.trim()
      if (!text) return true

      const a = store.getState().alarms.find(x => x.id === alarm.id)
      if (!a) return true

      // ⬇️ КЛЮЧЕВОЙ МОМЕНТ
      if (!a.comments) a.comments = []

      if (a.comments.length) {
        // 🔁 ОБНОВЛЯЕМ последний комментарий
        a.comments[a.comments.length - 1] = {
          text,
          at: new Date().toISOString(),
        }
      } else {
        // ➕ СОЗДАЁМ новый
        a.comments.push({
          text,
          at: new Date().toISOString(),
        })
      }

      window.dispatchEvent(new Event('alarms:changed'))
      return true
    },
  })
}
