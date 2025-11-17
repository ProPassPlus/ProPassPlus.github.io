/* ========================= */
/* ENTRAR DESDE LA LANDING  */
/* ========================= */

document.getElementById("enterApp").addEventListener("click", () => {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
});

/* ========================= */
/*  NAVEGACIÓN DEL SIDEBAR   */
/* ========================= */

document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".tool-section").forEach(sec => sec.classList.add("hidden"));

    const target = btn.getAttribute("data-section");
    document.getElementById(target).classList.remove("hidden");
  });
});

/* ========================= */
/* 1. Comprobador de fortaleza */
/* ========================= */

function checkStrength() {
  const pwd = document.getElementById("strengthInput").value;
  const resultEl = document.getElementById("strengthResult");
  const bar = document.getElementById("strengthBar");
  const crackEl = document.getElementById("crackTime");

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/\W/.test(pwd)) score++;

  let label = "Muy débil";
  let width = "10%";

  if (score === 1) { label = "Débil"; width = "30%"; }
  if (score === 2) { label = "Aceptable"; width = "50%"; }
  if (score === 3) { label = "Fuerte"; width = "70%"; }
  if (score >= 4) { label = "Muy fuerte"; width = "100%"; }

  resultEl.textContent = `Resultado: ${label}`;
  bar.style.width = width;

  const guesses = Math.pow(90, pwd.length);
  const seconds = guesses / 1e9;
  const years = Math.floor(seconds / (60 * 60 * 24 * 365));

  crackEl.textContent = `Tiempo estimado de crackeo → ${years.toLocaleString()} años`;
}

/* ========================= */
/* 2. Generador              */
/* ========================= */

function generatePassword(type) {
  let pwd = "";

  if (type === "strong") {
    const len = parseInt(document.getElementById("length").value);
    let chars = "abcdefghijklmnopqrstuvwxyz";

    if (document.getElementById("useUpper").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (document.getElementById("useNumbers").checked) chars += "0123456789";
    if (document.getElementById("useSymbols").checked) chars += "!@#$%^&*()_+[]{}<>?,.";

    for (let i = 0; i < len; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }

  } else {
    const words = ["gato","sol","mar","rojo","cielo","flor","arena","montaña","luz","viento","hoja","nube","lluvia","trueno","puerta","llave","laguna","verde"];
    const count = parseInt(document.getElementById("phraseWords").value);

    for (let i=0; i<count; i++) {
      pwd += words[Math.floor(Math.random() * words.length)];
      if (i < count -1) pwd += "-";
    }
  }

  document.getElementById("generatedPassword").textContent = pwd;
}

function copyGenerated() {
  const text = document.getElementById("generatedPassword").textContent;
  navigator.clipboard.writeText(text);
}

/* ========================= */
/* 3. Hash                   */
/* ========================= */

async function calculateHash() {
  const text = document.getElementById("hashInput").value;
  const algo = document.getElementById("hashAlgo").value;

  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2,"0")).join("");

  document.getElementById("hashResult").textContent = hex;
}

/* ========================= */
/* 4. Pwned Passwords        */
/* ========================= */

async function checkPwned() {
  const pwd = document.getElementById("pwnedInput").value;
  const spinner = document.getElementById("spinner");
  const result = document.getElementById("pwnedResult");

  spinner.classList.remove("hidden");

  const buffer = new TextEncoder().encode(pwd);
  const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);

  const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2,"0"))
        .join("").toUpperCase();

  const prefix = hashHex.substring(0,5);
  const suffix = hashHex.substring(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();

  spinner.classList.add("hidden");

  const found = text.split("\n").find(line => line.startsWith(suffix));

  if (found) {
    result.textContent = "⚠ Esta contraseña aparece en filtraciones.";
  } else {
    result.textContent = "✔ No aparece en filtraciones conocidas.";
  }
}
