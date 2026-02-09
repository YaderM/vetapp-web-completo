// db.js
const mysql = require('mysql2/promise'); 
const dotenv = require('dotenv');

dotenv.config(); 

// Configuración del Pool de Conexión
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vetapp_db', // Nombre de la DB
    port: process.env.DB_PORT || 3307,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos el pool directamente para usar db.query(query) en los controladores
module.exports = pool;