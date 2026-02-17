// db.js
const mysql = require('mysql2/promise'); 
const dotenv = require('dotenv');

dotenv.config(); 

// Configuración del Pool de Conexión
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Convertimos a número para asegurar compatibilidad
    port: Number(process.env.DB_PORT), 
    
    // Configuración de SSL inteligente: 
    // Si el host NO es localhost, activa SSL (necesario para DigitalOcean)
    ssl: process.env.DB_HOST !== 'localhost' ? {
        rejectUnauthorized: false
    } : false,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos el pool para usar db.query() en los controladores
module.exports = pool;