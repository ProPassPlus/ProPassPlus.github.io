/**
 * ============================================================
 *  Pro Pass Plus - sidebar.js
 *  ------------------------------------------------------------
 *  Gestión del menú lateral en pantallas pequeñas:
 *   - Botón hamburguesa (#mobileMenuToggle)
 *   - Clase .open en .sidebar
 *   - Cierre automático al pulsar fuera en móvil
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.querySelector(".sidebar");
    const mobileBtn = document.getElementById("mobileMenuToggle");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar || !mobileBtn || !overlay) {
        console.error("Sidebar init error: elements not found");
        return;
    }

    // Abrir / cerrar sidebar
    mobileBtn.addEventListener("click", () => {
        const opened = sidebar.classList.toggle("open");

        if (opened) {
            overlay.classList.add("active");
        } else {
            overlay.classList.remove("active");
        }
    });

    // Cerrar sidebar al tocar fuera
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });

    // Cerrar si se redimensiona la pantalla
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 650) {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        }
    });

});

