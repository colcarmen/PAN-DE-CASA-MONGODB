const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Configuracion = require('../models/Configuracion');
const Contador = require('../models/Contador');

const sembrarDatosSiEsNecesario = async () => {
  try {
    const totalProductos = await Producto.countDocuments();
    if (totalProductos === 0) {
      console.log('[Seed] Sembrando productos iniciales de Pan de Casa...');

      const productosSeed = [
        {
          id: 1,
          nombre: 'Pan Canilla Artesanal',
          descripcion: 'Pan crujiente horneado con masa madre y corteza dorada.',
          precio: 3500,
          stock: 25,
          categoria: 'Panes',
          imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          disponible: true
        },
        {
          id: 2,
          nombre: 'Almojábana Tradicional',
          descripcion: 'Tradicional amasijo colombiano a base de cuajada fresca.',
          precio: 2500,
          stock: 40,
          categoria: 'Amasijos',
          imagenUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
          disponible: true
        },
        {
          id: 3,
          nombre: 'Buñuelo de Queso',
          descripcion: 'Esponjoso por dentro y crocante por fuera con queso costeño.',
          precio: 2000,
          stock: 50,
          categoria: 'Amasijos',
          imagenUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          disponible: true
        },
        {
          id: 4,
          nombre: 'Pan Blandito de Mantequilla',
          descripcion: 'Suave pan tradicional de panadería con aroma a mantequilla pura.',
          precio: 1800,
          stock: 30,
          categoria: 'Panes',
          imagenUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
          disponible: true
        },
        {
          id: 5,
          nombre: 'Torta de Choclo',
          descripcion: 'Deliciosa torta dulce artesanal con maíz tierno y queso campesino.',
          precio: 4500,
          stock: 15,
          categoria: 'Repostería',
          imagenUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
          disponible: true
        }
      ];

      await Producto.insertMany(productosSeed);
      await Contador.findOneAndUpdate(
        { id: 'producto_id' },
        { secuencia: 5 },
        { upsert: true }
      );
      console.log('[Seed] 5 productos creados exitosamente.');
    }

    const totalClientes = await Cliente.countDocuments();
    if (totalClientes === 0) {
      console.log('[Seed] Sembrando clientes iniciales...');
      const clientesSeed = [
        {
          id: 1,
          nombre: 'Aria González',
          email: 'aria.gonzalez@email.com',
          telefono: '3001234567',
          direccion: 'Calle 45 # 12-34, Bogotá',
          rol: 'CLIENTE',
          activo: true
        },
        {
          id: 2,
          nombre: 'Carlos Mendoza',
          email: 'carlos.admin@pandecasa.com',
          telefono: '3109876543',
          direccion: 'Carrera 7 # 89-01, Bogotá',
          rol: 'ADMIN',
          activo: true
        }
      ];

      await Cliente.insertMany(clientesSeed);
      await Contador.findOneAndUpdate(
        { id: 'cliente_id' },
        { secuencia: 2 },
        { upsert: true }
      );
      console.log('[Seed] 2 clientes creados exitosamente.');
    }

    const configAdmin = await Configuracion.findOne({ clave: 'admin_password' });
    if (!configAdmin) {
      await Configuracion.create({ clave: 'admin_password', valor: 'admin123' });
      console.log('[Seed] Clave administrativa establecida en: admin123');
    }
  } catch (error) {
    console.error('[Seed Error] Error al sembrar datos iniciales:', error.message);
  }
};

module.exports = { sembrarDatosSiEsNecesario };
