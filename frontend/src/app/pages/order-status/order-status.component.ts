import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="tracking-page container animate-fade-in">
      <div class="header-center center-align">
        <span class="tracking-chip">
          <i class="material-icons left">radar</i> Rastreador en Vivo
        </span>
        <h1 class="page-title">Consulta y Rastreo de tu Pedido</h1>
        <p class="page-subtitle">
          Ingresa el código que recibiste al comprar para ver en qué etapa de horneado o despacho va tu orden.
        </p>
      </div>

      <!-- 🔍 CAJA DE BÚSQUEDA -->
      <div class="search-card card">
        <form (ngSubmit)="buscarPedido()" class="search-form">
          <div class="input-field search-field">
            <i class="material-icons prefix">search</i>
            <input id="codigoBusqueda" 
                   type="text" 
                   [(ngModel)]="codigoBusqueda" 
                   name="codigoBusqueda" 
                   placeholder="Ej: PED-1, ped-1 o solo 1" 
                   required>
            <label for="codigoBusqueda" class="active">Código de Pedido</label>
          </div>
          <button type="submit" [disabled]="buscando || !codigoBusqueda" class="btn btn-large search-btn waves-effect waves-light">
            <span *ngIf="!buscando">Buscar Pedido</span>
            <span *ngIf="buscando">Consultando...</span>
          </button>
        </form>

        <div *ngIf="errorMsg" class="card-panel red lighten-5 red-text text-darken-4 error-panel">
          <i class="material-icons left">sentiment_dissatisfied</i> {{ errorMsg }}
        </div>
      </div>

      <!-- 📦 RESULTADO DEL RASTREO -->
      <div *ngIf="pedido" class="tracking-results-container animate-fade-in">
        <!-- BARRA O STEPPER DE PROGRESO DE 4 ETAPAS -->
        <div class="stepper-card card">
          <div class="stepper-header">
            <div class="order-id-badge">
              <span>Pedido</span>
              <strong>{{ pedido.codigo || ('PED-' + pedido.id) }}</strong>
            </div>
            <div class="status-chip-box">
              <span class="status-badge" [ngClass]="pedido.estado">
                {{ obtenerNombreEstado(pedido.estado) }}
              </span>
            </div>
          </div>

          <!-- SI ESTÁ CANCELADO: BANNER ROJO -->
          <div *ngIf="pedido.estado === 'CANCELADO'" class="cancelled-banner">
            <i class="material-icons large">cancel</i>
            <h3>Pedido Cancelado</h3>
            <p>Este pedido ha sido anulado por la panadería o a solicitud del cliente.</p>
          </div>

          <!-- SI NO ESTÁ CANCELADO: LÍNEA DE TIEMPO DE 4 ETAPAS -->
          <div *ngIf="pedido.estado !== 'CANCELADO'" class="stepper-timeline">
            <!-- Barra de progreso -->
            <div class="timeline-bar-bg">
              <div class="timeline-bar-fill" [style.width]="obtenerProgreso(pedido.estado) + '%'"></div>
            </div>

            <!-- 4 Pasos -->
            <div class="timeline-steps">
              <!-- Paso 1: PENDIENTE -->
              <div class="timeline-step" [class.completed]="esPasoCompletado(1)" [class.active]="esPasoActivo(1)">
                <div class="step-circle">
                  <i class="material-icons">access_time</i>
                </div>
                <div class="step-label">
                  <span class="step-title">Recibido</span>
                  <span class="step-desc">En espera</span>
                </div>
              </div>

              <!-- Paso 2: EN_PREPARACION -->
              <div class="timeline-step" [class.completed]="esPasoCompletado(2)" [class.active]="esPasoActivo(2)">
                <div class="step-circle">
                  <i class="material-icons">outdoor_grill</i>
                </div>
                <div class="step-label">
                  <span class="step-title">En Horno</span>
                  <span class="step-desc">Amasando & horneando</span>
                </div>
              </div>

              <!-- Paso 3: ENVIADO -->
              <div class="timeline-step" [class.completed]="esPasoCompletado(3)" [class.active]="esPasoActivo(3)">
                <div class="step-circle">
                  <i class="material-icons">two_wheeler</i>
                </div>
                <div class="step-label">
                  <span class="step-title">En Camino</span>
                  <span class="step-desc">El repartidor va hacia ti</span>
                </div>
              </div>

              <!-- Paso 4: ENTREGADO -->
              <div class="timeline-step" [class.completed]="esPasoCompletado(4)" [class.active]="esPasoActivo(4)">
                <div class="step-circle">
                  <i class="material-icons">check</i>
                </div>
                <div class="step-label">
                  <span class="step-title">Entregado</span>
                  <span class="step-desc">¡A disfrutar!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TARJETA DE DETALLES DEL PEDIDO -->
        <div class="details-card card">
          <h2 class="details-card-title">
            <i class="material-icons left">receipt_long</i> Detalle de la Orden
          </h2>

          <div class="row details-grid">
            <div class="col s12 m6 detail-col">
              <span class="detail-label">Datos de Entrega</span>
              <div class="detail-value fw-bold">{{ pedido.cliente?.nombre }}</div>
              <div class="detail-sub">{{ pedido.direccionEnvio }}</div>
              <div class="detail-sub">Tel: {{ pedido.cliente?.telefono || 'No registrado' }}</div>
            </div>

            <div class="col s12 m6 detail-col">
              <span class="detail-label">Información de Pago & Fecha</span>
              <div class="detail-value">Método: <strong>{{ pedido.metodoPago }}</strong></div>
              <div class="detail-sub">Fecha: {{ pedido.fechaPedido | date:'medium' }}</div>
              <div *ngIf="pedido.notas" class="detail-sub fst-italic">"{{ pedido.notas }}"</div>
            </div>
          </div>

          <div class="divider my-3"></div>

          <h3 class="items-list-title">Productos en esta orden:</h3>
          <div class="items-table-wrapper">
            <table class="striped responsive-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="center-align">Cantidad</th>
                  <th class="right-align">Precio Unit.</th>
                  <th class="right-align">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let det of pedido.detalles">
                  <td>
                    <strong>{{ det.producto?.nombre || ('Producto #' + det.productoId) }}</strong>
                  </td>
                  <td class="center-align">{{ det.cantidad }}</td>
                  <td class="right-align">$ {{ det.precioUnitario | number:'1.0-0' }}</td>
                  <td class="right-align fw-bold">$ {{ det.subtotal | number:'1.0-0' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="order-total-banner">
            <span>Total Pagado:</span>
            <span class="order-total-amount">$ {{ pedido.total | number:'1.0-0' }} COP</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-page {
      padding-top: 30px;
      padding-bottom: 80px;
    }

    .header-center {
      max-width: 680px;
      margin: 0 auto 30px auto;
    }

    .tracking-chip {
      display: inline-flex;
      align-items: center;
      background: #fbeee9;
      color: #e76e55;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 6px 16px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }

    .page-title {
      font-size: 2.3rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 10px 0;
    }

    .page-subtitle {
      font-size: 1.05rem;
      color: #64748b;
    }

    /* Search Card */
    .search-card {
      max-width: 680px;
      margin: 0 auto 36px auto;
      padding: 24px 30px !important;
      border-radius: 20px !important;
    }

    .search-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 260px;
      margin: 0 !important;
    }

    .search-btn {
      height: 48px;
      line-height: 48px;
      border-radius: 12px !important;
    }

    .error-panel {
      border-radius: 10px;
      padding: 12px 18px;
      margin-top: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    /* Stepper Card */
    .stepper-card {
      border-radius: 20px !important;
      padding: 30px !important;
      margin-bottom: 24px !important;
    }

    .stepper-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 36px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .order-id-badge {
      display: flex;
      flex-direction: column;
    }

    .order-id-badge span {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 700;
    }

    .order-id-badge strong {
      font-size: 1.6rem;
      color: #1e293b;
      font-weight: 900;
    }

    /* Timeline */
    .stepper-timeline {
      position: relative;
      margin: 40px 10px 20px 10px;
    }

    .timeline-bar-bg {
      position: absolute;
      top: 24px;
      left: 30px;
      right: 30px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 9999px;
      z-index: 1;
    }

    .timeline-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #e76e55, #d65a41);
      border-radius: 9999px;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .timeline-steps {
      position: relative;
      display: flex;
      justify-content: space-between;
      z-index: 2;
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 90px;
    }

    .step-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #ffffff;
      border: 3px solid #cbd5e1;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .step-circle i {
      font-size: 22px;
    }

    .timeline-step.completed .step-circle {
      border-color: #e76e55;
      background: #e76e55;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(231, 110, 85, 0.35);
    }

    .timeline-step.active .step-circle {
      border-color: #e76e55;
      color: #e76e55;
      transform: scale(1.15);
      box-shadow: 0 4px 16px rgba(231, 110, 85, 0.3);
    }

    .step-label {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
    }

    .step-title {
      font-weight: 700;
      font-size: 0.92rem;
      color: #1e293b;
    }

    .step-desc {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    /* Cancelled Banner */
    .cancelled-banner {
      background: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      color: #991b1b;
    }

    .cancelled-banner h3 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 10px 0;
    }

    /* Details Card */
    .details-card {
      border-radius: 20px !important;
      padding: 30px !important;
    }

    .details-card-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
    }

    .detail-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 1.05rem;
      color: #1e293b;
    }

    .detail-sub {
      font-size: 0.92rem;
      color: #64748b;
      margin-top: 2px;
    }

    .items-list-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 16px 0 10px 0;
    }

    .order-total-banner {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
      padding-top: 14px;
      border-top: 2px dashed #e2e8f0;
      font-size: 1.15rem;
      font-weight: 700;
    }

    .order-total-amount {
      font-size: 1.6rem;
      font-weight: 900;
      color: #e76e55;
    }
  `]
})
export class OrderStatusComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private route = inject(ActivatedRoute);

  public codigoBusqueda = '';
  public buscando = false;
  public errorMsg = '';
  public pedido: Pedido | null = null;

  ngOnInit(): void {
    // Si viene por query param ?codigo=...
    this.route.queryParams.subscribe(params => {
      if (params['codigo']) {
        this.codigoBusqueda = params['codigo'];
        this.buscarPedido();
      }
    });
  }

  buscarPedido(): void {
    if (!this.codigoBusqueda.trim()) return;

    this.buscando = true;
    this.errorMsg = '';
    this.pedido = null;

    this.pedidoService.getPedidoPorCodigo(this.codigoBusqueda.trim()).subscribe({
      next: (data) => {
        this.pedido = data;
        this.buscando = false;
      },
      error: (err) => {
        this.buscando = false;
        this.errorMsg = err.error?.error || `No encontramos ningún pedido con el código '${this.codigoBusqueda}'.`;
      }
    });
  }

  obtenerNombreEstado(estado: string): string {
    const nombres: Record<string, string> = {
      PENDIENTE: 'Recibido',
      EN_PREPARACION: 'En Horno',
      ENVIADO: 'En Camino',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return nombres[estado] || estado;
  }

  obtenerProgreso(estado: string): number {
    switch (estado) {
      case 'PENDIENTE': return 15;
      case 'EN_PREPARACION': return 50;
      case 'ENVIADO': return 80;
      case 'ENTREGADO': return 100;
      default: return 0;
    }
  }

  esPasoCompletado(paso: number): boolean {
    if (!this.pedido) return false;
    const ordenEstados = ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO'];
    const idx = ordenEstados.indexOf(this.pedido.estado);
    return idx >= paso - 1;
  }

  esPasoActivo(paso: number): boolean {
    if (!this.pedido) return false;
    const ordenEstados = ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO'];
    return ordenEstados.indexOf(this.pedido.estado) === paso - 1;
  }
}
