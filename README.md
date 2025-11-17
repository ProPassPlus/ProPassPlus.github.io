# 🔐 Pro Pass Plus  
### Gestor de contraseñas y utilidades de seguridad — Proyecto Ingeniería del Software

Pro Pass Plus es una aplicación web que integra herramientas para el análisis, generación y gestión segura de contraseñas.  
Este proyecto ha sido desarrollado como parte de la asignatura **Ingeniería del Software**, siguiendo buenas prácticas de modularidad, usabilidad y diseño seguro.

---

## ✨ Funcionalidades Principales

### 🛡️ 1. Comprobador de Fortaleza  
Analiza contraseñas según:
- longitud  
- entropía  
- uso de caracteres  
- tiempo estimado de crackeo  

### ⚙️ 2. Generador de Contraseñas  
Incluye:
- contraseñas fuertes personalizables  
- generador de passphrases  
- copia rápida  
- historial automático  

### 🔢 3. Calculadora de Hashes  
Compatible con:
- SHA‑256  
- SHA‑384  
- SHA‑512  

### ⚠️ 4. Comprobador de Contraseñas Filtradas  
Usa la API “Have I Been Pwned” mediante K‑Anonymity.  
La contraseña NUNCA se envía completa a ningún servidor.

### 🔐 5. Gestor Seguro de Contraseñas (AES‑256)  
Incluye:
- clave maestra (nunca almacenada)  
- cifrado AES‑GCM 256 bits  
- derivación PBKDF2  
- añadir, editar y borrar entradas  
- mostrar/ocultar contraseña  
- exportar vault cifrado  
- importar vault cifrado  
- bloqueo del gestor  

### 📜 6. Historial del Generador  
Funcionalidades:
- listado dinámico  
- opciones usadas  
- fecha y tipo  
- copiar  
- limpiar historial  

---

## 🧱 Arquitectura del Proyecto

Estructura modular en ES Modules:

```
assets/
 ├── css/
 │    └── style.css
 └── js/
      ├── app.js
      ├── sidebar.js
      ├── theme.js
      ├── utils.js
      ├── strength.js
      ├── generator.js
      ├── hash.js
      ├── pwned.js
      ├── vault.js
      └── history.js
index.html
```

Características:
- interfaz moderna 
- responsive completo  
- overlay móvil  
- diseño limpio y mantenible  

---

## 🔐 Seguridad del Sistema

El gestor implementa un esquema de cifrado razonable para un proyecto académico:

### ✔ Algoritmos utilizados  
- **AES‑GCM 256 bits** para cifrar el contenido  
- **PBKDF2‑SHA256** con sal aleatoria para derivar la clave  
- **IV aleatorio** generado por WebCrypto  
- **Clave maestra no almacenada nunca**  
- **Vault cifrado almacenado en localStorage**

---

## 🔐 Comportamiento de la Clave Maestra (Punto Crítico de Seguridad)

- **La clave maestra nunca se guarda en ningún almacenamiento** (ni localStorage, ni sessionStorage, ni cookies, ni IndexedDB).
- **La clave maestra nunca se envía a ningún servidor**, ya que Pro Pass Plus funciona completamente offline.
- La clave maestra **solo se mantiene en memoria volátil** (RAM del navegador) durante el proceso de descifrado.
- Una vez cargado el contenido del vault, **la clave derivada se elimina**, quedando únicamente el vault en memoria.
- En cuanto se cierre la pestaña, se recargue la página o se bloquee el gestor, **la clave maestra desaparece por completo**.
- El vault cifrado almacenado en localStorage **no puede descifrarse sin la clave maestra**, lo cual garantiza confidencialidad total.

---

### ✔ Justificación académica  
Para un proyecto universitario, este enfoque cumple los principios de OWASP referentes a:
- almacenamiento seguro  
- gestión de claves  
- defensa frente a ataques offline  
- confidencialidad de datos  

---

### ⚙️ Mejoras posibles en entorno real  
En un sistema profesional se añadirían:
- más iteraciones PBKDF2 (≈310k)  
- HMAC para integridad  
- auto‑lock por inactividad  
- pentesting y análisis de amenazas  
- política de borrado seguro  

---

## 👥 Autores

Proyecto desarrollado por el equipo **Pro Pass Plus**  
para la asignatura *Ingeniería del Software*.

---

## 📜 Licencia

MIT License — Uso libre para proyectos académicos.
