const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_seguro'; 

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
    // AHORA RECIBIMOS: mascotaNombre y mascotaEspecie desde el celular
    const { nombre, email, password, rol, mascotaNombre, mascotaEspecie } = req.body; 
    const userRol = rol || 'cliente'; 

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Por favor, introduce todos los campos: nombre, email y contraseña.' });
    }

    try {
        const [existingUser] = await db.query('SELECT id, email FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El usuario con ese email ya existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 1. Insertamos en la tabla 'usuarios'
        const insertQuery = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(insertQuery, [nombre, email, hashedPassword, userRol]);
        
        const newUserId = result.insertId;

        // --- BLOQUE DE SINCRONIZACIÓN AUTOMÁTICA (PROPIETARIO + PACIENTE) ---
        if (userRol === 'cliente') {
            // A. CREAR PROPIETARIO
            const insertPropQuery = 'INSERT INTO propietarios (nombre, apellido, email, usuario_id) VALUES (?, ?, ?, ?)';
            await db.query(insertPropQuery, [nombre, '', email, newUserId]);
            
            // B. CREAR PACIENTE (MASCOTA) AUTOMÁTICAMENTE
            // Si no mandan nombre de mascota, usamos "Mi Mascota" por defecto
            const nombreFinalMascota = mascotaNombre || 'Mi Mascota';
            const especieFinal = mascotaEspecie || 'No especificada';

            const insertMascotaQuery = 'INSERT INTO pacientes (nombre, especie, usuario_id) VALUES (?, ?, ?)';
            await db.query(insertMascotaQuery, [nombreFinalMascota, especieFinal, newUserId]);
            
            console.log(`[DEBUG] Propietario y Mascota (${nombreFinalMascota}) creados para: ${nombre}`);
        }
        // --------------------------------------------

        res.status(201).json({
            id: newUserId, nombre, email,
            rol: userRol, 
            token: generateToken(newUserId),
            message: 'Registro exitoso con mascota vinculada.'
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};

const login = async (req, res) => {
    console.log("\n--- [DEBUG] Intento de Login Recibido ---");
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, introduce email y contraseña.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol, 
                token: generateToken(user.id),
                message: 'Login exitoso.'
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }

    } catch (error) {
        console.error('Error catastrófico en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
    register,
    login,
};