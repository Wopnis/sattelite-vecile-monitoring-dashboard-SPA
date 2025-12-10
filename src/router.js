import AlarmsPage from './pages/alarms/alarms.js'
import MessagesPage from './pages/messages/messages.js'
import GaragePage from './pages/garage/garage.js'

const routes = {
  alarms: AlarmsPage,
  messages: MessagesPage,
  garage: GaragePage,
}

export function initRouter() {
  const container = document.getElementById('app')

  function navigate(route) {
    const page = routes[route]
    if (!page || typeof page.render !== 'function') {
      console.error('Некорректная вкладка:', route, page)
      return
    }
    container.innerHTML = ''
    container.appendChild(page.render())
    // визуалка активной таб-ки
    document.querySelectorAll('[data-route]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-route') === route)
    })
  }

  document.querySelectorAll('[data-route]').forEach(btn => {
    btn.onclick = () => navigate(btn.getAttribute('data-route'))
  })

  navigate('alarms')
}
