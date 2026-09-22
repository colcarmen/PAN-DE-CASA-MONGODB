const mongoose = require('mongoose');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Contador = require('../models/Contador');
const { enviarNotificacionCambioEstado } = require('../services/emailService');

const resolverQueryPedido = (idParam) => {
  if (!idParam) return null;
  const limpio = idParam.trim();
  if (/^ped-\d+$/i.test(limpio)) {
    const num = parseInt(limpio.replace(/ped-/i, ''), 10);
    return { $or: [{ codigo: limpio.toUpperCase() }, { id: num }] };
  }
  if (!isNaN(Number(limpio))) {
    const num = Number(limpio);
    return { $or: [{ id: num }, { codigo: `PED-${num}` }] };
  }
  if (mongoose.Types.ObjectId.isValid(limpio)) {
    return { $or: [{ codigo: limpio }, { _id: limpio }] };
  }
  return { codigo: limpio.toUpperCase() };
};

// GET /api/pedidos
exports.listarTodos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fechaPedido: -1 }).lean();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar pedidos', detalle: error.message });
  }
};

// GET /api/pedidos/:id (acepta "PED-5", "ped-5", "5", o _id)
exports.obtenerPorId = async (req, res) => {
  try {
    const query = resolverQueryPedido(req.params.id);
    if (!query) {
      return res.status(404).json({ error: 'Identificador de pedido inválido' });
    }

    const pedido = await Pedido.findOne(query).lean();
    if (!pedido) {
      return res.status(404).json({ error: `Pedido '${req.params.id}' no encontrado` });
    }

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar pedido', detalle: error.message });
  }
};

// POST /api/pedidos - Creación y descuento de stock
exports.crear = async (req, res) => {
  try {
    const { cliente: clienteData, direccionEnvio, metodoPago, notas, detalles } = req.body;

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'El pedido debe contener al menos un producto en detalles.' });
    }

    if (!direccionEnvio) {
      return res.status(400).json({ error: 'La dirección de envío es obligatoria.' });
    }

    // 1. Resolver Cliente
    let clienteDoc;
    if (clienteData && clienteData.id) {
      clienteDoc = await Cliente.findOne({ id: Number(clienteData.id) });
    } else if (clienteData && clienteData.email) {
      clienteDoc = await Cliente.findOne({ email: clienteData.email.trim().toLowerCase() });
    }

    if (!clienteDoc && clienteData && clienteData.email && clienteData.nombre) {
      const nuevoClienteId = await Contador.obtenerSiguienteSecuencia('cliente_id');
      clienteDoc = new Cliente({
        id: nuevoClienteId,
        nombre: clienteData.nombre,
        email: clienteData.email.trim().toLowerCase(),
        telefono: clienteData.telefono || '',
        direccion: clienteData.direccion || direccionEnvio,
        rol: 'CLIENTE'
      });
      await clienteDoc.save();
    }

    if (!clienteDoc) {
      return res.status(400).json({ error: 'No se pudo identificar o registrar al cliente.' });
    }

    // 2. Validar stock y recopilar productos de la base de datos
    const detallesProcesados = [];
    let totalConsolidado = 0;
    const productosAActualizar = [];

    for (let i = 0; i < detalles.length; i++) {
      const item = detalles[i];
      const prodId = item.producto?.id || item.productoId || item.id;
      const cantidad = Number(item.cantidad);

      if (!prodId || isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({ error: `Cantidad o identificador inválido en el ítem #${i + 1}.` });
      }

      let prodQuery;
      if (!isNaN(Number(prodId))) {
        prodQuery = { id: Number(prodId) };
      } else if (mongoose.Types.ObjectId.isValid(prodId)) {
        prodQuery = { _id: prodId };
      } else {
        return res.status(404).json({ error: `Producto con ID ${prodId} no existe.` });
      }

      const producto = await Producto.findOne(prodQuery);

      if (!producto) {
        return res.status(404).json({ error: `Producto con ID ${prodId} no existe.` });
      }

      if (producto.stock < cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para el producto: ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${cantidad}`
        });
      }

      const precioUnitario = Number(producto.precio);
      const subtotal = cantidad * precioUnitario;
      totalConsolidado += subtotal;

      detallesProcesados.push({
        id: i + 1,
        productoId: producto.id,
        cantidad,
        precioUnitario,
        subtotal,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria,
          imagenUrl: producto.imagenUrl
        }
      });

      productosAActualizar.push({ producto, cantidad });
    }

    // 3. Descontar stock atómicamente
    for (const item of productosAActualizar) {
      item.producto.stock -= item.cantidad;
      await item.producto.save();
    }

    // 4. Generar consecutivo correlativo PED-X
    const siguienteNum = await Contador.obtenerSiguienteSecuencia('pedido_id');
    const codigoPedido = `PED-${siguienteNum}`;

    const nuevoPedido = new Pedido({
      id: siguienteNum,
      codigo: codigoPedido,
      fechaPedido: new Date(),
      estado: 'PENDIENTE',
      total: totalConsolidado,
      direccionEnvio,
      metodoPago: metodoPago || 'EFECTIVO',
      notas: notas || '',
      cliente: {
        id: clienteDoc.id,
        nombre: clienteDoc.nombre,
        email: clienteDoc.email,
        telefono: clienteDoc.telefono || '',
        direccion: clienteDoc.direccion || direccionEnvio
      },
      detalles: detallesProcesados
    });

    const pedidoGuardado = await nuevoPedido.save();

    // Notificación inicial asíncrona
    enviarNotificacionCambioEstado(pedidoGuardado, 'PENDIENTE').catch(() => {});

    res.status(201).json(pedidoGuardado);
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el pedido', detalle: error.message });
  }
};

// PUT /api/pedidos/:id/estado?nuevoEstado={estado}
exports.actualizarEstado = async (req, res) => {
  try {
    const nuevoEstado = req.query.nuevoEstado || req.body.nuevoEstado || req.body.estado;

    const estadosValidos = ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
    if (!nuevoEstado || !estadosValidos.includes(nuevoEstado.toUpperCase())) {
      return res.status(400).json({
        error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
      });
    }

    const query = resolverQueryPedido(req.params.id);
    if (!query) {
      return res.status(404).json({ error: 'Identificador de pedido inválido' });
    }

    const pedido = await Pedido.findOne(query);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estado = nuevoEstado.toUpperCase();
    const pedidoActualizado = await pedido.save();

    // Disparar envío de correo corporativo
    enviarNotificacionCambioEstado(pedidoActualizado, pedidoActualizado.estado).catch(() => {});

    res.json(pedidoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado del pedido', detalle: error.message });
  }
};

