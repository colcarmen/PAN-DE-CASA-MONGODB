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

      <nav class="sidebar-menu">
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
      </nav>

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
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.9) !important;
      position: sticky;
      top: 90px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 20px;
    }

    .admin-avatar {
      width: 44px;
      height: 44px;
      background: #fbeee9;
      color: #e76e55;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
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
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      color: #475569;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .menu-item:hover {
      background-color: #f8fafc;
      color: #e76e55;
      transform: translateX(3px);
    }

    .menu-item.active {
      background-color: #fbeee9;
      color: #e76e55;
      font-weight: 700;
    }

    .menu-item i {
      font-size: 22px;
    }

    .sidebar-footer {
      margin-top: 28px;
      padding-top: 18px;
      border-top: 1px solid #f1f5f9;
    }

    .logout-btn {
      width: 100%;
      border-radius: 10px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b !important;
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
