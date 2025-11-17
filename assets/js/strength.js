/**
 * ============================================================
 *  Pro Pass Plus - strength.js
 *  ------------------------------------------------------------
 *  Lógica del comprobador de fortaleza de contraseñas.
 *
 *  Usa:
 *   - Entropía basada en tamaño de alfabeto + longitud
 *   - Estimación de tiempo de crackeo (intentando 10^9/s)
 *   - Clasificación en 5 niveles
 *
 *  Integra con el DOM:
 *   - #strengthInput
 *   - #strengthResult
 *   - #strengthBar
 *   - #crackTime
 *
 *  Y expone la función global:
 *   - window.checkStrength()
 * ============================================================
 */

import {
  calculateEntropy,
  estimateCrackTime,
  isNotEmpty,
  detectCharsetSize,
  debug
} from "./utils.js";

/**
 * Devuelve una clasificación legible a partir de la entropía.
 *
 * Rango aproximado típico:
 *  < 28 bits   → Muy débil
 *  28–35 bits  → Débil
 *  36–59 bits  → Aceptable
 *  60–79 bits  → Fuerte
 *  ≥ 80 bits   → Muy fuerte
 *
 * @param {number} entropy
 * @returns {{label: string, width: string}}
 */
function classifyByEntropy(entropy) {
  if (entropy < 28) {
    return { label: "Muy débil", width: "15%" };
  } else if (entropy < 36) {
    return { label: "Débil", width: "35%" };
  } else if (entropy < 60) {
    return { label: "Aceptable", width: "55%" };
  } else if (entropy < 80) {
    return { label: "Fuerte", width: "75%" };
  } else {
    return { label: "Muy fuerte", width: "100%" };
  }
}

/**
 * Actualiza el DOM con la información de la contraseña:
 *  - texto de resultado
 *  - barra de fuerza
 *  - tiempo estimado de crack
 *
 * @param {string} pwd
 */
function updateStrengthUI(pwd) {
  const resultEl = document.getElementById("strengthResult");
  const barEl = document.getElementById("strengthBar");
  const crackEl = document.getElementById("crackTime");

  if (!isNotEmpty(pwd)) {
    resultEl.textContent = "Introduce una contraseña para evaluarla.";
    barEl.style.width = "0%";
    crackEl.textContent = "";
    return;
  }

  const entropy = calculateEntropy(pwd);
  const { label, width } = classifyByEntropy(entropy);
  const crackTimeText = estimateCrackTime(entropy);
  const charsetSize = detectCharsetSize(pwd);

  debug("Password entropy:", entropy, "bits");

  resultEl.textContent =
    `Resultado: ${label} · Entropía ≈ ${entropy.toFixed(1)} bits · Alfabeto ≈ ${charsetSize} caracteres.`;

  barEl.style.width = width;

  crackEl.textContent =
    `Tiempo estimado de crackeo (fuerza bruta, 10⁹ intentos/s): ${crackTimeText}`;
}

/**
 * Función principal llamada desde el botón "Comprobar".
 * Lee el valor del input y delega en updateStrengthUI.
 */
function checkStrengthInternal() {
  const pwdInput = document.getElementById("strengthInput");
  const pwd = pwdInput ? pwdInput.value : "";
  updateStrengthUI(pwd);
}

/* ------------------------------------------------------------
   EXPORTS / INTEGRACIÓN GLOBAL
------------------------------------------------------------- */

// Export para uso como módulo (si lo necesitas en otro JS)
export { checkStrengthInternal as checkStrength };

// Exponer también en window para que funcione el onclick="checkStrength()"
window.checkStrength = checkStrengthInternal;
