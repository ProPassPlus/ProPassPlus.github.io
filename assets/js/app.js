/**
 * ============================================================
 *  Pro Pass Plus - app.js
 *  ------------------------------------------------------------
 *  Archivo principal de la aplicación:
 *   - Control de la landing inicial
 *   - Navegación entre secciones
 *   - Integración de todos los módulos
 *   - Gestión del sidebar (desktop/móvil)
 *   - Render dinámico del historial
 *
 *  Código listo para producción:
 *   - Limpio
 *   - Modular
 *   - Seguro
 *   - Compatible con GitHub Pages
 * ============================================================
 */

/* ------------------------------------------------------------
   IMPORTACIÓN DE MÓDULOS
------------------------------------------------------------- */

import "./strength.js";
import "./generator.js";
import "./hash.js";
import "./pwned.js";
import "./utils.js";
import "./vault.js";
import { initAuditUI } from "./audit-ui.js";
import { historyRender } from "./history.js";



/* ------------------------------------------------------------
   1. ENTRADA DESDE LA LANDING
------------------------------------------------------------- */

document.getElementById("enterApp").addEventListener("click", () => {
    const landing = document.getElementById("landing");
    const app = document.getElementById("app");

    landing.classList.add("hidden");
    app.classList.remove("hidden");

    showSection("strength");

    // Mostrar botón del menú móvil solo después de entrar
    document.getElementById("mobileMenuToggle").classList.remove("hidden");
});



/* ------------------------------------------------------------
   2. NAVEGACIÓN ENTRE SECCIONES
------------------------------------------------------------- */

export function showSection(sectionId) {
    document.querySelectorAll(".tool-section").forEach(sec =>
        sec.classList.add("hidden")
    );

    const section = document.getElementById(sectionId);
    section.classList.remove("hidden");
    section.classList.add("fadeInSection");

    // Si entramos al historial → actualizar
    if (sectionId === "history") {
        historyRender();
    }

    // Si entramos a auditoría → inicializar UI
    if (sectionId === "audit") {
    initAuditUI();
}


}

document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const sec = btn.dataset.section;
        showSection(sec);

        // En móvil: cerrar menú y overlay
        if (window.innerWidth < 650) {
            document.querySelector(".sidebar").classList.remove("open");
            document.getElementById("sidebarOverlay").classList.remove("active");
        }
    });
});


/* ------------------------------------------------------------
   3. RESPONSIVE
------------------------------------------------------------- */

window.addEventListener("resize", () => {
    if (window.innerWidth >= 650) {
        document.querySelector(".sidebar").classList.remove("open");
    }
});


/* ------------------------------------------------------------
   LOG
------------------------------------------------------------- */

console.log(
    "%cPro Pass Plus iniciado correctamente ✔",
    "color: #1565c0; font-size: 14px; font-weight: bold;"
);
