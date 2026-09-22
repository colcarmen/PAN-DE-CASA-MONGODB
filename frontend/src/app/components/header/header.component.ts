import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-fixed">
      <nav class="glass-nav">
        <div class="nav-wrapper container">
          <!-- Logo de marca -->
          <a routerLink="/" class="brand-logo left">
            <span class="brand-badge"><i class="material-icons">bakery_dining</i></span>
            <span class="brand-text">Pan de Casa</span>
          </a>

          <!-- Enlaces de navegación y Carrito -->
          <ul class="right nav-items">
            <li>
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                <i class="material-icons left nav-icon">storefront</i>
                <span class="hide-on-small-only">Catálogo</span>
              </a>
            </li>
            <li>
              <a routerLink="/order-status" routerLinkActive="active">
                <i class="material-icons left nav-icon">local_shipping</i>
                <span class="hide-on-small-only">Mis Pedidos</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/dashboard" routerLinkActive="active">
                <i class="material-icons left nav-icon">admin_panel_settings</i>
                <span class="hide-on-small-only">Admin</span>
              </a>
            </li>

            <!-- Botón de Carrito con Insignia Reactiva -->
            <li class="cart-nav-item">
              <a routerLink="/cart" class="cart-pill-btn" aria-label="Ver carrito">
                <i class="material-icons">shopping_bag</i>
                <span class="cart-badge-count" *ngIf="cartService.totalItems() > 0">
                  {{ cartService.totalItems() }}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .navbar-fixed {
      height: 72px;
      z-index: 997;
    }

    .glass-nav {
      background: rgba(255, 255, 255, 0.9) !important;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.9);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      height: 72px !important;
      line-height: 72px !important;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #1e293b !important;
      font-weight: 800;
      font-size: 1.45rem;
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    .brand-badge {
      background: linear-gradient(135deg, #e76e55 0%, #d65a41 100%);
      color: #ffffff;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(231, 110, 85, 0.35);
    }

    .brand-badge i {
      font-size: 26px;
      line-height: 1;
    }

    .brand-text {
      background: linear-gradient(135deg, #1e293b 40%, #e76e55 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-items li a {
      color: #475569 !important;
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;
      transition: color 0.2s ease;
      padding: 0 16px;
    }

    .nav-items li a:hover {
      background-color: transparent;
      color: #e76e55 !important;
    }

    .nav-items li a.active {
      color: #e76e55 !important;
    }

    .nav-items li a.active::after {
      content: '';
      position: absolute;
      bottom: 12px;
      left: 16px;
      right: 16px;
      height: 3px;
      background-color: #e76e55;
      border-radius: 9999px;
    }

    .nav-icon {
      font-size: 20px;
      margin-right: 2px !important;
    }

    .cart-pill-btn {
      background: #ffffff !important;
      border: 1px solid rgba(226, 232, 240, 0.9) !important;
      border-radius: 9999px !important;
      width: 46px;
      height: 46px;
      line-height: 46px !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      position: relative;
      color: #1e293b !important;
      margin-top: 13px;
      margin-left: 10px;
      padding: 0 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.25s ease !important;
    }

    .cart-pill-btn:hover {
      border-color: #e76e55 !important;
      color: #e76e55 !important;
      transform: scale(1.05);
    }

    .cart-badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e76e55;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      height: 20px;
      min-width: 20px;
      line-height: 20px;
      border-radius: 10px;
      text-align: center;
      padding: 0 5px;
      box-shadow: 0 2px 6px rgba(231, 110, 85, 0.4);
    }
  `]
})
export class HeaderComponent {
  public cartService = inject(CartService);
}
