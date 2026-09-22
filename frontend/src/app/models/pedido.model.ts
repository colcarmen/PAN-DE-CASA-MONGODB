import { Cliente } from './cliente.model';

export interface DetallePedido {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: {
    id?: number;
    nombre: string;
    categoria?: string;
    imagenUrl?: string;
  };
}

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';

export interface Pedido {
  _id?: string;
  id: number;
  codigo: string;
  fechaPedido: string | Date;
  estado: EstadoPedido;
  total: number;
  direccionEnvio: string;
  metodoPago: string;
  notas?: string;
  cliente: Cliente;
  detalles: DetallePedido[];
}

export interface CartItem {
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagenUrl: string;
    categoria: string;
    stock: number;
  };
  cantidad: number;
}
