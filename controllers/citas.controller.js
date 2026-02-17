const db = require('../db'); // Importa la conexión a MySQL

/**
 * @desc Obtener todas las citas (CON JOINs)
 * @route GET /api/citas
 */
const getAllCitas = async (req, res) => {
    // CORRECCIÓN: Tablas 'citas', 'pacientes', 'propietarios' en minúscula
    const query = `
        SELECT 
            c.id, c.fecha, c.hora, c.motivo, c.estado, c.pacienteId,
            p.nombre AS pacienteNombre,
            pr.nombre AS propietarioNombre,
            pr.apellido AS propietarioApellido
        FROM citas c
        JOIN pacientes p ON c.pacienteId = p.id
        JOIN propietarios pr ON p.propietarioId = pr.id
        ORDER BY c.fecha DESC, c.hora ASC;
    `;
    
    try {
        const [rows] = await db.query(query);
        
        // Mapeamos el resultado para que coincida con la interfaz del frontend
        const citas = rows.map(row => ({
            id: row.id,
            fecha: row.fecha,
            hora: row.hora, // Agregué hora por si la necesitas en el front
            motivo: row.motivo,
            estado: row.estado,
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
    // CORRECCIÓN: Tablas en minúscula
    const query = `
        SELECT 
            c.id, c.fecha, c.hora, c.motivo, c.estado, c.pacienteId,
            p.nombre AS pacienteNombre
        FROM citas c
        JOIN pacientes p ON c.pacienteId = p.id
        WHERE c.id = ?;
    `;
    
    try {
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: `Cita con ID ${id} no encontrada.` });
        }
        
        const row = rows[0];
        const cita = {
            id: row.id,
            fecha: row.fecha,
            hora: row.hora,
            motivo: row.motivo,
            estado: row.estado,
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
    const { fecha, hora, motivo, pacienteId } = req.body;

    if (!fecha || !motivo || !pacienteId) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // CORRECCIÓN: Tabla 'citas' en minúscula y agregamos campo 'hora' si viene
    const query = 'INSERT INTO citas (fecha, hora, motivo, pacienteId) VALUES (?, ?, ?, ?)';
    
    try {
        // Si no mandan hora, ponemos una por defecto o null
        const horaFinal = hora || '00:00:00'; 
        const [result] = await db.query(query, [fecha, horaFinal, motivo, pacienteId]);
        
        res.status(201).json({
            id: result.insertId,
            fecha, hora: horaFinal, motivo, pacienteId
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
    const { fecha, hora, motivo, estado, pacienteId } = req.body;

    if (!fecha || !motivo || !pacienteId) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // CORRECCIÓN: Tabla 'citas' en minúscula
    const query = 'UPDATE citas SET fecha = ?, hora = ?, motivo = ?, estado = ?, pacienteId = ? WHERE id = ?';
    
    try {
        const horaFinal = hora || '00:00:00';
        const estadoFinal = estado || 'Pendiente';
        const [result] = await db.query(query, [fecha, horaFinal, motivo, estadoFinal, pacienteId, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No se encontró la Cita con ID ${id} para actualizar.` });
        }
        
        res.status(200).json({ 
            id: id, 
            fecha, hora: horaFinal, motivo, estado: estadoFinal, pacienteId,
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
    // CORRECCIÓN: Tabla 'citas' en minúscula
    const query = 'DELETE FROM citas WHERE id = ?';
    
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