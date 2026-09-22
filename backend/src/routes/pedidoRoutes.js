const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/', pedidoController.listarTodos);
router.get('/:id', pedidoController.obtenerPorId);
router.post('/', pedidoController.crear);
router.put('/:id/estado', pedidoController.actualizarEstado);

module.exports = router;
