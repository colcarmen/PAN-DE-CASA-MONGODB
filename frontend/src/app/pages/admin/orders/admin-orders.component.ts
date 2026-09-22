import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido, EstadoPedido } from '../../../models/pedido.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-page container animate-fade-in">
      <div class="row">
        <!-- SIDEBAR -->
        <div class="col s12 l3">
          <app-admin-sidebar></app-admin-sidebar>
        </div>

        <!-- CONTENIDO PEDIDOS ACTIVOS -->
        <div class="col s12 l9">
          <div class="header-orders-bar">
            <div>
              <h1 class="admin-main-title">
                <i class="material-icons left">assignment</i> Gestión de Pedidos Activos
              </h1>
              <p class="admin-main-subtitle">
                Supervisa el flujo de pedidos y actualiza en tiempo real su avance para los clientes.
              </p>
            </div>
            <button (click)="cargarPedidos()" class="btn btn-secondary btn-small waves-effect" title="Recargar órdenes">
              <i class="material-icons left">refresh</i> Actualizar
            </button>
          </div>

          <!-- SPINNER DE CARGA -->
          <div *ngIf="cargando" class="center-align p-5">
            <div class="preloader-wrapper small active">
              <div class="spinner-layer spinner-orange-only">
                <div class="circle-clipper left"><div class="circle"></div></div>
                <div class="gap-patch"><div class="circle"></div></div>
                <div class="circle-clipper right"><div class="circle"></div></div>
              </div>
            </div>
          </div>

          <!-- ESTADO VACÍO -->
          <div *ngIf="!cargando && pedidos.length === 0" class="card center-align p-5 empty-orders-box">
            <i class="material-icons large text-muted">inbox</i>
            <h4>No hay pedidos registrados</h4>
            <p class="text-muted">Las nuevas compras que realicen los clientes aparecerán listadas aquí.</p>
          </div>

          <!-- LISTA VERTICAL DE PEDIDOS -->
          <div *ngIf="!cargando && pedidos.length > 0" class="orders-list">
            <div *ngFor="let p of pedidos" class="order-admin-card card">
              <div class="row m-0 order-card-layout">
                <!-- LADO IZQUIERDO: DETALLES DEL CLIENTE Y PRODUCTOS -->
                <div class="col s12 m8 order-left-col">
                  <div class="order-badge-row">
                    <span class="order-code-tag">{{ p.codigo || ('PED-' + p.id) }}</span>
                    <span class="order-date"><i class="material-icons tiny">event</i> {{ p.fechaPedido | date:'medium' }}</span>
                  </div>

                  <div class="customer-info-box mt-2">
                    <h3 class="cust-name">{{ p.cliente?.nombre }}</h3>
                    <div class="cust-detail">
                      <i class="material-icons tiny">phone</i> {{ p.cliente?.telefono || 'Sin teléfono' }}
                      <span class="mx-2">•</span>
                      <i class="material-icons tiny">email</i> {{ p.cliente?.email }}
                    </div>
                    <div class="cust-address mt-1">
                      <i class="material-icons tiny">place</i> <strong>Dirección:</strong> {{ p.direccionEnvio }}
                    </div>
                    <div *ngIf="p.notas" class="cust-notes mt-1">
                      <i class="material-icons tiny">note</i> <em>"{{ p.notas }}"</em>
                    </div>
                  </div>

                  <div class="order-items-summary mt-3">
                    <span class="items-title">Productos solicitados:</span>
                    <ul class="items-bullet-list">
                      <li *ngFor="let det of p.detalles">
                        <strong>{{ det.cantidad }}x</strong> {{ det.producto?.nombre || ('Producto #' + det.productoId) }}
                        <span class="text-muted">($ {{ det.precioUnitario | number:'1.0-0' }} c/u)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- LADO DERECHO: TOTAL, BADGE Y SELECTOR DE ESTADO -->
                <div class="col s12 m4 order-right-col">
                  <div class="total-box">
                    <span class="total-label">Total del Pedido</span>
                    <span class="total-val">$ {{ p.total | number:'1.0-0' }}</span>
                    <span class="pay-method-badge">{{ p.metodoPago }}</span>
                  </div>

                  <div class="status-control-box mt-3">
                    <span class="status-control-label">Estado Actual:</span>
                    <div class="mb-2">
                      <span class="status-badge" [ngClass]="p.estado">
                        {{ p.estado }}
                      </span>
                    </div>

                    <!-- SELECTOR DESPLEGABLE -->
                    <label class="select-field-label">Cambiar Estado:</label>
                    <select [ngModel]="p.estado" 
                            (ngModelChange)="actualizarEstado(p, $event)" 
                            class="browser-default status-dropdown">
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="EN_PREPARACION">EN_PREPARACION</option>
                      <option value="ENVIADO">ENVIADO</option>
                      <option value="ENTREGADO">ENTREGADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding-top: 30px;
      padding-bottom: 80px;
    }

    .header-orders-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 28px;
    }

    .admin-main-title {
      font-size: 2rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
    }

    .admin-main-title i {
      color: #e76e55;
    }

    .admin-main-subtitle {
      font-size: 1rem;
      color: #64748b;
      margin: 0;
    }

    .empty-orders-box {
      border-radius: 20px !important;
    }

    /* Lista de Pedidos */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .order-admin-card {
      border-radius: 20px !important;
      overflow: hidden;
      padding: 0 !important;
      margin: 0 !important;
      transition: all 0.25s ease;
    }

    .order-admin-card:hover {
      border-color: rgba(231, 110, 85, 0.4) !important;
    }

    .order-card-layout {
      display: flex;
      flex-wrap: wrap;
    }

    .order-left-col {
      padding: 24px !important;
    }

    .order-right-col {
      padding: 24px !important;
      background: #fafbfd;
      border-left: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    @media (max-width: 600px) {
      .order-right-col {
        border-left: none;
        border-top: 1px solid #f1f5f9;
      }
    }

    .order-badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .order-code-tag {
      background: #1e293b;
      color: #ffffff;
      font-family: 'Courier New', Courier, monospace;
      font-weight: 800;
      font-size: 0.95rem;
      padding: 4px 12px;
      border-radius: 8px;
    }

    .order-date {
      color: #94a3b8;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cust-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 4px 0;
    }

    .cust-detail {
      font-size: 0.88rem;
      color: #64748b;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }

    .cust-address {
      font-size: 0.92rem;
      color: #334155;
    }

    .cust-notes {
      font-size: 0.85rem;
      color: #d97706;
      background: #fffbeb;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
    }

    .order-items-summary {
      border-top: 1px dashed #e2e8f0;
      padding-top: 12px;
    }

    .items-title {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 700;
      display: block;
      margin-bottom: 6px;
    }

    .items-bullet-list {
      margin: 0;
      padding-left: 20px;
      color: #475569;
      font-size: 0.92rem;
      line-height: 1.6;
    }

    /* Right Col elements */
    .total-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 700;
      display: block;
    }

    .total-val {
      font-size: 1.6rem;
      font-weight: 900;
      color: #e76e55;
      display: block;
      line-height: 1.2;
    }

    .pay-method-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      background: #e2e8f0;
      color: #475569;
      padding: 2px 8px;
      border-radius: 4px;
      margin-top: 4px;
    }

    .status-control-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
    }

    .select-field-label {
      font-size: 0.78rem;
      color: #94a3b8;
      display: block;
      margin-bottom: 4px;
    }

    .status-dropdown {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-weight: 700;
      color: #1e293b;
      background: #ffffff;
      cursor: pointer;
      outline: none;
    }

    .status-dropdown:focus {
      border-color: #e76e55;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef);

  public pedidos: Pedido[] = [];
  public cargando = true;

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.cdr.markForCheck();
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando pedidos:', err);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  actualizarEstado(pedido: Pedido, nuevoEstado: EstadoPedido): void {
    if (pedido.estado === nuevoEstado) return;

    const idOCodigo = pedido.codigo || pedido.id;
    this.pedidoService.actualizarEstado(idOCodigo, nuevoEstado).subscribe({
      next: (actualizado) => {
        pedido.estado = actualizado.estado;
        this.cdr.markForCheck();
      },
      error: (err) => {
        alert('Error al actualizar estado: ' + (err.error?.error || err.message));
        this.cargarPedidos();
      }
    });
  }
}
