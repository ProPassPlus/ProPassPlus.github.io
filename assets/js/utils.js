/**
 * ============================================================
 *  Pro Pass Plus - utils.js
 *  ------------------------------------------------------------
 *  Conjunto de utilidades diseñadas para ser usadas
 *  en todos los módulos de la aplicación.
 *
 *  Funcionalidades:
 *   - Aleatoriedad criptográfica
 *   - Conversión de buffers/hex
 *   - Cálculo de entropía
 *   - Métricas de complejidad
 *   - Validación básica
 *
 *  Totalmente puro, sin efectos secundarios.
 * ============================================================
 */


/* ------------------------------------------------------------
   1. ALEATORIEDAD CRIPTOGRÁFICA
------------------------------------------------------------- */

/**
 * Devuelve un número entero aleatorio entre 0 y max-1
 * usando Web Crypto (mucho más seguro que Math.random).
 * @param {number} max
 * @returns {number}
 */
export function randomInt(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

/**
 * Mezcla un array usando Fisher–Yates seguro.
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


/* ------------------------------------------------------------
   2. GESTIÓN DE CARACTERES
------------------------------------------------------------- */

export const CHARSETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+[]{}<>?,.",
};

/**
 * Determina el tamaño real del “alfabeto” usado por la contraseña.
 * @param {string} pwd
 * @returns {number} tamaño del conjunto posible
 */
export function detectCharsetSize(pwd) {
    let size = 0;

    if (/[a-z]/.test(pwd)) size += CHARSETS.lower.length;
    if (/[A-Z]/.test(pwd)) size += CHARSETS.upper.length;
    if (/\d/.test(pwd)) size += CHARSETS.numbers.length;
    if (/[^a-zA-Z0-9]/.test(pwd)) size += CHARSETS.symbols.length;

    // fallback mínimo
    return size || 1;
}


/* ------------------------------------------------------------
   3. CÁLCULO DE ENTROPÍA
------------------------------------------------------------- */

/**
 * Calcula la entropía de una contraseña según
 * H = log2(R^L) = L * log2(R)
 *
 * @param {string} pwd
 * @returns {number} entropía en bits (número flotante)
 */
export function calculateEntropy(pwd) {
    const R = detectCharsetSize(pwd);
    const L = pwd.length;

    return L * Math.log2(R);
}


/* ------------------------------------------------------------
   4. TIEMPO ESTIMADO DE CRACKING
------------------------------------------------------------- */

/**
 * Convierte segundos en un texto legible en años aproximados.
 * @param {number} seconds
 * @returns {string}
 */
export function secondsToYearsText(seconds) {
    const years = Math.floor(seconds / (60 * 60 * 24 * 365));
    return years.toLocaleString("es-ES") + " años";
}

/**
 * Estima tiempo de crackeo usando:
 * guesses = 2^entropy
 * speed = 10^9 intentos/segundo
 *
 * @param {number} entropy
 * @returns {string}
 */
export function estimateCrackTime(entropy) {
    const guesses = Math.pow(2, entropy);
    const speed = 1e9; // 1.000.000.000 intentos/segundo
    const seconds = guesses / speed;
    return secondsToYearsText(seconds);
}


/* ------------------------------------------------------------
   5. BUFFER / HEX / STRINGS
------------------------------------------------------------- */

/**
 * Convierte un ArrayBuffer a un string hex.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function bufferToHex(buffer) {
    return Array
        .from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Devuelve un ArrayBuffer desde un string.
 * @param {string} str
 * @returns {ArrayBuffer}
 */
export function stringToBuffer(str) {
    return new TextEncoder().encode(str);
}

/**
 * Convierte un array de bytes a texto.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function bytesToString(bytes) {
    return new TextDecoder().decode(bytes);
}


/* ------------------------------------------------------------
   6. VALIDACIONES
------------------------------------------------------------- */

/**
 * Valida que un string no esté vacío.
 * @param {string} str
 * @returns {boolean}
 */
export function isNotEmpty(str) {
    return str && str.trim().length > 0;
}

/**
 * Determina si un valor es un número válido.
 * @param {*} n
 * @returns {boolean}
 */
export function isNumber(n) {
    return typeof n === "number" && !isNaN(n) && isFinite(n);
}


/* ------------------------------------------------------------
   7. DEBUG CONTROLADO (solo si quieres)
------------------------------------------------------------- */

export function debug(...msg) {
    // Comenta esta línea para activar logs:
    // return;

    console.log("%c[DEBUG]", "color:#1565c0;font-weight:bold;", ...msg);
}
