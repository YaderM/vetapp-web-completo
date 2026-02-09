// routes/perfil.routes.js
const express = require('express');
const { 
    getMyProfile,
    updateMyProfile
} = require('../controllers/perfil.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Definimos las rutas relativas a /api/perfil
// Ambas rutas están protegidas y usan el ID del token (req.user.id)

// GET /api/perfil/me
router.get('/me', protect, getMyProfile);

// PUT /api/perfil/me
router.put('/me', protect, updateMyProfile);

module.exports = router;