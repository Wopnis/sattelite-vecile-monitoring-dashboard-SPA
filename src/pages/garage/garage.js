import { el } from "../../utils/dom.js";
import { store } from "../../store.js";

// фильтр поиска
function filterVehicles(list, q) {
  if (!q) return list;
  q = q.toLowerCase();
  return list.filter(v =>
    (v.brand || "").toLowerCase().includes(q) ||
    (v.vin || "").toLowerCase().includes(q) ||
    (v.contract || "").toLowerCase().includes(q) ||
    (v.license || "").toLowerCase().includes(q)
  );
}

// компонент списка
function VehicleList(onSelect) {
  const wrap = el("div", { class: "vehicle-list" });
  const search = el("input", {
    class: "input",
    placeholder: "🔎 Поиск ТС...",
  });
  const list = el("div");

  wrap.appendChild(search);
  wrap.appendChild(list);

  function redraw() {
    const q = search.value;
    const vehicles = filterVehicles(store.getState().garage, q);
    list.innerHTML = "";

    vehicles.forEach(v => {
      const i = el("div", {
        class: "vehicle-row",
        dataset: { id: v.id },
      });
      i.textContent = `${v.brand || "ТС"} / ${v.license || ""} / ${v.vin}`;
      list.appendChild(i);
    });
  }

  list.addEventListener("click", (e) => {
    const row = e.target.closest(".vehicle-row");
    if (!row) return;
    onSelect(row.dataset.id);
  });

  search.addEventListener("input", redraw);
  window.addEventListener("garage:changed", redraw);

  redraw();
  return wrap;
}

// карточка ТС
function VehicleCard(vehicle) {
  const wrap = el("div", { class: "vehicle-card" });

  if (!vehicle) {
    wrap.innerHTML = `<div class="empty-card">Выберите ТС слева</div>`;
    return wrap;
  }

  wrap.innerHTML = `
    <h2>🚘 ${vehicle.brand || "ТС"}</h2>

    <div class="form-row"><label>Марка:</label><input id="brand" value="${vehicle.brand || ''}"></div>
    <div class="form-row"><label>Госномер:</label><input id="license" value="${vehicle.license || ''}"></div>

    <div class="form-row"><label>VIN:</label><input id="vin" value="${vehicle.vin || ''}" disabled></div>
    <div class="form-row"><label>Договор:</label><input id="contract" value="${vehicle.contract || ''}" disabled></div>

    <div class="form-row"><label>Лизингополучатель:</label><input id="lessee" value="${vehicle.lessee || ''}"></div>
    <div class="form-row"><label>Год выпуска:</label><input id="year" value="${vehicle.year || ''}"></div>
    <div class="form-row"><label>Цвет:</label><input id="color" value="${vehicle.color || ''}"></div>
    <div class="form-row"><label>Тип ТС:</label><input id="type" value="${vehicle.type || ''}"></div>

    <div class="form-row">
      <label>Примечания:</label>
      <textarea id="notes">${vehicle.notes || ''}</textarea>
    </div>

    <div style="display:flex;gap:8px;margin:10px 0;">
      <button class="btn primary" id="save">💾 Сохранить изменения</button>
      <button class="btn" id="add-media">📎 Добавить фото/видео</button>
    </div>

    <h3>📎 Медиа:</h3>
    <div class="media-grid"></div>

    <h3 style="margin-top:14px">📄 История тревог:</h3>
    <div class="history"></div>
  `;

  // медиа
  const mediaGrid = wrap.querySelector(".media-grid");
  vehicle.media?.forEach((m, i) => {
    const item = el("div", { class: "media-thumb" });
    item.innerHTML = `
      <img src="${m}" />
      <div class="delete" data-i="${i}">✖</div>
    `;
    mediaGrid.appendChild(item);
  });

  mediaGrid.addEventListener("click", e => {
    const d = e.target.closest(".delete");
    if (!d) return;
    const i = Number(d.dataset.i);
    vehicle.media.splice(i, 1);
    store.updateVehicle(vehicle.id, { media: vehicle.media });
    window.dispatchEvent(new Event("garage:changed"));
  });

  wrap.querySelector("#add-media").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const arr = vehicle.media || [];
        arr.push(reader.result);
        store.updateVehicle(vehicle.id, { media: arr });
        window.dispatchEvent(new Event("garage:changed"));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

  return wrap;
}

// ✅ ВОТ ЭТО САМОЕ ГЛАВНОЕ — ПРАВИЛЬНЫЙ ЭКСПОРТ С render()
export default {
  render() {
    const container = el("div", { class: "layout" });
    const left = el("div", { class: "left" });
    const right = el("div", { class: "right" });

    let current = null;

    const list = VehicleList((id) => {
      current = id;
      redrawRight();
    });

    function redrawRight() {
      right.innerHTML = "";
      const v = store.getState().garage.find(x => x.id === current);
      right.appendChild(v ? VehicleCard(v) : el("div", {}, "Выберите ТС"));
    }

    const addBtn = el("button", {
      class: "btn primary",
      style: "margin-bottom: 8px;",
    });
    addBtn.textContent = "➕ Добавить ТС";

    addBtn.addEventListener("click", () => {
      const v = {
        id: "g" + Math.random().toString(36).slice(2, 9),
        brand: "",
        license: "",
        vin: "",
        contract: "",
        lessee: "",
        year: "",
        color: "",
        type: "",
        notes: "",
        media: [],
      };
      store.addToGarage(v);
      current = v.id;
      window.dispatchEvent(new Event("garage:changed"));
      redrawRight();
    });

    left.appendChild(addBtn);
    left.appendChild(list);
    redrawRight();

    container.appendChild(left);
    container.appendChild(right);
    return container;
  },
};
