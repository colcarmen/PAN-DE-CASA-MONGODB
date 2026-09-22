const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pandecasa_db';
    const conn = await mongoose.connect(connUri);
    console.log(`[MongoDB] Conectado exitosamente a: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Fallo al conectar: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
