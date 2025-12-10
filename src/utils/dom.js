// src/utils/dom.js
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  // props обработка
  Object.entries(props || {}).forEach(([k, v]) => {
    if (k === 'class' || k === 'className') {
      node.className = v;
    } else if (k === 'style') {
      if (typeof v === 'string') node.style.cssText = v;
      else Object.assign(node.style, v);
    } else if (k === 'dataset' && typeof v === 'object') {
      Object.entries(v).forEach(([dk, dv]) => {
        node.dataset[dk] = dv;
      });
    } else if (k.startsWith('data-')) {
      // support 'data-route': 'alarms'
      node.setAttribute(k, v);
    } else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.substring(2).toLowerCase(), v);
    } else if (k === 'disabled') {
      if (v) node.setAttribute('disabled', '');
    } else if (v !== null && v !== undefined) {
      node.setAttribute(k, String(v));
    }
  });

  // children handling
  children.flat().forEach(child => {
    if (child === null || child === undefined) return;
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      node.appendChild(child);
    } else {
      console.warn('dom.el: ignored child', child);
    }
  });

  return node;
}
