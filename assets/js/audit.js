/**
 * ============================================================
 *  Pro Pass Plus - audit.js
 *  ------------------------------------------------------------
 *  Auditor de seguridad de contraseñas
 *
 *  Funcionalidades:
 *   - Reutilización de contraseñas en el vault
 *   - Contraseñas del vault filtradas (HIBP)
 *   - Auditoría manual de una contraseña
 *
 *  Requisitos:
 *   - Vault desbloqueado
 *   - Solo lectura
 *   - Sin persistencia
 * ============================================================
 */

import { isPasswordPwned } from "./pwned.js";

/* ------------------------------------------------------------
   1. UTILIDADES
------------------------------------------------------------- */

/**
 * Detecta contraseñas reutilizadas dentro del vault.
 * @param {Array} entries
 * @returns {Array}
 */
function detectReuse(entries) {
  const map = new Map();

  for (const entry of entries) {
    if (!entry.password) continue;

    const list = map.get(entry.password) || [];
    list.push(entry.title);
    map.set(entry.password, list);
  }

  const reused = [];
  for (const services of map.values()) {
    if (services.length > 1) {
      reused.push({
        services,
        risk: "ALTO"
      });
    }
  }

  return reused;
}

/* ------------------------------------------------------------
   2. AUDITORÍA DEL VAULT
------------------------------------------------------------- */

export async function auditVault() {
  if (!window.vaultIsUnlocked()) {
    return { error: "VAULT_LOCKED" };
  }

  const entries = window.vaultGetEntries();
  if (!entries || entries.length === 0) {
    return { reused: [], pwned: [] };
  }

  // Reutilización
  const reused = detectReuse(entries);

  // Filtraciones
  const pwned = [];
  for (const entry of entries) {
    if (!entry.password) continue;

    const found = await isPasswordPwned(entry.password);
    if (found) {
      pwned.push({
        service: entry.title,
        risk: "ALTO"
      });
    }
  }

  return { reused, pwned };
}

/* ------------------------------------------------------------
   3. AUDITORÍA MANUAL
------------------------------------------------------------- */

export async function auditPassword(password) {
  if (!window.vaultIsUnlocked()) {
    return { error: "VAULT_LOCKED" };
  }

  if (!password) {
    return { error: "EMPTY_PASSWORD" };
  }

  const entries = window.vaultGetEntries() || [];

  const reusedIn = entries
    .filter(e => e.password === password)
    .map(e => e.title);

  const pwned = await isPasswordPwned(password);

  return { reusedIn, pwned };
}
