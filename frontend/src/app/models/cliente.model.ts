export interface Cliente {
  _id?: string;
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol?: 'CLIENTE' | 'ADMIN';
  activo?: boolean;
}
