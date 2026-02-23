const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_seguro'; 

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
    const { nombre, email, password, rol } = req.body; // Agregado rol
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
        
        // Ajuste en el INSERT para incluir rol (por defecto cliente)
        const insertQuery = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(insertQuery, [nombre, email, hashedPassword, rol || 'cliente']);
        
        const newUserId = result.insertId;
        res.status(201).json({
            id: newUserId, nombre, email,
            rol: rol || 'cliente', // Devolvemos el rol
            token: generateToken(newUserId),
            message: 'Registro exitoso.'
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
        console.log("[DEBUG] Error: Email o Password faltantes.");
        return res.status(400).json({ message: 'Por favor, introduce email y contraseña.' });
    }

    console.log(`[DEBUG] Email recibido: ${email}`);

    try {
        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            console.log(`[DEBUG] Usuario no encontrado para email: ${email}`);
            return res.status(401).json({ message: 'Credenciales inválidas (Usuario no encontrado).' });
        }

        console.log(`[DEBUG] Usuario encontrado en DB: ${user.nombre}`);

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log("[DEBUG] ¡Contraseña VÁLIDA! Generando token.");
            res.json({
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol, // ⬅️ AJUSTE: Enviamos el rol de la base de datos
                token: generateToken(user.id),
                message: 'Login exitoso.'
            });
        } else {
            console.log("[DEBUG] ¡Contraseña INVÁLIDA! (bcrypt.compare falló)");
            res.status(401).json({ message: 'Credenciales inválidas (Contraseña incorrecta).' });
        }

    } catch (error) {
        console.error('Error catastrófico en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el inicio de sesión.' });
    }
};

module.exports = {
    register,
    login,
};