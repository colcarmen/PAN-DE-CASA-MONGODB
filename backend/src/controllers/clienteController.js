const Cliente = require('../models/Cliente');
const Contador = require('../models/Contador');

// POST /api/clientes - Idempotente por email
exports.registrarOObtener = async (req, res) => {
  try {
    const { nombre, email, telefono, direccion, rol } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    let cliente = await Cliente.findOne({ email: emailNormalizado });

    if (cliente) {
      // Actualizar datos si fueron proporcionados
      let modificado = false;
      if (nombre && cliente.nombre !== nombre) { cliente.nombre = nombre; modificado = true; }
      if (telefono && cliente.telefono !== telefono) { cliente.telefono = telefono; modificado = true; }
      if (direccion && cliente.direccion !== direccion) { cliente.direccion = direccion; modificado = true; }
      if (modificado) await cliente.save();

      return res.status(200).json(cliente);
    }

    // Si no existe, crear nuevo cliente
    const nuevoId = await Contador.obtenerSiguienteSecuencia('cliente_id');

    cliente = new Cliente({
      id: nuevoId,
      nombre,
      email: emailNormalizado,
      telefono: telefono || '',
      direccion: direccion || '',
      rol: rol || 'CLIENTE',
      activo: true
    });

    const guardado = await cliente.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar cliente', detalle: error.message });
  }
};

// GET /api/clientes
exports.listarTodos = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ id: 1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar clientes', detalle: error.message });
  }
};
