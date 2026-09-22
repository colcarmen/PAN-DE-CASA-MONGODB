const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.get('/metricas', adminController.obtenerMetricas);
router.put('/password', adminController.cambiarPassword);

module.exports = router;
