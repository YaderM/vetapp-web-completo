// db.js
const mysql = require('mysql2/promise'); 
const dotenv = require('dotenv');

dotenv.config(); 

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vetapp_db', 
    // CAMBIO 1: El puerto de DigitalOcean es 25060
    port: process.env.DB_PORT || 25060, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // CAMBIO 2: Agregar SSL (Obligatorio para DigitalOcean)
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;