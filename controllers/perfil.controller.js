const db = require('../db');

/**
 * @desc Obtener el perfil del usuario actual (logueado)
 * @route GET /api/perfil/me
 */
const getMyProfile = async (req, res) => {
    try {
        // req.user es adjuntado por el middleware 'protect' (gracias a NextAuth y tu middleware)
        // Asegúrate de que tu middleware decodifique bien el token.
        const userId = req.user.id; 

        // CORRECCIÓN: Tabla 'usuarios' en minúscula
        const [rows] = await db.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error en getMyProfile:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @desc Actualizar el perfil del usuario actual (logueado)
 * @route PUT /api/perfil/me
 */
const updateMyProfile = async (req, res) => {
    const userId = req.user.id;
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ message: 'Nombre y email son obligatorios.' });
    }

    try {
        // CORRECCIÓN: Tabla 'usuarios' en minúscula
        const query = 'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?';
        const [result] = await db.query(query, [nombre, email, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
        }

        // Devolvemos los datos actualizados
        res.status(200).json({
            id: userId,
            nombre: nombre,
            email: email,
            message: 'Perfil actualizado correctamente.'
        });
    } catch (error) {
        console.error('Error en updateMyProfile:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Conflicto: El email ya está en uso por otra cuenta.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el perfil.' });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
};