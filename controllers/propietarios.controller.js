const db = require('../db'); // Importamos la conexión a MySQL desde db.js

/**
 * @desc Obtener todos los propietarios
 * @route GET /api/propietarios
 */
const getAllPropietarios = async (req, res) => {
    // CORRECCIÓN: 'propietarios' en minúscula
    const query = 'SELECT * FROM propietarios ORDER BY apellido, nombre';
    try {
        const [rows] = await db.query(query); 
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener propietarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener propietarios.' });
    }
};

/**
 * @desc Obtener un propietario por ID
 * @route GET /api/propietarios/:id
 */
const getPropietarioById = async (req, res) => {
    const { id } = req.params;
    // CORRECCIÓN: 'propietarios' en minúscula
    const query = 'SELECT * FROM propietarios WHERE id = ?';
    try {
        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: `Propietario con ID ${id} no encontrado.` });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error al obtener propietario con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @desc Crear un nuevo propietario
 * @route POST /api/propietarios
 */
const createPropietario = async (req, res) => {
    const { nombre, apellido, telefono, email, direccion } = req.body;
    if (!nombre || !apellido || !telefono || !email) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, apellido, teléfono y email.' });
    }
    // CORRECCIÓN: 'propietarios' en minúscula
    const query = 'INSERT INTO propietarios (nombre, apellido, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)';
    try {
        const [result] = await db.query(query, [nombre, apellido, telefono, email, direccion]);
        res.status(201).json({
            id: result.insertId,
            nombre,
            apellido,
            telefono,
            email,
            direccion,
            message: 'Propietario creado exitosamente.'
        });
    } catch (error) {
        console.error('Error al crear propietario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Conflicto: El email proporcionado ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear propietario.' });
    }
};

/**
 * @desc Actualizar un propietario
 * @route PUT /api/propietarios/:id
 */
const updatePropietario = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono, email, direccion } = req.body;
    if (!nombre || !apellido || !telefono || !email) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para la actualización.' });
    }
    // CORRECCIÓN: 'propietarios' en minúscula
    const query = 'UPDATE propietarios SET nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?';
    try {
        const [result] = await db.query(query, [nombre, apellido, telefono, email, direccion, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No se encontró el Propietario con ID ${id} para actualizar.` });
        }
        res.status(200).json({ 
            id: id,
            nombre,
            apellido,
            telefono,
            email,
            direccion,
            message: 'Propietario actualizado correctamente.' 
        });
    } catch (error) {
        console.error(`Error al actualizar propietario con ID ${id}:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Conflicto: El email proporcionado ya está en uso por otro propietario.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar propietario.' });
    }
};

/**
 * @desc Eliminar un propietario
 * @route DELETE /api/propietarios/:id
 */
const deletePropietario = async (req, res) => {
    const { id } = req.params;
    // CORRECCIÓN: 'propietarios' en minúscula
    const query = 'DELETE FROM propietarios WHERE id = ?';
    try {
        const [result] = await db.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No se encontró el Propietario con ID ${id} para eliminar.` });
        }
        res.status(200).json({ message: `Propietario con ID ${id} eliminado correctamente.` });
    } catch (error) {
        console.error(`Error al eliminar propietario con ID ${id}:`, error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ message: 'Conflicto: No se puede eliminar el propietario porque tiene pacientes asociados.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al eliminar propietario.' });
    }
};

module.exports = {
    getAllPropietarios,
    getPropietarioById,
    createPropietario,
    updatePropietario,
    deletePropietario,
};