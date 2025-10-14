// Cambiar entre secciones
function showSection(id) {
  document.querySelectorAll('.tool-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// 1. Comprobador de fortaleza
function checkStrength() {
  const pwd = document.getElementById("strengthInput").value;
  const resultEl = document.getElementById("strengthResult");
  const bar = document.getElementById("strengthBar");
  const crackTimeEl = document.getElementById("crackTime");

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/\W/.test(pwd)) score++;

  // Limpiamos clases previas
  resultEl.className = "result-box";

  let result = "Muy débil", color = "red", width = "20%", boxClass = "result-weak";
  if (score >= 4) { result = "Muy fuerte"; color = "green"; width = "100%"; boxClass = "result-verystrong"; }
  else if (score === 3) { result = "Fuerte"; color = "limegreen"; width = "80%"; boxClass = "result-strong"; }
  else if (score === 2) { result = "Aceptable"; color = "orange"; width = "60%"; boxClass = "result-good"; }
  else if (score === 1) { result = "Débil"; color = "orangered"; width = "40%"; boxClass = "result-medium"; }

  resultEl.textContent = `Resultado: ${result}`;
  resultEl.classList.add(boxClass);

  bar.style.width = width;
  bar.style.background = color;

  // Estimación de crackeo con formato legible
  const combos = Math.pow(95, pwd.length);
  const guessesPerSec = 1e9;
  let seconds = combos / guessesPerSec;

  let years = Math.floor(seconds / (60 * 60 * 24 * 365));
  seconds %= (60 * 60 * 24 * 365);
  let months = Math.floor(seconds / (60 * 60 * 24 * 30));
  seconds %= (60 * 60 * 24 * 30);
  let days = Math.floor(seconds / (60 * 60 * 24));
  seconds %= (60 * 60 * 24);
  let hours = Math.floor(seconds / (60 * 60));

  // Formato con separadores de miles en años
  const yearsFormatted = years.toLocaleString("es-ES");

  crackTimeEl.textContent = `Tiempo estimado de crackeo → Años: ${yearsFormatted}, Meses: ${months}, Días: ${days}, Horas: ${hours}`;
}


// 2. Generador de contraseñas
function generatePassword(type) {
  let pwd = "";
  if (type === "strong") {
    const length = parseInt(document.getElementById("length").value, 10);
    const useUpper = document.getElementById("useUpper").checked;
    const useNumbers = document.getElementById("useNumbers").checked;
    const useSymbols = document.getElementById("useSymbols").checked;

    let chars = "abcdefghijklmnopqrstuvwxyz";
    if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useNumbers) chars += "0123456789";
    if (useSymbols) chars += "!@#$%^&*()_+[]{}<>?,.";

    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } else {
    const numWords = parseInt(document.getElementById("phraseWords").value, 10);
    const words =["gato","casa","sol","mar","rojo","luz","cielo","flor",
"perro","pájaro","árbol","hoja","agua","playa","montaña","luna",
"estrella","río","lago","arena","brisa","nube","lluvia","trueno",
"relámpago","nieve","hielo","fuego","chimenea","puerta","ventana",
"techo","piso","silla","mesa","cama","alfombra","espejo","libro",
"pluma","lápiz","papel","bolígrafo","ordenador","ratón","teclado",
"pantalla","teléfono","cámara","reloj","calle","carretera","coche",
"tren","barco","avión","bicicleta","moto","puente","túnel","semáforo",
"parque","jardín","planta","fruta","manzana","pera","plátano","uvas",
"naranja","limón","verdura","zanahoria","patata","tomate","cebolla",
"queso","pan","leche","café","té","azúcar","sal","aceite","cuchillo",
"tenedor","vaso","plato","cuchara","olla","sartén","horno","estufa",
"lavadora","televisión","radio","música","canción","baile","pintura",
"dibujo","arte","escultura","foto","imagen","vídeo","película","teatro",
"actor","actriz","escena","guion","baño","ducha","jabón","toalla",
"cepillo","peluche","niño","niña","hombre","mujer","amigo","familia",
"amor","odio","alegría","tristeza","miedo","ira","sueño","descanso",
"día","noche","mañana","tarde","semana","mes","año","tiempo","clima",
"estación","primavera","verano","otoño","invierno","viaje","aventura",
"camino","meta","trabajo","estudio","clase","examen","proyecto","idea",
"problema","solución","experimento","tecnología","ciencia","matemáticas",
"física","química","biología","programa","código","servidor","base",
"dato","red","seguridad","clave","contraseña","ventaja","desventaja",
"puerta","mensaje","correo","nota","tarjeta","regalo","fiesta","cumpleaños"];
    pwd = Array.from({ length: numWords }, () => words[Math.floor(Math.random() * words.length)]).join("-");
  }
  document.getElementById("generatedPassword").textContent = pwd;
}


function copyGenerated() {
  const pwd = document.getElementById("generatedPassword").textContent;
  if (!pwd) return;
  navigator.clipboard.writeText(pwd);
  alert("Copiado al portapapeles");
}

// 3. Calculador de hash
async function calculateHash() {
  const text = document.getElementById("hashInput").value;
  const algo = document.getElementById("hashAlgo").value;
  if (!text) return;

  try {
    const buffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    document.getElementById("hashResult").textContent = hashHex;
  } catch (err) {
    document.getElementById("hashResult").textContent =
      "Error: algoritmo no soportado";
  }
}



// 4. Comprobador de contraseñas filtradas
async function checkPwned() {
  const pwd = document.getElementById("pwnedInput").value;
  const resultEl = document.getElementById("pwnedResult");
  const spinner = document.getElementById("spinner");
  if (!pwd) return;

  spinner.classList.remove("hidden");
  resultEl.textContent = "";

  // SHA-1
  const buffer = new TextEncoder().encode(pwd);
  const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha1 = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();

  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();

  spinner.classList.add("hidden");

  let found = false;
  text.split("\n").forEach(line => {
    const [hash, count] = line.split(":");
    if (hash === suffix) {
      resultEl.textContent = `Contraseña encontrada `;
      found = true;
    }
  });

  //${count.trim()} veces

  if (!found) {
    resultEl.textContent = "No aparece en filtraciones conocidas";
  }
}
