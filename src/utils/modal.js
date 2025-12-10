// src/utils/modal.js
export function showModal(title = 'Сообщение', html = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    const box = document.createElement('div')
    box.className = 'modal'

    const h = document.createElement('h3')
    h.textContent = title

    const body = document.createElement('div')
    body.className = 'modal-body'
    if (typeof html === 'string') body.innerHTML = html
    else if (html instanceof Node) body.appendChild(html)

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const ok = document.createElement('button')
    ok.className = 'btn primary'
    ok.textContent = 'OK'
    ok.onclick = () => {
      overlay.remove()
      resolve(true)
    }

    const cancel = document.createElement('button')
    cancel.className = 'btn ghost'
    cancel.textContent = 'Отмена'
    cancel.onclick = () => {
      overlay.remove()
      resolve(false)
    }

    actions.appendChild(cancel)
    actions.appendChild(ok)

    box.appendChild(h)
    box.appendChild(body)
    box.appendChild(actions)
    overlay.appendChild(box)
    document.body.appendChild(overlay)
  })
}

// input modal: returns string or null if cancelled
export function showInputModal(title = 'Ввод', placeholder = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    const box = document.createElement('div')
    box.className = 'modal'

    const h = document.createElement('h3')
    h.textContent = title

    const body = document.createElement('div')
    body.className = 'modal-body'
    const input = document.createElement('textarea')
    input.style.minHeight = '120px'
    input.style.width = '100%'
    input.placeholder = placeholder
    body.appendChild(input)

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const ok = document.createElement('button')
    ok.className = 'btn primary'
    ok.textContent = 'Сохранить'
    ok.onclick = () => {
      const val = input.value
      overlay.remove()
      resolve(val)
    }

    const cancel = document.createElement('button')
    cancel.className = 'btn ghost'
    cancel.textContent = 'Отмена'
    cancel.onclick = () => {
      overlay.remove()
      resolve(null)
    }

    actions.appendChild(cancel)
    actions.appendChild(ok)

    box.appendChild(h)
    box.appendChild(body)
    box.appendChild(actions)
    overlay.appendChild(box)
    document.body.appendChild(overlay)

    setTimeout(() => input.focus(), 60)
  })
}
