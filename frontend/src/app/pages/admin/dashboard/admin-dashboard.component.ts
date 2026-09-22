import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { AuthService, MetricasAdmin } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-page container animate-fade-in">
      <div class="row">
        <!-- SIDEBAR DE NAVEGACIÓN -->
        <div class="col s12 l3">
          <app-admin-sidebar></app-admin-sidebar>
        </div>

        <!-- CONTENIDO PRINCIPAL DASHBOARD -->
        <div class="col s12 l9">
          <div class="dashboard-header">
            <h1 class="admin-main-title">
              <i class="material-icons left">dashboard</i> Dashboard Operativo
            </h1>
            <p class="admin-main-subtitle">
              Resumen de métricas de ventas y requerimientos inmediatos de horneado en cocina.
            </p>
          </div>

          <!-- 3 TARJETAS KPI -->
          <div class="row kpi-grid">
            <!-- KPI 1: Ventas Totales -->
            <div class="col s12 m4">
              <div class="kpi-card card">
                <div class="kpi-icon-box terracotta">
                  <i class="material-icons">attach_money</i>
                </div>
                <div class="kpi-data">
                  <span class="kpi-label">Ventas Totales</span>
                  <span class="kpi-value">$ {{ (metricas?.ventasTotales || 0) | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>

            <!-- KPI 2: Pedidos Totales -->
            <div class="col s12 m4">
              <div class="kpi-card card">
                <div class="kpi-icon-box blue-box">
                  <i class="material-icons">shopping_bag</i>
                </div>
                <div class="kpi-data">
                  <span class="kpi-label">Pedidos Totales</span>
                  <span class="kpi-value">{{ metricas?.pedidosTotales || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- KPI 3: Pendientes Envío -->
            <div class="col s12 m4">
              <div class="kpi-card card">
                <div class="kpi-icon-box amber-box">
                  <i class="material-icons">pending_actions</i>
                </div>
                <div class="kpi-data">
                  <span class="kpi-label">Pendientes Envío</span>
                  <span class="kpi-value">{{ metricas?.pendientesEnvio || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 🍞 TABLA DE PRODUCCIÓN "A HORNEAR" -->
          <div class="production-card card">
            <div class="card-header-flex">
              <div>
                <h2 class="production-title">
                  <i class="material-icons left">outdoor_grill</i> Plan de Producción: "A Hornear"
                </h2>
                <p class="production-subtitle">
                  Consolidado de piezas de panadería que la cocina debe producir para surtir los pedidos en preparación.
                </p>
              </div>
              <button (click)="cargarMetricas()" class="btn btn-secondary btn-small waves-effect" title="Refrescar">
                <i class="material-icons">refresh</i>
              </button>
            </div>

            <!-- SPINNER O ESTADO VACÍO -->
            <div *ngIf="cargando" class="center-align p-4">
              <div class="preloader-wrapper small active">
                <div class="spinner-layer spinner-orange-only">
                  <div class="circle-clipper left"><div class="circle"></div></div>
                  <div class="gap-patch"><div class="circle"></div></div>
                  <div class="circle-clipper right"><div class="circle"></div></div>
                </div>
              </div>
            </div>

            <div *ngIf="!cargando && (!metricas?.aHornear || metricas!.aHornear.length === 0)" class="empty-hornear center-align p-4">
              <i class="material-icons large text-muted">done_all</i>
              <h5>¡Cocina al día!</h5>
              <p class="text-muted">No hay pedidos pendientes que requieran hornear productos en este momento.</p>
            </div>

            <div *ngIf="!cargando && metricas?.aHornear && metricas!.aHornear.length > 0" class="table-responsive mt-3">
              <table class="striped highlight">
                <thead>
                  <tr>
                    <th>Producto Artesanal</th>
                    <th class="right-align">Cantidad Requerida</th>
                    <th class="center-align">Estado de Producción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of metricas!.aHornear">
                    <td>
                      <strong class="product-hornear-name">{{ item.producto }}</strong>
                    </td>
                    <td class="right-align">
                      <span class="hornear-qty-badge">{{ item.cantidadRequerida }} unidades</span>
                    </td>
                    <td class="center-align">
                      <span class="chip-hornear">
                        <i class="material-icons tiny">schedule</i> Por hornear / empacar
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
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

    .dashboard-header {
      margin-bottom: 24px;
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

    /* KPI Grid */
    .kpi-card {
      padding: 22px !important;
      border-radius: 18px !important;
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 0 0 20px 0 !important;
    }

    .kpi-icon-box {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon-box i {
      font-size: 28px;
    }

    .kpi-icon-box.terracotta {
      background: #fbeee9;
      color: #e76e55;
    }

    .kpi-icon-box.blue-box {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .kpi-icon-box.amber-box {
      background: #fef3c7;
      color: #d97706;
    }

    .kpi-data {
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: 1.55rem;
      font-weight: 900;
      color: #1e293b;
    }

    /* Production Card */
    .production-card {
      padding: 28px !important;
      border-radius: 20px !important;
      margin-top: 10px;
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .production-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
    }

    .production-title i {
      color: #e76e55;
    }

    .production-subtitle {
      font-size: 0.92rem;
      color: #64748b;
      margin: 0;
    }

    .product-hornear-name {
      font-size: 1.05rem;
      color: #1e293b;
    }

    .hornear-qty-badge {
      background: #fbeee9;
      color: #e76e55;
      font-weight: 800;
      font-size: 0.95rem;
      padding: 6px 14px;
      border-radius: 9999px;
    }

    .chip-hornear {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.82rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 600;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  public metricas: MetricasAdmin | null = null;
  public cargando = true;

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.cargando = true;
    this.cdr.markForCheck();
    this.authService.getMetricas().subscribe({
      next: (data) => {
        this.metricas = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando métricas:', err);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }
}
