export interface Producto {
  _id?: string;
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl: string;
  disponible: boolean;
}
