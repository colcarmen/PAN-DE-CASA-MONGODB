require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { sembrarDatosSiEsNecesario } = require('./utils/seedData');

const productoRoutes = require('./routes/productoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mensaje: 'Servidor Pan de Casa (Node.js + Express + MongoDB) operativo',
    timestamp: new Date()
  });
});

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Iniciar servidor tras conectar a MongoDB
const startServer = async () => {
  await connectDB();
  await sembrarDatosSiEsNecesario();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🥐 Servidor Pan de Casa corriendo en: http://127.0.0.1:${PORT}`);
    console.log(`📦 MongoDB conectado: pandecasa_db`);
    console.log(`======================================================\n`);
  });
};

startServer();
