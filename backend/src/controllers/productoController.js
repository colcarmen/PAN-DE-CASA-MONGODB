const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const Contador = require('../models/Contador');

const construirQuery = (idParam) => {
  if (!isNaN(Number(idParam))) {
    return { id: Number(idParam) };
  }
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    return { _id: idParam };
  }
  return null;
};

// GET /api/productos
exports.listarTodos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ id: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos', detalle: error.message });
  }
};

// GET /api/productos/:id
exports.obtenerPorId = async (req, res) => {
  try {
    const query = construirQuery(req.params.id);
    if (!query) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = await Producto.findOne(query);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar producto', detalle: error.message });
  }
};

// POST /api/productos
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, imagenUrl, disponible } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Nombre, precio y stock son campos obligatorios.' });
    }

    const nuevoId = await Contador.obtenerSiguienteSecuencia('producto_id');

    const producto = new Producto({
      id: nuevoId,
      nombre,
      descripcion: descripcion || '',
      precio: Number(precio),
      stock: Number(stock),
      categoria: categoria || 'Panes',
      imagenUrl: imagenUrl || 'assets/pan-canilla.jpg',
      disponible: disponible !== undefined ? disponible : true
    });

    const guardado = await producto.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto', detalle: error.message });
  }
};

// PUT /api/productos/:id
exports.actualizar = async (req, res) => {
  try {
    const query = construirQuery(req.params.id);
    if (!query) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = await Producto.findOne(query);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { nombre, descripcion, precio, stock, categoria, imagenUrl, disponible } = req.body;

    if (nombre !== undefined) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (precio !== undefined) producto.precio = Number(precio);
    if (stock !== undefined) producto.stock = Number(stock);
    if (categoria !== undefined) producto.categoria = categoria;
    if (imagenUrl !== undefined) producto.imagenUrl = imagenUrl;
    if (disponible !== undefined) producto.disponible = disponible;

    const actualizado = await producto.save();
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto', detalle: error.message });
  }
};

// DELETE /api/productos/:id
exports.eliminar = async (req, res) => {
  try {
    const query = construirQuery(req.params.id);
    if (!query) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = await Producto.findOneAndDelete(query);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      mensaje: 'Producto eliminado correctamente',
      idEliminado: producto.id || producto._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto', detalle: error.message });
  }
};

