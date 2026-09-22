import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Producto } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'panDeCasa_cart';
  
  // Usamos Signals de Angular para reactividad ultra rápida y eficiente
  public items = signal<CartItem[]>(this.cargarItemsDesdeStorage());

  // Conteos computados reactivos
  public totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  public totalMonto = computed(() =>
    this.items().reduce((acc, item) => acc + (item.cantidad * item.producto.precio), 0)
  );

  constructor() {}

  private cargarItemsDesdeStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private guardarStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
  }

  public addToCart(producto: any): void {
    const itemsActuales = [...this.items()];
    const index = itemsActuales.findIndex(i => i.producto.id === producto.id);

    if (index !== -1) {
      itemsActuales[index] = {
        ...itemsActuales[index],
        cantidad: itemsActuales[index].cantidad + 1
      };
    } else {
      itemsActuales.push({
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          imagenUrl: producto.imagenUrl || 'assets/pan-canilla.jpg',
          categoria: producto.categoria || 'Panes',
          stock: producto.stock || 99
        },
        cantidad: 1
      });
    }

    this.items.set(itemsActuales);
    this.guardarStorage(itemsActuales);
  }

  public updateQuantity(productoId: number, nuevaCantidad: number): void {
    let itemsActuales = [...this.items()];

    if (nuevaCantidad <= 0) {
      itemsActuales = itemsActuales.filter(i => i.producto.id !== productoId);
    } else {
      const index = itemsActuales.findIndex(i => i.producto.id === productoId);
      if (index !== -1) {
        itemsActuales[index] = {
          ...itemsActuales[index],
          cantidad: nuevaCantidad
        };
      }
    }

    this.items.set(itemsActuales);
    this.guardarStorage(itemsActuales);
  }

  public removeFromCart(productoId: number): void {
    const itemsActuales = this.items().filter(i => i.producto.id !== productoId);
    this.items.set(itemsActuales);
    this.guardarStorage(itemsActuales);
  }

  public clearCart(): void {
    this.items.set([]);
    this.guardarStorage([]);
  }

  public getItemQuantity(productoId: number): number {
    const item = this.items().find(i => i.producto.id === productoId);
    return item ? item.cantidad : 0;
  }
}
