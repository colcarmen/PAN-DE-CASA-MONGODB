const mongoose = require('mongoose');

const ContadorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  secuencia: { type: Number, default: 0 }
});

ContadorSchema.statics.obtenerSiguienteSecuencia = async function (nombreSecuencia) {
  const contador = await this.findOneAndUpdate(
    { id: nombreSecuencia },
    { $inc: { secuencia: 1 } },
    { new: true, upsert: true }
  );
  return contador.secuencia;
};

module.exports = mongoose.model('Contador', ContadorSchema);
