import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="admin-sidebar-card card">
      <div class="sidebar-header">
        <div class="admin-avatar">
          <i class="material-icons">shield</i>
        </div>
        <div class="admin-info">
          <h2 class="admin-title">Panel Admin</h2>
          <span class="admin-sub">Pan de Casa Operativo</span>
        </div>
      </div>

      <div class="sidebar-menu">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="menu-item">
          <i class="material-icons">analytics</i>
          <span>Dashboard & KPIs</span>
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active" class="menu-item">
          <i class="material-icons">assignment</i>
          <span>Pedidos Activos</span>
        </a>
        <a routerLink="/admin/products" routerLinkActive="active" class="menu-item">
          <i class="material-icons">inventory_2</i>
          <span>Gestión de Catálogo</span>
        </a>
        <a routerLink="/admin/password" routerLinkActive="active" class="menu-item">
          <i class="material-icons">lock_reset</i>
          <span>Cambiar Contraseña</span>
        </a>
      </div>

      <div class="sidebar-footer">
        <button (click)="logout()" class="btn btn-secondary logout-btn waves-effect">
          <i class="material-icons left">logout</i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .admin-sidebar-card {
      padding: 24px 18px !important;
      border-radius: 20px !important;
      background: #ffffff !important;
      border: 1px solid rgba(226, 232, 240, 0.9) !important;
      position: sticky;
      top: 90px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 18px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 18px;
    }

    .admin-avatar {
      width: 44px;
      height: 44px;
      min-width: 44px;
      background: #fbeee9;
      color: #e76e55;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-avatar i,
    .admin-avatar i.material-icons {
      font-size: 24px !important;
      height: 24px !important;
      line-height: 24px !important;
      margin: 0 !important;
      float: none !important;
      color: #e76e55 !important;
    }

    .admin-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0;
      line-height: 1.2;
    }

    .admin-sub {
      font-size: 0.78rem;
      color: #64748b;
    }

    .sidebar-menu {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      background: transparent !important;
      height: auto !important;
      line-height: normal !important;
      box-shadow: none !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .menu-item {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 12px 16px !important;
      border-radius: 12px !important;
      color: #475569 !important;
      text-decoration: none !important;
      font-weight: 600 !important;
      font-size: 0.95rem !important;
      transition: all 0.2s ease !important;
      height: auto !important;
      line-height: normal !important;
      background: transparent;
      border: 1px solid transparent;
    }

    .menu-item:hover {
      background-color: #f8fafc !important;
      color: #e76e55 !important;
      transform: translateX(3px);
    }

    .menu-item.active {
      background-color: #fbeee9 !important;
      color: #e76e55 !important;
      font-weight: 700 !important;
      border-color: rgba(231, 110, 85, 0.2);
    }

    .menu-item i,
    .menu-item i.material-icons {
      font-size: 22px !important;
      height: 22px !important;
      line-height: 22px !important;
      width: 22px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 !important;
      float: none !important;
      color: inherit !important;
    }

    .sidebar-footer {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #f1f5f9;
    }

    .logout-btn {
      width: 100%;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #64748b !important;
      height: 42px !important;
      line-height: 42px !important;
    }

    .logout-btn i {
      margin-right: 8px !important;
      float: none !important;
      line-height: inherit !important;
    }

    .logout-btn:hover {
      color: #ef4444 !important;
      background-color: #fee2e2 !important;
    }
  `]
})
export class AdminSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
