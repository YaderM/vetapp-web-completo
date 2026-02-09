// controllers/citas.controller.js
const db = require('../db'); // Importa la conexión a MySQL

/**
 * @desc Obtener todas las citas (CON JOINs)
 * @route GET /api/citas
 */
const getAllCitas = async (req, res) => {
    // Consulta SQL con JOINs para obtener nombres de paciente y propietario
    const query = `
        SELECT 
            c.id, c.fecha, c.motivo, c.pacienteId,
            p.nombre AS pacienteNombre,
            pr.nombre AS propietarioNombre,
            pr.apellido AS propietarioApellido
        FROM Citas c
        JOIN Pacientes p ON c.pacienteId = p.id
        JOIN Propietarios pr ON p.propietarioId = pr.id
        ORDER BY c.fecha DESC;
    `;
    
    try {
        const [rows] = await db.query(query);
        
        // Mapeamos el resultado para que coincida con la interfaz del frontend
        const citas = rows.map(row => ({
            id: row.id,
            fecha: row.fecha,
            motivo: row.motivo,
            pacienteId: row.pacienteId,
            pacienteNombre: row.pacienteNombre,
            propietarioNombre: `${row.propietarioNombre} ${row.propietarioApellido}`
        }));

        res.status(200).json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener citas.' });
    }
};

/**
 * @desc Obtener una cita por ID (CON JOINs)
 * @route GET /api/citas/:id
 */
const getCitaById = async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT 
            c.id, c.fecha, c.motivo, c.pacienteId,
            p.nombre AS pacienteNombre
        FROM Citas c
        JOIN Pacientes p ON c.pacienteId = p.id
        WHERE c.id = ?;
    `;
    
    try {
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: `Cita con ID ${id} no encontrada.` });
        }
        
        const row = rows[0];
        // Mapeamos
        const cita = {
            id: row.id,
            fecha: row.fecha,
            motivo: row.motivo,
            pacienteId: row.pacienteId,
            pacienteNombre: row.pacienteNombre,
        };
        
        res.status(200).json(cita);
    } catch (error) {
        console.error(`Error al obtener cita con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @desc Crear una nueva cita
 * @route POST /api/citas
 */
const createCita = async (req, res) => {
    const { fecha, motivo, pacienteId } = req.body;

    if (!fecha || !motivo || !pacienteId) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: fecha, motivo y pacienteId.' });
    }

    const query = 'INSERT INTO Citas (fecha, motivo, pacienteId) VALUES (?, ?, ?)';
    
    try {
        const [result] = await db.query(query, [fecha, motivo, pacienteId]);
        
        res.status(201).json({
            id: result.insertId,
            fecha, motivo, pacienteId
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'Error: El pacienteId proporcionado no existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear cita.' });
    }
};

/**
 * @desc Actualizar una cita
 * @route PUT /api/citas/:id
 */
const updateCita = async (req, res) => {
    const { id } = req.params;
    const { fecha, motivo, pacienteId } = req.body;

    if (!fecha || !motivo || !pacienteId) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const query = 'UPDATE Citas SET fecha = ?, motivo = ?, pacienteId = ? WHERE id = ?';
    
    try {
        const [result] = await db.query(query, [fecha, motivo, pacienteId, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No se encontró la Cita con ID ${id} para actualizar.` });
        }
        
        res.status(200).json({ 
            id: id, 
            fecha, motivo, pacienteId,
            message: 'Cita actualizada correctamente.' 
        });
    } catch (error) {
        console.error(`Error al actualizar cita con ID ${id}:`, error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'Error: El pacienteId proporcionado no existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar cita.' });
    }
};

/**
 * @desc Eliminar una cita
 * @route DELETE /api/citas/:id
 */
const deleteCita = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Citas WHERE id = ?';
    
    try {
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No se encontró la Cita con ID ${id} para eliminar.` });
        }
        
        res.status(200).json({ message: `Cita con ID ${id} eliminada correctamente.` });
    } catch (error) {
        console.error(`Error al eliminar cita con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar cita.' });
    }
};

module.exports = {
    getAllCitas,
    getCitaById,
    createCita,
    updateCita,
    deleteCita,
};