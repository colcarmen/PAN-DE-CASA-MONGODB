const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 100 },
    telefono: { type: String, trim: true, default: '' },
    direccion: { type: String, trim: true, default: '' },
    rol: { type: String, enum: ['CLIENTE', 'ADMIN'], default: 'CLIENTE' },
    activo: { type: Boolean, default: true },
    fechaRegistro: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Cliente', ClienteSchema);
