/**
 * ============================================================
 *  Pro Pass Plus - hash.js
 *  ------------------------------------------------------------
 *  Calculadora de hashes usando Web Crypto API.
 *
 *  Algoritmos soportados:
 *   - SHA-256
 *   - SHA-384
 *   - SHA-512
 *
 *  Expone:
 *   - calculateHash()
 * ============================================================
 */

import {
  stringToBuffer,
  bufferToHex,
  isNotEmpty
} from "./utils.js";

/**
 * Calcula el hash de un texto usando WebCrypto.
 *
 * @param {string} algo - "SHA-256", "SHA-384" o "SHA-512"
 * @param {string} text
 * @returns {Promise<string>} hash en hexadecimal
 */
async function digest(algo, text) {
  const buffer = stringToBuffer(text);
  const hashBuffer = await crypto.subtle.digest(algo, buffer);
  return bufferToHex(hashBuffer);
}

/**
 * Función principal llamada desde el botón "Calcular".
 */
async function calculateHashInternal() {
  const input = document.getElementById("hashInput").value;
  const algo = document.getElementById("hashAlgo").value;
  const output = document.getElementById("hashResult");

  if (!isNotEmpty(input)) {
    output.textContent = "Introduce texto para generar el hash.";
    return;
  }

  try {
    const hex = await digest(algo, input);
    output.textContent = hex;
  } catch (err) {
    output.textContent = "Error: algoritmo no soportado";
  }
}

/* ------------------------------------------------------------
   EXPORTS / GLOBAL
------------------------------------------------------------- */

export { calculateHashInternal as calculateHash };

// Hacerlo accesible desde el HTML
window.calculateHash = calculateHashInternal;
