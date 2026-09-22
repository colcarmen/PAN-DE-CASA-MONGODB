const mongoose = require('mongoose');

const ConfiguracionSchema = new mongoose.Schema(
  {
    clave: { type: String, required: true, unique: true },
    valor: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Configuracion', ConfiguracionSchema);
