/**
 * ============================================================
 *  Pro Pass Plus - generator.js
 * ============================================================
 */

import {
  randomInt,
  shuffle,
  CHARSETS,
  isNotEmpty
} from "./utils.js";

import { historyAdd } from "./history.js";

/* ------------------------------------------------------------
   LISTA DE PALABRAS SEGURAS
------------------------------------------------------------- */

const WORD_LIST = [
  "g4t0","perr0","c4s4","lun4","s0l","m4r","c1el0","fl0r","nube","v1ent0",
  "r0c4","4ren4","b0sque","ll4ve","puert4","fueg0","n1eve","l4gun4","c4mp0",
  "r10","truen0","m0nt4ñ4","verde","4zul","br1s4","t1err4","n0che","estrell4",
  "h0j4","pl4nt4","r0j0","negr0","4m4r1ll0","gr1s","m4rc0","h1el0","c0bre",
  "plum4","l1br0","c4ble","r4f4g4","c4j4","p4red","suel0","tech0","puente",
  "c4m1n0","sender0","m0t0r","ru1d0","c4nt0","met4l","t4bl4","b4rc0","t0rre",
  "c4nt0","hum0","nube","truen0","ll4m4","cuerd4","p1edr4","4rc0","vel4",
  "b4rr0","dun4","c0st4","1sl4","r0ble","p1n0","4v10n","tr1ne0","l4nz4",
  "s0mbr4","f4r0","cuerd4","c0bre","p1c0","c1m4","h0nd4","t0rment4","dr4g0n",
  "delt4","c4p4","pr4d0","m4re4","ec0","0nd4","nex0","rum0r","r10","v4d0",
  "s4lt0","cuev4","0r1ll4","b4h14"
];


/* ------------------------------------------------------------
   GENERADOR FUERTE
------------------------------------------------------------- */

function generateStrongPassword(length, upper, numbers, symbols) {
  let charset = CHARSETS.lower;

  if (upper) charset += CHARSETS.upper;
  if (numbers) charset += CHARSETS.numbers;
  if (symbols) charset += CHARSETS.symbols;

  const chars = charset.split("");
  let result = "";

  for (let i = 0; i < length; i++) {
    const idx = randomInt(chars.length);
    result += chars[idx];
  }

  return result;
}

/* ------------------------------------------------------------
   PASSPHRASE
------------------------------------------------------------- */

function generatePhrase(count) {
  const words = shuffle([...WORD_LIST]); 
  const chosen = words.slice(0, count);
  return chosen.join("-");
}

/* ------------------------------------------------------------
   FUNCIÓN PRINCIPAL
------------------------------------------------------------- */

function generatePasswordInternal(mode) {
  let pwd = "";

  // VARIABLES DECLARADAS AQUÍ → EXISTEN SIEMPRE 👇
  let len = null;
  let useUpper = null;
  let useNumbers = null;
  let useSymbols = null;
  let count = null;

  if (mode === "strong") {

    len = parseInt(document.getElementById("length").value);

    useUpper = document.getElementById("useUpper").checked;
    useNumbers = document.getElementById("useNumbers").checked;
    useSymbols = document.getElementById("useSymbols").checked;

    pwd = generateStrongPassword(len, useUpper, useNumbers, useSymbols);

  } else if (mode === "phrase") {

    count = parseInt(document.getElementById("phraseWords").value);
    pwd = generatePhrase(count);
  }

  // Mostrar en UI
  document.getElementById("generatedPassword").textContent = pwd;

  // --------------------------------------------------
  //           GUARDAR EN HISTORIAL 100% FUNCIONAL
  // --------------------------------------------------
  historyAdd({
    type: mode,
    value: pwd,
    options: mode === "strong"
      ? {
          length: len,
          upper: useUpper,
          numbers: useNumbers,
          symbols: useSymbols
        }
      : {
          type: "phrase",
          words: count
        }
  });
}

/* ------------------------------------------------------------
   COPIAR
------------------------------------------------------------- */

function copyGeneratedInternal() {
  const pwd = document.getElementById("generatedPassword").textContent;
  if (isNotEmpty(pwd)) navigator.clipboard.writeText(pwd);
}

/* ------------------------------------------------------------
   EXPORTS
------------------------------------------------------------- */

export {
  generatePasswordInternal as generatePassword,
  copyGeneratedInternal as copyGenerated
};

window.generatePassword = generatePasswordInternal;
window.copyGenerated = copyGeneratedInternal;
