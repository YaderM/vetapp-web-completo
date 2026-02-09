// routes/citas.routes.js
const express = require('express');
const { 
    getAllCitas,
    getCitaById,
    createCita,
    updateCita,
    deleteCita
} = require('../controllers/citas.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protegemos todas las rutas
router.route('/')
    .get(protect, getAllCitas)
    .post(protect, createCita);

router.route('/:id')
    .get(protect, getCitaById)
    .put(protect, updateCita)
    .delete(protect, deleteCita);

module.exports = router;