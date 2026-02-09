// scripts/hash-password.js
const bcrypt = require('bcryptjs');

const password = 'password123';

async function generateHash() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('--- Generador de Hash para "password123" ---');
    console.log('Copia y pega la siguiente línea completa en tu script SQL (paso 2):');
    console.log(hashedPassword);
    console.log('--------------------------------------------------');

  } catch (err) {
    console.error("Error al generar el hash:", err);
  }
}

generateHash();