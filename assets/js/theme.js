/**
 * ============================================================
 *  Pro Pass Plus - theme.js
 *  ------------------------------------------------------------
 *  Gestión del tema oscuro/claro con:
 *   - persistencia en localStorage
 *   - botón toggler (🌙 / ☀️)
 *   - aplicación inmediata al DOM
 *
 *  Expone:
 *   - applyTheme(mode)
 * ============================================================
 */

const themeIcon = document.getElementById("themeIcon");

/**
 * Aplica un tema al documento.
 *
 * @param {"dark"|"light"} mode
 */
export function applyTheme(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.textContent = "☀️"; // icono de modo claro
  } else {
    document.body.classList.remove("dark-mode");
    themeIcon.textContent = "🌙"; // icono de modo oscuro
  }

  localStorage.setItem("theme", mode);
}

/**
 * Alterna entre modo claro y oscuro.
 */
function toggleTheme() {
  const current = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";

  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

/**
 * Cargar tema almacenado al inicio.
 */
function loadTheme() {
  const saved = localStorage.getItem("theme") || "light";
  applyTheme(saved);
}

// Inicializar
loadTheme();

// Listener del botón del sidebar
themeIcon.addEventListener("click", toggleTheme);

// Exponer para módulos si se necesita
window.applyTheme = applyTheme;
