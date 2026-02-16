// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_seguro'; 

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// ... (El código de 'register' no cambia) ...
const register = async (req, res) => {
    const { nombre, email, password } = req.body;
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
        const insertQuery = 'INSERT INTO Usuarios (nombre, email, password) VALUES (?, ?, ?)';
        const [result] = await db.query(insertQuery, [nombre, email, hashedPassword]);
        const newUserId = result.insertId;
        res.status(201).json({
            id: newUserId, nombre, email,
            token: generateToken(newUserId),
            message: 'Registro exitoso.'
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};


// ----- SECCIÓN DE LOGIN (CON DEPURACIÓN) -----
const login = async (req, res) => {
    console.log("\n--- [DEBUG] Intento de Login Recibido ---");
    
    const { email, password } = req.body;

    if (!email || !password) {
        console.log("[DEBUG] Error: Email o Password faltantes.");
        return res.status(400).json({ message: 'Por favor, introduce email y contraseña.' });
    }

    console.log(`[DEBUG] Email recibido: ${email}`);
    console.log(`[DEBUG] Contraseña recibida: ${password}`); // (Solo para depuración)

    try {
        // 1. Buscar usuario
        const [users] = await db.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            console.log(`[DEBUG] Usuario no encontrado para email: ${email}`);
            return res.status(401).json({ message: 'Credenciales inválidas (Usuario no encontrado).' });
        }

        console.log(`[DEBUG] Usuario encontrado en DB: ${user.nombre}`);
        console.log(`[DEBUG] Hash en DB: ${user.password}`);

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log("[DEBUG] ¡Contraseña VÁLIDA! Generando token.");
            // Éxito: Generar JWT y responder
            res.json({
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                token: generateToken(user.id),
                message: 'Login exitoso.'
            });
        } else {
            console.log("[DEBUG] ¡Contraseña INVÁLIDA! (bcrypt.compare falló)");
            // Fallo: Contraseña inválida
            res.status(401).json({ message: 'Credenciales inválidas (Contraseña incorrecta).' });
        }

    } catch (error) {
        console.error('Error catastrófico en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el inicio de sesión.' });
    }
};
// ----- FIN DE SECCIÓN DE LOGIN -----


module.exports = {
    register,
    login,
};