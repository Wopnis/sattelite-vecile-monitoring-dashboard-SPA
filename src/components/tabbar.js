// src/components/tabbar.js
import { el } from '../utils/dom.js';

export default function TabBar() {
  const bar = el('div', { class: 'tabbar' });

  const tabs = [
    { id: 'alarms', title: 'Тревоги' },
    { id: 'messages', title: 'Сообщения' },
    { id: 'garage', title: 'Гараж' },
  ];

  tabs.forEach(t => {
    // explicitly set data-route attribute so querySelectorAll('[data-route]') finds it
    const btn = el('button', { class: 'tab-btn', 'data-route': t.id }, t.title);
    bar.appendChild(btn);
  });

  return bar;
}
