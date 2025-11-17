/**
 * ============================================================
 *  Pro Pass Plus - vault.js
 *  ------------------------------------------------------------
 *  Gestor seguro de contraseñas basado en:
 *    - PBKDF2 (SHA-256, 600k iteraciones)
 *    - AES-256-GCM
 *    - Almacenamiento cifrado en localStorage
 *
 *  Funcionalidades:
 *    ✔ Desbloquear con clave maestra
 *    ✔ Cifrar/descifrar vault entero
 *    ✔ Añadir entradas
 *    ✔ Editar entradas
 *    ✔ Eliminar entradas
 *    ✔ Exportar / Importar
 *    ✔ Bloquear
 *    ✔ Modal para CRUD
 * ============================================================
 */

import {
  stringToBuffer,
  bufferToHex,
  bytesToString,
  debug
} from "./utils.js";

/* ============================================================
   VARIABLES INTERNAS DEL VAULT (NO SE EXPONEN GLOBALMENTE)
============================================================ */

let vaultMasterKey = null;   // CryptoKey derivada desde la clave maestra
let currentVault = null;     // Objeto JS descifrado (entries[])
let editingEntryId = null;   // Para saber si estamos editando una entrada existente

const LOCALSTORAGE_KEY = "ppp_vault";

/* ============================================================
   1. PBKDF2 - DERIVAR CLAVE MAESTRA
============================================================ */

/**
 * Deriva una clave AES-GCM de 256 bits usando PBKDF2.
 *
 * @param {string} masterPassword
 * @param {Uint8Array} salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(masterPassword, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    stringToBuffer(masterPassword),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/* ============================================================
   2. ENCRIPTAR / DESENCRIPTAR
============================================================ */

async function encryptVault() {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const json = JSON.stringify(currentVault);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    vaultMasterKey,
    stringToBuffer(json)
  );

  return {
    iv: Array.from(iv),
    data: bufferToHex(ciphertext)
  };
}

async function decryptVault(cipherObj) {
  const iv = new Uint8Array(cipherObj.iv);
  const ciphertext = hexToBytes(cipherObj.data);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    vaultMasterKey,
    ciphertext
  );

  return JSON.parse(bytesToString(new Uint8Array(decrypted)));
}

/**
 * Convierte hex → Uint8Array
 */
function hexToBytes(hex) {
  if (hex.length % 2 !== 0) throw new Error("Hex inválido");
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return arr;
}

/* ============================================================
   3. GUARDAR Y CARGAR DEL LOCALSTORAGE
============================================================ */

async function saveVault() {
  const encrypted = await encryptVault();
  const vaultBlob = {
    salt: Array.from(vaultSalt),
    blob: encrypted
  };
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(vaultBlob));
}

