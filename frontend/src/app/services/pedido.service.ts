import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido, EstadoPedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'http://127.0.0.1:5000/api/pedidos';

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  getPedidoPorCodigo(codigo: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${encodeURIComponent(codigo.trim())}`);
  }

  crearPedido(pedidoPayload: any): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedidoPayload);
  }

  actualizarEstado(idOCodigo: string | number, nuevoEstado: EstadoPedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${idOCodigo}/estado?nuevoEstado=${nuevoEstado}`, {});
  }
}
