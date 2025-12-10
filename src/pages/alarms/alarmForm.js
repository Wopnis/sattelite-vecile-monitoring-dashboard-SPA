import { el } from '../../utils/dom.js'
import { store } from '../../store.js'
import { required } from '../../utils/validation.js'
import { showModal } from '../../utils/modal.js'

function uid() {
  return 'a' + Math.random().toString(36).slice(2, 9)
}

export default function AlarmForm() {
  const root = el('div')
  root.id = 'alarm-form' // <- важно, чтобы другие модули могли найти форму

  root.innerHTML = `
    <div>
      <div class="form-row"><label>🚗 Марка ТС*:</label><input id="brand" class="input"></div>
      <div class="form-row"><label>🔑 VIN*:</label><input id="vin" class="input"></div>
      <div class="form-row"><label>🔖 Госномер:</label><input id="license" class="input"></div>
      <div class="form-row"><label>📄 Номер договора*:</label><input id="contract" class="input"></div>
      <div class="form-row"><label>👤 Лизингополучатель:</label><input id="lessee" class="input"></div>
      <div class="form-row"><label>❗ Сообщение*:</label><textarea id="message"></textarea></div>
      <div class="form-row"><label>💬 Комментарий:</label><textarea id="comment"></textarea></div>

      <div style="display:flex;gap:8px;margin-top:10px">
        <button id="save" class="btn primary">💾 Сохранить тревогу</button>
        <button id="clear" class="btn" style="background:#ff8a3c;color:#fff">🧹 Очистить форму</button>
      </div>
    </div>
  `

  const requiredFields = [
    { id: 'brand', label: 'Марка' },
    { id: 'vin', label: 'VIN' },
    { id: 'contract', label: 'Договор' },
    { id: 'message', label: 'Сообщение' }
  ]

  function clearErrors() {
    requiredFields.forEach(f => {
      const input = root.querySelector('#' + f.id)
      if (!input) return
      input.classList.remove('input-error')
      const err = root.querySelector('#' + f.id + '_error')
      if (err) err.remove()
    })
  }

  function validateAndMark() {
    let ok = true
    requiredFields.forEach(f => {
      const input = root.querySelector('#' + f.id)
      const val = (input && input.value) ? input.value : ''
      const errId = f.id + '_error'
      let errEl = root.querySelector('#' + errId)

      if (!required(val)) {
        ok = false
        if (input) input.classList.add('input-error')
        if (!errEl) {
          errEl = el('div', { id: errId, class: 'input-error-text' })
          errEl.textContent = `Заполните поле: ${f.label}`
          if (input) input.insertAdjacentElement('afterend', errEl)
        } else {
          errEl.textContent = `Заполните поле: ${f.label}`
        }
      } else {
        if (input) input.classList.remove('input-error')
        if (errEl) errEl.remove()
      }
    })
    return ok
  }

  root.querySelector('#save').addEventListener('click', () => {
    clearErrors()
    const ok = validateAndMark()
    if (!ok) {
      showModal('⚠️ Не все обязательные поля заполнены', 'Пожалуйста заполните выделенные поля перед сохранением.')
      return
    }

    // сохранение
    const brand = root.querySelector('#brand').value.trim()
    const vin = root.querySelector('#vin').value.trim()
    const contract = root.querySelector('#contract').value.trim()

    const alarm = {
      id: uid(),
      brand,
      vin,
      license: root.querySelector('#license').value.trim(),
      contract,
      lessee: root.querySelector('#lessee').value.trim(),
      message: root.querySelector('#message').value.trim(),
      comment: root.querySelector('#comment').value.trim(),
      timestamp: new Date().toISOString(),
      status: 'open',
      media: [],
      comments: []
    }

    store.addAlarm(alarm)

    // добавить в гараж (если нет)
    const existing = (store.getState().garage || []).find(g => g.vin === alarm.vin)
    if (!existing) {
      store.addToGarage({
        id: 'g' + alarm.vin,
        brand: alarm.brand,
        vin: alarm.vin,
        license: alarm.license,
        contract: alarm.contract,
        lessee: alarm.lessee,
        year: '',
        color: '',
        type: '',
        notes: '',
        media: []
      })
      window.dispatchEvent(new Event('garage:changed'))
    }

    showModal('🟢 Тревога сохранена', 'Запись успешно добавлена.')
    root.querySelectorAll('input,textarea').forEach(i => i.value = '')
    window.dispatchEvent(new Event('alarms:changed'))
  })

  root.querySelector('#clear').addEventListener('click', () => {
    root.querySelectorAll('input,textarea').forEach(i => i.value = '')
    clearErrors()
  })

  return root
}
