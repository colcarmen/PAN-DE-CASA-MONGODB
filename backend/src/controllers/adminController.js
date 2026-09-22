const Configuracion = require('../models/Configuracion');
const Pedido = require('../models/Pedido');

// Obtener o inicializar la clave admin
const obtenerClaveAdmin = async () => {
  let config = await Configuracion.findOne({ clave: 'admin_password' });
  if (!config) {
    config = new Configuracion({ clave: 'admin_password', valor: 'admin123' });
    await config.save();
  }
  return config.valor;
};

// POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es obligatoria.' });
    }

    const claveActual = await obtenerClaveAdmin();

    if (password === claveActual) {
      return res.json({
        success: true,
        rol: 'ADMIN',
        mensaje: 'Bienvenido al panel de administración de Pan de Casa'
      });
    }

    return res.status(401).json({ success: false, error: 'Contraseña de administrador incorrecta' });
  } catch (error) {
    res.status(500).json({ error: 'Error en autenticación', detalle: error.message });
  }
};

// GET /api/admin/metricas
exports.obtenerMetricas = async (req, res) => {
  try {
    const pedidos = await Pedido.find();

    let ventasTotales = 0;
    let pedidosTotales = pedidos.length;
    let pendientesEnvio = 0;
    const aHornearMap = {};

    pedidos.forEach((p) => {
      ventasTotales += Number(p.total) || 0;

      if (p.estado === 'PENDIENTE') {
        pendientesEnvio++;
      }

      // Regla de producción: órdenes en PENDIENTE o EN_PREPARACION
      if (p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION') {
        (p.detalles || []).forEach((d) => {
          const nombreProd = d.producto?.nombre || `Producto #${d.productoId}`;
          if (!aHornearMap[nombreProd]) {
            aHornearMap[nombreProd] = 0;
          }
          aHornearMap[nombreProd] += Number(d.cantidad) || 0;
        });
      }
    });

    const aHornear = Object.keys(aHornearMap).map((nombre) => ({
      producto: nombre,
      cantidadRequerida: aHornearMap[nombre]
    }));

    res.json({
      ventasTotales,
      pedidosTotales,
      pendientesEnvio,
      aHornear
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular métricas', detalle: error.message });
  }
};

// PUT /api/admin/password
exports.cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;

    if (!nuevaPassword || nuevaPassword.trim().length < 4) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres.' });
    }

    const claveActual = await obtenerClaveAdmin();

    // Si envía passwordActual, validarla
    if (passwordActual && passwordActual !== claveActual) {
      return res.status(401).json({ error: 'La contraseña actual no coincide.' });
    }

    let config = await Configuracion.findOne({ clave: 'admin_password' });
    if (!config) {
      config = new Configuracion({ clave: 'admin_password', valor: nuevaPassword.trim() });
    } else {
      config.valor = nuevaPassword.trim();
    }
    await config.save();

    res.json({ mensaje: 'Contraseña actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contraseña', detalle: error.message });
  }
};
