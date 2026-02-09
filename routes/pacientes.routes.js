// routes/pacientes.routes.js
const express = require('express');
const { 
    getAllPacientes,
    getPacienteById,
    createPaciente,
    updatePaciente,
    deletePaciente
} = require('../controllers/pacientes.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protegemos todas las rutas de pacientes
// GET /api/pacientes y POST /api/pacientes
router.route('/')
    .get(protect, getAllPacientes)
    .post(protect, createPaciente);

// GET /api/pacientes/:id, PUT /api/pacientes/:id, DELETE /api/pacientes/:id
router.route('/:id')
    .get(protect, getPacienteById)
    .put(protect, updatePaciente)
    .delete(protect, deletePaciente);

module.exports = router;