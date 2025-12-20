import { el } from '../../utils/dom.js'
import {
  store,
  setSelectedAlarm,
  getSelectedAlarm
} from '../../store.js'
import { required } from '../../utils/validation.js'
import { showModal } from '../../utils/modal.js'

function uid() {
  return 'a' + Math.random().toString(36).slice(2, 9)
}

export default function AlarmForm() {
  const root = el('div')
  root.id = 'alarm-form'

  root.innerHTML = `
    <div>
      <div class="form-row"><label>🚗 Марка ТС*:</label><input id="brand" class="input"></div>
      <div class="form-row"><label>🔑 VIN*:</label><input id="vin" class="input"></div>
      <div class="form-row"><label>🔖 Госномер:</label><input id="license" class="input"></div>
      <div class="form-row"><label>📄 Номер договора*:</label><input id="contract" class="input"></div>
      <div class="form-row"><label>👤 Лизингополучатель:</label><input id="lessee" class="input"></div>
      <div class="form-row"><label>❗ Сообщение*:</label><textarea id="message"></textarea></div>
      <div class="form-row"><label>💬 Комментарий:</label><textarea id="comment"></textarea></div>

      <div style="display:flex;gap:8px;margin-top:12px">
        <button id="save" class="btn primary">💾 Сохранить тревогу</button>
        <button id="clear" class="btn">🧹 Очистить</button>
      </div>
    </div>
  `

  const requiredFields = ['brand', 'vin', 'contract', 'message']

  function clearErrors() {
    requiredFields.forEach(id => {
      const el = root.querySelector('#' + id)
      el?.classList.remove('input-error')
      root.querySelector('#' + id + '_error')?.remove()
    })
  }

  function validate() {
    let ok = true
    requiredFields.forEach(id => {
      const input = root.querySelector('#' + id)
      if (!required(input.value)) {
        ok = false
        input.classList.add('input-error')
        if (!root.querySelector('#' + id + '_error')) {
          input.insertAdjacentHTML(
            'afterend',
            `<div id="${id}_error" class="input-error-text">Обязательное поле</div>`
          )
        }
      }
    })
    return ok
  }

  function clearForm() {
    root.querySelectorAll('input,textarea').forEach(i => (i.value = ''))
    clearErrors()
    setSelectedAlarm(null)
  }

  // =========================
  // СОХРАНЕНИЕ
  // =========================
  root.querySelector('#save').onclick = () => {
    clearErrors()

    // ❗ если выбрана тревога — форму НЕ используем для редактирования
    if (getSelectedAlarm()) {
      showModal(
        'Редактирование недоступно',
        'Редактирование тревоги выполняется через модальное окно.'
      )
      return
    }

    if (!validate()) {
      showModal('Ошибка', 'Заполните обязательные поля')
      return
    }

    const alarm = {
      id: uid(),
      brand: root.querySelector('#brand').value.trim(),
      vin: root.querySelector('#vin').value.trim(),
      license: root.querySelector('#license').value.trim(),
      contract: root.querySelector('#contract').value.trim(),
      lessee: root.querySelector('#lessee').value.trim(),
      message: root.querySelector('#message').value.trim(),
      timestamp: new Date().toISOString(),
      status: 'open',
      media: [],
      comments: []
    }

    const comment = root.querySelector('#comment').value.trim()
    if (comment) {
      alarm.comments.push({
        text: comment,
        at: new Date().toISOString()
      })
    }

    const duplicate = store.getState().alarms.find(
      a =>
        a.status === 'open' &&
        a.vin === alarm.vin &&
        a.contract === alarm.contract
    )

    if (duplicate) {
      showModal('Дубликат', 'Такая активная тревога уже существует')
      return
    }

    store.addAlarm(alarm)
    showModal('Готово', 'Тревога добавлена')
    clearForm()
    window.dispatchEvent(new Event('alarms:changed'))
  }

  root.querySelector('#clear').onclick = clearForm

  // =========================
  // ДВОЙНОЙ КЛИК → ПОДСТАНОВКА
  // =========================
  window.addEventListener('alarm:selected', () => {
    const a = getSelectedAlarm()
    if (!a) return

    root.querySelector('#brand').value = a.brand || ''
    root.querySelector('#vin').value = a.vin || ''
    root.querySelector('#license').value = a.license || ''
    root.querySelector('#contract').value = a.contract || ''
    root.querySelector('#lessee').value = a.lessee || ''
    root.querySelector('#message').value = a.message || ''

    const lastComment =
      a.comments && a.comments.length
        ? a.comments[a.comments.length - 1].text
        : ''
    root.querySelector('#comment').value = lastComment
  })

  return root
}
