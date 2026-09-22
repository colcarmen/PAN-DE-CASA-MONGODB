const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    descripcion: { type: String, trim: true, maxlength: 255, default: '' },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    categoria: { type: String, required: true, trim: true, maxlength: 50, default: 'Panes' },
    imagenUrl: { type: String, trim: true, default: 'assets/pan-canilla.jpg' },
    disponible: { type: Boolean, default: true }
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

// Índice compuesto para acelerar filtrados de catálogo
ProductoSchema.index({ categoria: 1, disponible: 1 });

module.exports = mongoose.model('Producto', ProductoSchema);
