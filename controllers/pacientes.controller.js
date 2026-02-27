const db = require('../db'); 

/**
 * @desc Obtener todos los pacientes (CON DATOS DEL PROPIETARIO VINCULADO POR USUARIO_ID)
 */
const getAllPacientes = async (req, res) => {
    const query = `
        SELECT 
            p.id, p.nombre, p.especie, p.raza, p.fecha_nacimiento, p.genero,
            pr.id AS propietario_id, 
            pr.nombre AS propietario_nombre, 
            pr.apellido AS propietario_apellido
        FROM pacientes p
        LEFT JOIN propietarios pr ON p.usuario_id = pr.usuario_id
        ORDER BY p.nombre;
    `;
    
    try {
        const [rows] = await db.query(query);
        const pacientes = rows.map(row => ({
            id: row.id,
            nombre: row.nombre,
            especie: row.especie,
            raza: row.raza,
            fecha_nacimiento: row.fecha_nacimiento,
            genero: row.genero,
            propietario: {
                id: row.propietario_id,
                nombre: row.propietario_nombre,
                apellido: row.propietario_apellido
            }
        }));
        res.status(200).json(pacientes);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @desc Obtener un paciente por ID
 */
const getPacienteById = async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT 
            p.id, p.nombre, p.especie, p.raza, p.fecha_nacimiento, p.genero, p.usuario_id,
            pr.id AS propietario_id, 
            pr.nombre AS propietario_nombre, 
            pr.apellido AS propietario_apellido
        FROM pacientes p
        LEFT JOIN propietarios pr ON p.usuario_id = pr.usuario_id
        WHERE p.id = ?;
    `;
    
    try {
        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) return res.status(404).json({ message: `Paciente no encontrado.` });
        
        const row = rows[0];
        res.status(200).json({
            id: row.id,
            nombre: row.nombre,
            especie: row.especie,
            raza: row.raza,
            fecha_nacimiento: row.fecha_nacimiento,
            genero: row.genero,
            usuario_id: row.usuario_id,
            propietario: {
                id: row.propietario_id,
                nombre: row.propietario_nombre,
                apellido: row.propietario_apellido
            }
        });
    } catch (error) {
        console.error(`Error al obtener paciente:`, error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @desc NUEVO: Obtener pacientes por USUARIO_ID (Para Android)
 */
const getPacientesByUsuario = async (req, res) => {
    const { usuarioId } = req.params;
    const query = 'SELECT * FROM pacientes WHERE usuario_id = ?';
    
    try {
        const [rows] = await db.query(query, [usuarioId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener mascotas por usuario:', error);
        res.status(500).json({ message: 'Error al obtener las mascotas.' });
    }
};

/**
 * @desc Crear un nuevo paciente
 */
const createPaciente = async (req, res) => {
    const { nombre, especie, raza, fecha_nacimiento, genero, usuario_id } = req.body;
    if (!nombre || !especie || !usuario_id) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, especie y usuario_id.' });
    }

    const query = 'INSERT INTO pacientes (nombre, especie, raza, fecha_nacimiento, genero, usuario_id) VALUES (?, ?, ?, ?, ?, ?)';
    try {
        const [result] = await db.query(query, [nombre, especie, raza || null, fecha_nacimiento || null, genero || null, usuario_id]);
        res.status(201).json({ id: result.insertId, nombre, especie, raza, fecha_nacimiento, genero, usuario_id });
    } catch (error) {
        console.error('Error al crear paciente:', error);
        res.status(500).json({ message: 'Error al cargar el paciente.' });
    }
};

const updatePaciente = async (req, res) => {
    const { id } = req.params;
    const { nombre, especie, raza, fecha_nacimiento, genero, usuario_id } = req.body;
    const query = 'UPDATE pacientes SET nombre = ?, especie = ?, raza = ?, fecha_nacimiento = ?, genero = ?, usuario_id = ? WHERE id = ?';
    try {
        const [result] = await db.query(query, [nombre, especie, raza || null, fecha_nacimiento || null, genero || null, usuario_id, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado.' });
        res.status(200).json({ id, nombre, message: 'Actualizado.' });
    } catch (error) { res.status(500).json({ message: 'Error.' }); }
};

const deletePaciente = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM pacientes WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado.' });
        res.status(200).json({ message: 'Eliminado.' });
    } catch (error) { res.status(500).json({ message: 'Error.' }); }
};

module.exports = {
    getAllPacientes,
    getPacienteById,
    getPacientesByUsuario, // Exportar la nueva función
    createPaciente,
    updatePaciente,
    deletePaciente,
};