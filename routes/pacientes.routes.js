const express = require('express');
const { 
    getAllPacientes,
    getPacienteById,
    getPacientesByUsuario, // IMPORTANTE: Agregamos la nueva función aquí
    createPaciente,
    updatePaciente,
    deletePaciente
} = require('../controllers/pacientes.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// --- RUTAS DE PACIENTES ---

// 1. Ruta específica para la App (Debe ir antes de las rutas con :id)
// Esta es la que resuelve el "Cargando mascota..."
router.get('/usuario/:usuarioId', protect, getPacientesByUsuario);

// 2. Rutas generales
router.route('/')
    .get(protect, getAllPacientes)
    .post(protect, createPaciente);

// 3. Rutas por ID de paciente
router.route('/:id')
    .get(protect, getPacienteById)
    .put(protect, updatePaciente)
    .delete(protect, deletePaciente);

module.exports = router;