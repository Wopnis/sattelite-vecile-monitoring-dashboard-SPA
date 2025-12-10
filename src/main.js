import TabBar from './components/tabbar.js'
import { initRouter } from './router.js'

document.addEventListener('DOMContentLoaded', () => {
  const tabsRoot = document.getElementById('tabs')
  tabsRoot.appendChild(TabBar())

  initRouter()
})