function loadEncryptedVault() {
  const raw = localStorage.getItem(LOCALSTORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

/* ============================================================
   4. UI HELPERS
============================================================ */

function showVaultContent() {
  document.getElementById("vault-login").classList.add("hidden");
  document.getElementById("vault-content").classList.remove("hidden");
  renderVaultEntries();
}

function showVaultLogin() {
  document.getElementById("vault-login").classList.remove("hidden");
  document.getElementById("vault-content").classList.add("hidden");
}

/* ============================================================
   5. DESBLOQUEAR VAULT
============================================================ */

let vaultSalt = null;

async function vaultUnlock() {
  const masterPass = document.getElementById("vaultMasterPassword").value;
  if (!masterPass) {
    alert("Introduce la clave maestra");
    return;
  }

  const stored = loadEncryptedVault();

  if (!stored) {
    // Vault nuevo
    vaultSalt = crypto.getRandomValues(new Uint8Array(16));
    vaultMasterKey = await deriveKey(masterPass, vaultSalt);
    currentVault = { entries: [] };
    await saveVault();
    showVaultContent();
    return;
  }

  // Vault existente
  vaultSalt = new Uint8Array(stored.salt);
  vaultMasterKey = await deriveKey(masterPass, vaultSalt);

  try {
    currentVault = await decryptVault(stored.blob);
  } catch (e) {
    alert("Clave maestra incorrecta.");
    vaultMasterKey = null;
    return;
  }

  showVaultContent();
}

/* ============================================================
   6. RENDER DE ENTRADAS
============================================================ */

function renderVaultEntries() {
  const container = document.getElementById("vaultEntries");
  container.innerHTML = "";

  if (!currentVault || currentVault.entries.length === 0) {
    container.innerHTML = "<p>No hay entradas guardadas.</p>";
    return;
  }

  for (const entry of currentVault.entries) {
    const card = document.createElement("div");
    card.className = "vault-card";

    card.innerHTML = `
      <div class="vault-title">🔑 ${entry.title}</div>
      <div class="vault-user">${entry.username || ""}</div>

      <div class="vault-password" id="pwd-${entry.id}">
      ••••••••••••••
      </div>

      <div class="vault-actions">
      <button onclick="vaultCopy('${entry.id}')" class="btn-secondary">📋 Copiar</button>
      <button onclick="vaultToggle('${entry.id}')" class="btn-secondary" id="toggle-${entry.id}">👁 Mostrar</button>
      <button onclick="vaultEdit('${entry.id}')" class="btn-secondary">✏️ Editar</button>
      <button onclick="vaultDelete('${entry.id}')" class="btn-secondary">🗑 Borrar</button>
      </div>  
    `;

    container.appendChild(card);
  }
}

/* ============================================================
   7. CRUD DE ENTRADAS
============================================================ */

function vaultAddEntry() {
  editingEntryId = null;
  document.getElementById("vaultModalTitle").textContent = "Nueva entrada";
  document.getElementById("vaultEntryTitle").value = "";
  document.getElementById("vaultEntryUser").value = "";
  document.getElementById("vaultEntryPassword").value = "";
  document.getElementById("vaultEntryNotes").value = "";

  document.getElementById("vaultModal").classList.remove("hidden");
}

function vaultEdit(id) {
  editingEntryId = id;
  const entry = currentVault.entries.find(e => e.id === id);

  document.getElementById("vaultModalTitle").textContent = "Editar entrada";
  document.getElementById("vaultEntryTitle").value = entry.title;
  document.getElementById("vaultEntryUser").value = entry.username;
  document.getElementById("vaultEntryPassword").value = entry.password;
  document.getElementById("vaultEntryNotes").value = entry.notes;

  document.getElementById("vaultModal").classList.remove("hidden");
}

async function vaultSaveEntry() {
  const title = document.getElementById("vaultEntryTitle").value;
  const user = document.getElementById("vaultEntryUser").value;
  const pass = document.getElementById("vaultEntryPassword").value;
  const notes = document.getElementById("vaultEntryNotes").value;

  if (!title) {
    alert("Título requerido");
    return;
  }

  if (editingEntryId) {
    // Editar existente
    const entry = currentVault.entries.find(e => e.id === editingEntryId);
    entry.title = title;
    entry.username = user;
    entry.password = pass;
    entry.notes = notes;

  } else {
    // Crear nueva
    const id = crypto.randomUUID();
    currentVault.entries.push({
      id, title, username: user, password: pass, notes, created: Date.now()
    });
  }

  await saveVault();
  renderVaultEntries();
  vaultCloseModal();
}

async function vaultDelete(id) {
  currentVault.entries = currentVault.entries.filter(e => e.id !== id);
  await saveVault();
  renderVaultEntries();
}

function vaultCloseModal() {
  document.getElementById("vaultModal").classList.add("hidden");
}

/* ============================================================
   8. ACCIONES
============================================================ */

function vaultLock() {
  vaultMasterKey = null;
  currentVault = null;
  showVaultLogin();
}

function vaultCopy(id) {
  const entry = currentVault.entries.find(e => e.id === id);
  navigator.clipboard.writeText(entry.password);
}

function vaultToggle(id) {
  const entry = currentVault.entries.find(e => e.id === id);
  const pwdBox = document.getElementById(`pwd-${id}`);
  const toggleBtn = document.getElementById(`toggle-${id}`);

  // Si está oculta
  if (pwdBox.dataset.show !== "1") {
    pwdBox.textContent = entry.password;
    pwdBox.dataset.show = "1";
    toggleBtn.textContent = "🚫 Ocultar";
  } else {
    pwdBox.textContent = "••••••••••••••";
    pwdBox.dataset.show = "0";
    toggleBtn.textContent = "👁 Mostrar";
  }
}


function vaultShow(id) {
  const entry = currentVault.entries.find(e => e.id === id);
  alert(`Contraseña: ${entry.password}`);
}

/* ============================================================
   9. EXPORTAR / IMPORTAR
============================================================ */

async function vaultExport() {
  const encryptedVault = localStorage.getItem(LOCALSTORAGE_KEY);
  if (!encryptedVault) {
    alert("No hay nada que exportar.");
    return;
  }

  const blob = new Blob([encryptedVault], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "vault_propassplus.json";
  a.click();

  URL.revokeObjectURL(url);
}

async function vaultImport() {
  const fileInput = document.getElementById("vaultImportFile");
  const file = fileInput.files[0];

  if (!file) return;

  const text = await file.text();

  try {
    JSON.parse(text); // validación básica
  } catch {
    alert("Archivo inválido");
    return;
  }

  localStorage.setItem(LOCALSTORAGE_KEY, text);
  alert("Archivo importado. Debes desbloquear con la clave maestra.");
  vaultLock();
}

/* ============================================================
   10. EXPOSICIÓN GLOBAL
============================================================ */

window.vaultUnlock = vaultUnlock;
window.vaultAddEntry = vaultAddEntry;
window.vaultEdit = vaultEdit;
window.vaultSaveEntry = vaultSaveEntry;
window.vaultDelete = vaultDelete;
window.vaultCopy = vaultCopy;
window.vaultToggle = vaultToggle;
window.vaultShow = vaultShow;
window.vaultLock = vaultLock;
window.vaultExport = vaultExport;
window.vaultImport = vaultImport;
window.vaultCloseModal = vaultCloseModal;
