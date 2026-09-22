const mongoose = require('mongoose');

const DetallePedidoSchema = new mongoose.Schema({
  id: { type: Number },
  productoId: { type: Number, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  producto: {
    id: { type: Number },
    nombre: { type: String, required: true },
    categoria: { type: String },
    imagenUrl: { type: String }
  }
});

const PedidoSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true },
    codigo: { type: String, unique: true, index: true },
    fechaPedido: { type: Date, default: Date.now },
    estado: {
      type: String,
      enum: ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'],
      default: 'PENDIENTE'
    },
    total: { type: Number, required: true, min: 0 },
    direccionEnvio: { type: String, required: true, trim: true },
    metodoPago: { type: String, default: 'EFECTIVO', trim: true },
    notas: { type: String, default: '', trim: true },
    cliente: {
      id: { type: Number },
      nombre: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, default: '' },
      direccion: { type: String, default: '' }
    },
    detalles: [DetallePedidoSchema]
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

// Índices para acelerar ordenamientos y filtros frecuentes
PedidoSchema.index({ fechaPedido: -1 });
PedidoSchema.index({ estado: 1 });

module.exports = mongoose.model('Pedido', PedidoSchema);
