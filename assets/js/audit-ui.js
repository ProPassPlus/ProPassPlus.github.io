import { auditVault, auditPassword } from "./audit.js";

/* ------------------ UI helpers ------------------ */

function showLocked() {
    document.getElementById("auditLocked").classList.remove("hidden");
    document.getElementById("auditContent").classList.add("hidden");
}

function showContent() {
    document.getElementById("auditLocked").classList.add("hidden");
    document.getElementById("auditContent").classList.remove("hidden");
}

/* ------------------ Render ------------------ */

function renderSummary(result) {
    const el = document.getElementById("auditSummary");
    el.innerHTML = "";

    if (result.reused.length === 0 && result.pwned.length === 0) {
        el.innerHTML = `<div class="audit-ok">✔ No se han detectado problemas de seguridad.</div>`;
        return;
    }

    if (result.reused.length > 0) {
        const block = document.createElement("div");
        block.className = "audit-block audit-warning";

        block.innerHTML = `<h4>🔁 Contraseñas reutilizadas</h4>`;

        const ul = document.createElement("ul");
        result.reused.forEach(r => {
            const li = document.createElement("li");
            li.textContent = r.services.join(", ");
            ul.appendChild(li);
        });

        block.appendChild(ul);
        el.appendChild(block);
    }

    if (result.pwned.length > 0) {
        const block = document.createElement("div");
        block.className = "audit-block audit-danger";

        block.innerHTML = `<h4>⚠ Contraseñas filtradas</h4>`;

        const ul = document.createElement("ul");
        result.pwned.forEach(pw => {
            const li = document.createElement("li");
            li.textContent = pw.service;
            ul.appendChild(li);
        });

        block.appendChild(ul);
        el.appendChild(block);
    }
}


/* ------------------ Eventos ------------------ */

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("auditUnlockBtn").onclick = async () => {
        const input = document.getElementById("auditMasterPassword");

        // reutilizamos el input real del vault
        document.getElementById("vaultMasterPassword").value = input.value;

        await window.vaultUnlock();

        if (window.vaultIsUnlocked()) {
            document.getElementById("auditLockBtn").classList.remove("hidden");
            showContent();
            const result = await auditVault();
            renderSummary(result);
        }
    };

    document.getElementById("auditPasswordBtn").onclick = async () => {
        const pwd = document.getElementById("auditPasswordInput").value;
        const result = await auditPassword(pwd);

        const out = document.getElementById("auditPasswordResult");
        out.innerHTML = "";

        if (result.error) {
            out.textContent = "Error al analizar la contraseña.";
            return;
        }


        // Reutilización
        if (result.reusedIn.length > 0) {
            const block = document.createElement("div");
            block.className = "audit-block audit-warning";

            block.innerHTML = `<h4>🔁 Reutilización detectada</h4>`;

            const ul = document.createElement("ul");
            result.reusedIn.forEach(service => {
                const li = document.createElement("li");
                li.textContent = service;
                ul.appendChild(li);
            });

            block.appendChild(ul);
            out.appendChild(block);
        } else {
            out.innerHTML += `
    <div class="audit-ok">
      ✔ No se reutiliza en el vault
    </div>
  `;
        }

        // Filtraciones
        if (result.pwned) {
            out.innerHTML += `
    <div class="audit-block audit-danger">
      <h4>⚠ Contraseña filtrada</h4>
      <p>Esta contraseña aparece en filtraciones conocidas.</p>
    </div>
  `;
        } else {
            out.innerHTML += `
    <div class="audit-ok">
      ✔ No aparece en filtraciones conocidas
    </div>
  `;
        }

    };

    document.getElementById("auditLockBtn").onclick = () => {
        // reutilizamos la lógica existente del vault
        window.vaultLock();

        // reset visual del auditor
        document.getElementById("auditMasterPassword").value = "";
        document.getElementById("auditPasswordInput").value = "";
        document.getElementById("auditPasswordResult").innerHTML = "";
        document.getElementById("auditSummary").innerHTML = "";

        document.getElementById("auditLockBtn").classList.add("hidden");


        showLocked();
    };


});

/* ------------------ Init ------------------ */

export function initAuditUI() {
  const lockBtn = document.getElementById("auditLockBtn");

  if (window.vaultIsUnlocked()) {
    lockBtn.classList.remove("hidden");
    showContent();
    auditVault().then(renderSummary);
  } else {
    lockBtn.classList.add("hidden");
    showLocked();
  }
}

