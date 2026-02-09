// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const db = require('../db'); // Usamos require para el pool de la DB

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_seguro';

/**
 * Middleware para proteger rutas que requieren autenticación (Bearer Token).
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Obtener el token del encabezado (debe ser 'Bearer TOKEN')
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar el token y obtener el ID del usuario
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Obtener el usuario del token (para validar que existe en DB)
            const [users] = await db.query('SELECT id, nombre, email FROM Usuarios WHERE id = ?', [decoded.id]);

            if (users.length === 0) {
                return res.status(401).json({ message: 'No autorizado, usuario del token no encontrado.' });
            }

            // Adjuntar el usuario al objeto request (req.user)
            req.user = users[0]; 
            next(); // Continuar con la ejecución de la ruta
            
        } catch (error) {
            console.error('Error de verificación de token:', error);
            res.status(401).json({ message: 'No autorizado, token fallido o expirado.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

module.exports = { protect };