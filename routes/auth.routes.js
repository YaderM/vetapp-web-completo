// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// Definición de Rutas de Autenticación

// @route POST /api/auth/register
// @desc Registrar un nuevo usuario (veterinario/administrador)
// @access Public (No requiere token)
router.post('/register', register);

// @route POST /api/auth/login
// @desc Iniciar sesión y obtener un token JWT
// @access Public (No requiere token)
router.post('/login', login);

module.exports = router;