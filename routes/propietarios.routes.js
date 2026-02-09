// propietarios.routes.js
const express = require('express');
const { 
    getAllPropietarios, 
    getPropietarioById, 
    createPropietario, 
    updatePropietario, 
    deletePropietario 
} = require('../controllers/propietarios.controller');
const { protect } = require('../middleware/auth.middleware'); // Aseguramos el require

const router = express.Router();

// Todas estas rutas están protegidas con el middleware `protect`
router.post('/', protect, createPropietario);
router.get('/', protect, getAllPropietarios);
router.get('/:id', protect, getPropietarioById);
router.put('/:id', protect, updatePropietario);
router.delete('/:id', protect, deletePropietario);

module.exports = router;