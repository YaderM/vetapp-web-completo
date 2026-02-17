const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const db = require('./db'); 

// Importación de rutas
const authRoutes = require('./routes/auth.routes');
const propietariosRoutes = require('./routes/propietarios.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const citasRoutes = require('./routes/citas.routes');
const perfilRoutes = require('./routes/perfil.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors());
app.use(express.json());

// --- CORRECCIÓN 1: RUTA DE BIENVENIDA ---
// Esto arregla el error "Cannot GET /"
app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h1>🐶 ¡API VetApp Funcionando! 🐱</h1>
        <p>El servidor está conectado y listo.</p>
        <p>Prueba las rutas en: /api/citas o /api/propietarios</p>
      </div>
    `);
});

// Test de conexión (Solo informativo en consola)
db.query('SELECT 1 + 1 AS solution')
    .then(() => {
        console.log('✅ Conexión exitosa a la base de datos MySQL (vetapp_db).');
    })
    .catch((err) => {
        console.error('❌ Error de conexión a la base de datos.', err);
    });

// Definición de Rutas de la API
app.use('/api/auth', authRoutes); 
app.use('/api/propietarios', propietariosRoutes); 
app.use('/api/pacientes', pacientesRoutes); 
app.use('/api/citas', citasRoutes);
app.use('/api/perfil', perfilRoutes);

// Arranque del Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express corriendo en el puerto ${PORT}`);
});

// --- CORRECCIÓN 2: EXPORTAR PARA VERCEL ---
// Esto es obligatorio para que Vercel entienda tu app
module.exports = app;