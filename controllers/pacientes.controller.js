const db = require('../db'); // Importa la conexión a MySQL

/**
 * @desc Obtener todos los pacientes (CON DATOS DEL PROPIETARIO)
 * @route GET /api/pacientes
 */
const getAllPacientes = async (req, res) => {
    // CORRECCIÓN: Tablas en minúscula y columnas coincidentes con la DB
    const query = `
        SELECT 
            p.id, p.nombre, p.especie, p.raza, p.fecha_nacimiento, p.genero,
            pr.id AS propietario_id, 
            pr.nombre AS propietario_nombre, 
            pr.apellido AS propietario_apellido
        FROM pacientes p
        LEFT JOIN propietarios pr ON p.propietarioId = pr.id
        ORDER BY p.nombre;
    `;
    
    try {
        const [rows] = await db.query(query);

        // Mapeamos el resultado plano de SQL al objeto anidado
        const pacientes = rows.map(row => ({
            id: row.id,
            nombre: row.nombre,
            especie: row.especie,
            raza: row.raza,
            fecha_nacimiento: row.fecha_nacimiento, // Ajustado a lo que hay en DB
            genero: row.genero, // Agregado
            // El frontend espera un objeto 'propietario' anidado
            propietario: {
                id: row.propietario_id,
                nombre: row.propietario_nombre,
                apellido: row.propietario_apellido
            }
        }));

        res.status(200).json(pacientes);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener pacientes.' });
    }
};

/**
 * @desc Obtener un paciente por ID (CON DATOS DEL PROPIETARIO)
 * @route GET /api/pacientes/:id
 */
const getPacienteById = async (req, res) => {
    const { id } = req.params;
    // CORRECCIÓN: Tablas en minúscula
    const query = `
        SELECT 
            p.id, p.nombre, p.especie, p.raza, p.fecha_nacimiento, p.genero, p.propietarioId,
            pr.id AS propietario_id, 
            pr.nombre AS propietario_nombre, 
            pr.apellido AS propietario_apellido
        FROM pacientes p
        LEFT JOIN propietarios pr ON p.propietarioId = pr.id
        WHERE p.id = ?;
    `;
    
    try {
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: `Paciente con ID ${id} no encontrado.` });
        }
        
        const row = rows[0];
        
        // Mapeamos al formato anidado
        const paciente = {
            id: row.id,
            nombre: row.nombre,
            especie: row.especie,
            raza: row.raza,
            fecha_nacimiento: row.fecha_nacimiento,
            genero: row.genero,
            propietarioId: row.propietarioId,
            propietario: {
                id: row.propietario_id,
                nombre: row.propietario_nombre,
                apellido: row.propietario_apellido
            }
        };
        
        res.status(200).json(paciente);
    } catch (error) {
        console.error(`Error al obtener paciente con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @desc Crear un nuevo paciente
 * @route POST /api/pacientes
 */
const createPaciente = async (req, res) => {
    // Ajustamos para recibir fecha_nacimiento y genero
    const { nombre, especie, raza, fecha_nacimiento, genero, propietarioId } = req.body;

    if (!nombre || !especie || !propietarioId) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, especie y propietarioId.' });
    }

    // CORRECCIÓN: Tabla 'pacientes' en minúscula y columnas correctas
    const query = 'INSERT INTO pacientes (nombre, especie, raza, fecha_nacimiento, genero, propietarioId) VALUES (?, ?, ?, ?, ?, ?)';
    
    try {
        const [result] = await db.query(query, [nombre, especie, raza || null, fecha_nacimiento || null, genero || null, propietarioId]);
        
        res.status(201).json({
            id: result.insertId,
            nombre, especie, raza, fecha_nacimiento, genero, propietarioId
        });
    } catch (error) {
        console.error('Error al crear paciente:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'Error: El propietarioId proporcionado no existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear paciente.' });
    }
};

/**
 * @desc Actualizar un paciente
 * @route PUT /api/pacientes/:id
 */
const updatePaciente = async (req, res) => {
    const { id } = req.params;
    const { nombre, especie, raza, fecha_nacimiento, genero, propietarioId } = req.body;

    if (!nombre || !especie || !propietarioId) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // CORRECCIÓN: Tabla 'pacientes' en minúscula
    const query = 'UPDATE pacientes SET nombre = ?, especie = ?, raza = ?, fecha_nacimiento = ?, genero = ?, propietarioId = ? WHERE id = ?';
    
    try {
        const [result] = await db.query(query, [nombre, especie, raza || null, fecha_nacimiento || null, genero || null, propietarioId, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No se encontró el Paciente con ID ${id} para actualizar.` });
        }
        
        res.status(200).json({ 
            id: id, 
            nombre, especie, raza, fecha_nacimiento, genero, propietarioId,
            message: 'Paciente actualizado correctamente.' 
        });
    } catch (error) {
        console.error(`Error al actualizar paciente con ID ${id}:`, error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'Error: El propietarioId proporcionado no existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar paciente.' });
    }
};

/**
 * @desc Eliminar un paciente
 * @route DELETE /api/pacientes/:id
 */
const deletePaciente = async (req, res) => {
    const { id } = req.params;
    // CORRECCIÓN: Tabla 'pacientes' en minúscula
    const query = 'DELETE FROM pacientes WHERE id = ?';
    
    try {
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No se encontró el Paciente con ID ${id} para eliminar.` });
        }
        
        res.status(200).json({ message: `Paciente con ID ${id} eliminado correctamente.` });
    } catch (error) {
        console.error(`Error al eliminar paciente con ID ${id}:`, error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ message: 'Conflicto: No se puede eliminar el paciente porque tiene citas asociadas.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al eliminar paciente.' });
    }
};

module.exports = {
    getAllPacientes,
    getPacienteById,
    createPaciente,
    updatePaciente,
    deletePaciente,
};