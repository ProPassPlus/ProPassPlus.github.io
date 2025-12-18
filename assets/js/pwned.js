/**
 * ============================================================
 *  Pro Pass Plus - pwned.js
 *  ------------------------------------------------------------
 *  Comprobación de contraseñas filtradas mediante el servicio
 *  de HaveIBeenPwned con el protocolo K-Anonymity.
 *
 *  Flujo:
 *   1. Hash SHA-1 de la contraseña (local)
 *   2. Se envían SOLO los 5 primeros caracteres del hash
 *   3. Se compara el sufijo contra los resultados
 *
 *  Expone:
 *   - checkPwned()
 * ============================================================
 */

import {
  stringToBuffer,
  bufferToHex,
  isNotEmpty
} from "./utils.js";

/**
 * Devuelve el SHA-1 de un texto usando WebCrypto.
 * @param {string} text
 * @returns {Promise<string>} hash SHA-1 en mayúsculas
 */
async function sha1(text) {
  const buffer = stringToBuffer(text);
  const digest = await crypto.subtle.digest("SHA-1", buffer);
  return bufferToHex(digest).toUpperCase();
}

/**
 * Envía la petición al endpoint de HaveIBeenPwned.
 * @param {string} prefix - primeros 5 caracteres del SHA-1
 * @returns {Promise<string>} respuesta en texto plano
 */
async function fetchPwnedRange(prefix) {
  const url = `https://api.pwnedpasswords.com/range/${prefix}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error en la API de HIBP");
  return await res.text();
}

/**
 * Busca en el listado de hashes si aparece el sufijo exacto.
 *
 * @param {string} suffix - sufijo del SHA-1
 * @param {string} rangeText - texto devuelto por la API
 * @returns {boolean}
 */
function suffixFound(suffix, rangeText) {
  // Cada línea: "HASHSUFFIX:COUNT"
  const lines = rangeText.split("\n");

  for (const line of lines) {
    const [hash] = line.split(":");
    if (hash === suffix) return true;
  }
  return false;
}

/**
 * Comprueba si una contraseña aparece en filtraciones conocidas
 * usando K-Anonymity (HIBP).
 *
 * Función PURA: no toca DOM ni UI.
 *
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function isPasswordPwned(password) {
  if (!password) return false;

  const hash = await sha1(password);
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  const rangeText = await fetchPwnedRange(prefix);
  return suffixFound(suffix, rangeText);
}


/**
 * Función principal que se llama desde el UI.
 * Evalúa la contraseña y actualiza:
 *  - #spinner
 *  - #pwnedResult
 */
async function checkPwnedInternal() {
  const input = document.getElementById("pwnedInput").value;
  const spinner = document.getElementById("spinner");
  const output = document.getElementById("pwnedResult");

  output.textContent = "";
  spinner.classList.remove("hidden");

  if (!isNotEmpty(input)) {
    spinner.classList.add("hidden");
    output.textContent = "Introduce una contraseña.";
    return;
  }

  try {
    const found = await isPasswordPwned(input);


    spinner.classList.add("hidden");

    if (found) {
      output.textContent = "⚠ Esta contraseña aparece en filtraciones.";
    } else {
      output.textContent = "✔ No aparece en filtraciones conocidas.";
    }

  } catch (err) {
    spinner.classList.add("hidden");
    output.textContent = "Error al consultar la API.";
  }
}


/* ------------------------------------------------------------
   EXPORTS / GLOBAL
------------------------------------------------------------- */

export { checkPwnedInternal as checkPwned };
export { isPasswordPwned };


// Para compatibilidad con onclick del HTML
window.checkPwned = checkPwnedInternal;
