// server.js
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const db = require('./db'); 

// Importación de rutas
const authRoutes = require('./routes/auth.routes');
const propietariosRoutes = require('./routes/propietarios.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const citasRoutes = require('./routes/citas.routes');
const perfilRoutes = require('./routes/perfil.routes'); // <-- ¡AÑADIR ESTA LÍNEA!

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors());
app.use(express.json());

// Test de conexión
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
app.use('/api/perfil', perfilRoutes); // <-- ¡AÑADIR ESTA LÍNEA!

// Arranque del Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}/api`);
});