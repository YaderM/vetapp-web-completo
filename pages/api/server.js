const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

// CORRECCIÓN 1: Usamos '../../' para subir 2 carpetas y encontrar db.js en la raíz
const db = require('../../db'); 

// Importación de rutas (También subimos 2 niveles)
const authRoutes = require('../../routes/auth.routes');
const propietariosRoutes = require('../../routes/propietarios.routes');
const pacientesRoutes = require('../../routes/pacientes.routes');
const citasRoutes = require('../../routes/citas.routes');
const perfilRoutes = require('../../routes/perfil.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de bienvenida
app.get('/api/server', (req, res) => {
    res.send(`<h1>🐶 API Backend Funcionando 🐱</h1>`);
});

// Definición de Rutas de la API
// NOTA: Mantenemos /api/... porque el rewrites se encarga de dirigirlo aquí
app.use('/api/auth', authRoutes); 
app.use('/api/propietarios', propietariosRoutes); 
app.use('/api/pacientes', pacientesRoutes); 
app.use('/api/citas', citasRoutes);
app.use('/api/perfil', perfilRoutes);

// CORRECCIÓN 2: Condicional para Vercel
// Solo escuchamos el puerto si NO estamos en producción (Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Express corriendo en el puerto ${PORT}`);
    });
}

// CORRECCIÓN 3: Exportación final
module.exports = app;