import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://127.0.0.1:5000/api/productos';
  private cacheProductos: Producto[] | null = null;

  constructor(private http: HttpClient) {}

  getProductos(forzarRefresco = false): Observable<Producto[]> {
    if (this.cacheProductos && !forzarRefresco) {
      return of(this.cacheProductos);
    }
    return this.http.get<Producto[]>(this.apiUrl).pipe(
      tap((data) => {
        this.cacheProductos = data;
      })
    );
  }

  limpiarCache(): void {
    this.cacheProductos = null;
  }

  getProducto(id: number | string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  createProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto).pipe(
      tap(() => this.limpiarCache())
    );
  }

  updateProducto(id: number | string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto).pipe(
      tap(() => this.limpiarCache())
    );
  }

  deleteProducto(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.limpiarCache())
    );
  }
}
