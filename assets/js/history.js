/**
 * ============================================================
 *  Pro Pass Plus - history.js
 * ============================================================
 */

const HISTORY_KEY = "ppp_history";

let historyData = loadHistory();

/* --------------------------- */
/* 1. LOCALSTORAGE            */
/* --------------------------- */

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
}

/* --------------------------- */
/* 2. AÑADIR ENTRADA          */
/* --------------------------- */

function historyAddInternal(data) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type: data.type,
    value: data.value,
    options: data.options
  };

  historyData.push(entry);
  saveHistory();
  historyRender();
}

/* --------------------------- */
/* 3. RENDER                  */
/* --------------------------- */

function historyRender() {
  const container = document.getElementById("historyList");
  if (!container) return;

  container.innerHTML = "";

  if (historyData.length === 0) {
    container.innerHTML = "<p>No hay entradas en el historial.</p>";
    return;
  }

  const sorted = [...historyData].sort((a, b) => b.timestamp - a.timestamp);

  for (const entry of sorted) {
    const card = document.createElement("div");
    card.className = "history-card";

    const date = new Date(entry.timestamp).toLocaleString("es-ES");

    card.innerHTML = `
      <div class="history-header">
        <span class="history-type">${entry.type === "strong" ? "🔒 Fuerte" : "🧩 Passphrase"}</span>
        <span class="history-date">${date}</span>
      </div>

      <div class="history-value">${entry.value}</div>

      <div class="history-options">${formatOptions(entry.options)}</div>

      <div class="history-actions">
        <button class="btn-secondary" onclick="historyCopy('${entry.id}')">📋 Copiar</button>
      </div>
    `;

    container.appendChild(card);
  }
}

/* --------------------------- */
/* 4. FORMAT OPTIONS          */
/* --------------------------- */

function formatOptions(opt = {}) {
  if (opt.type === "phrase") {
    return `Palabras: ${opt.words}`;
  }

  let out = `Longitud: ${opt.length}`;
  if (opt.upper) out += " · Mayúsculas";
  if (opt.numbers) out += " · Números";
  if (opt.symbols) out += " · Símbolos";

  return out;
}

/* --------------------------- */
/* 5. ACCIONES                */
/* --------------------------- */

function historyCopy(id) {
  const entry = historyData.find(e => e.id === id);
  navigator.clipboard.writeText(entry.value);
}

function historyClearInternal() {
  if (!confirm("¿Seguro que quieres limpiar el historial?")) return;
  historyData = [];
  saveHistory();
  historyRender();
}

/* --------------------------- */
/* 6. EXPORTS                 */
/* --------------------------- */

export const historyAdd = historyAddInternal;
export const historyClear = historyClearInternal;
export { historyRender };

// GLOBAL
window.historyCopy = historyCopy;
window.historyClear = historyClearInternal;
