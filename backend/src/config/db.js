const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pandecasa_db';
    const conn = await mongoose.connect(connUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Forzar IPv4 para evitar demoras de resolución IPv6 en Windows
    });
    console.log(`[MongoDB] Conectado exitosamente a: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Fallo al conectar: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
