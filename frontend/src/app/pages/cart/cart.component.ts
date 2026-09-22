import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-page container animate-fade-in">
      <h1 class="page-title">
        <i class="material-icons left">shopping_cart</i> Tu Carrito de Compras
      </h1>

      <!-- ESTADO VACÍO -->
      <div *ngIf="cartService.items().length === 0" class="empty-cart-card card center-align">
        <div class="empty-icon-circle">
          <i class="material-icons large">shopping_bag</i>
        </div>
        <h2 class="empty-title">Tu carrito está vacío</h2>
        <p class="empty-subtitle">
          Aún no has agregado ningún pan fresco o delicia artesanal.
        </p>
        <a routerLink="/" class="btn btn-large waves-effect waves-light mt-3">
          <i class="material-icons left">storefront</i> Explorar Catálogo
        </a>
      </div>

      <!-- LAYOUT DE 2 COLUMNAS SI TIENE ÍTEMS -->
      <div *ngIf="cartService.items().length > 0" class="row cart-layout">
        <!-- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS -->
        <div class="col s12 l8">
          <div class="cart-items-list">
            <div *ngFor="let item of cartService.items()" class="cart-item-card card">
              <div class="item-thumb-wrapper">
                <img [src]="item.producto.imagenUrl" [alt]="item.producto.nombre" (error)="onImgError($event)">
              </div>

              <div class="item-details">
                <div class="item-header">
                  <span class="item-category">{{ item.producto.categoria }}</span>
                  <button (click)="cartService.removeFromCart(item.producto.id)" 
                          class="remove-btn" 
                          title="Eliminar producto"
                          aria-label="Eliminar producto">
                    <i class="material-icons">delete_outline</i>
                  </button>
                </div>

                <h3 class="item-title">{{ item.producto.nombre }}</h3>
                <div class="item-unit-price">$ {{ item.producto.precio | number:'1.0-0' }} c/u</div>

                <div class="item-footer">
                  <!-- Control Stepper -->
                  <div class="quantity-stepper">
                    <button (click)="cartService.updateQuantity(item.producto.id, item.cantidad - 1)" 
                            aria-label="Disminuir">
                      <i class="material-icons">remove</i>
                    </button>
                    <span class="qty-number">{{ item.cantidad }}</span>
                    <button (click)="cartService.updateQuantity(item.producto.id, item.cantidad + 1)" 
                            aria-label="Aumentar">
                      <i class="material-icons">add</i>
                    </button>
                  </div>

                  <!-- Subtotal -->
                  <div class="item-subtotal">
                    <span class="subtotal-label">Subtotal:</span>
                    <span class="subtotal-val">$ {{ (item.cantidad * item.producto.precio) | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: RESUMEN FIJO STICKY -->
        <div class="col s12 l4">
          <div class="order-summary-card card sticky-summary">
            <h2 class="summary-title">Resumen del Pedido</h2>
            <div class="summary-divider"></div>

            <div class="summary-row">
              <span class="text-muted">Subtotal ({{ cartService.totalItems() }} uds)</span>
              <span class="fw-bold">$ {{ cartService.totalMonto() | number:'1.0-0' }}</span>
            </div>

            <div class="summary-row">
              <span class="text-muted">Costo de Envío</span>
              <span class="shipping-tag">Calculado en checkout</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row total-row">
              <span>Total Estimado</span>
              <span class="total-amount">$ {{ cartService.totalMonto() | number:'1.0-0' }}</span>
            </div>

            <p class="summary-notice">
              <i class="material-icons tiny">local_shipping</i> Entrega rápida en Bogotá y alrededores.
            </p>

            <a routerLink="/checkout" class="btn btn-large proceed-btn waves-effect waves-light">
              <i class="material-icons right">arrow_forward</i> Proceder al Pago
            </a>

            <button (click)="cartService.clearCart()" class="btn btn-outline clear-cart-btn waves-effect">
              <i class="material-icons left">remove_shopping_cart</i> Vaciar Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      padding-top: 30px;
      padding-bottom: 80px;
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-title i {
      color: #e76e55;
    }

    /* Estado Vacío */
    .empty-cart-card {
      padding: 60px 20px !important;
      border-radius: 20px !important;
      max-width: 600px;
      margin: 40px auto;
    }

    .empty-icon-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: #fbeee9;
      color: #e76e55;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
    }

    .empty-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .empty-subtitle {
      font-size: 1.05rem;
      color: #64748b;
      max-width: 420px;
      margin: 0 auto;
    }

    /* Cart List */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item-card {
      display: flex;
      padding: 16px !important;
      border-radius: 16px !important;
      gap: 20px;
      align-items: center;
      margin: 0 !important;
    }

    .item-thumb-wrapper {
      width: 110px;
      height: 110px;
      min-width: 110px;
      border-radius: 12px;
      overflow: hidden;
      background: #f1f5f9;
    }

    .item-thumb-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-category {
      font-size: 0.75rem;
      font-weight: 700;
      color: #e76e55;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .remove-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .remove-btn:hover {
      color: #ef4444;
      background: #fee2e2;
    }

    .item-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #1e293b;
      margin: 4px 0 2px 0;
    }

    .item-unit-price {
      font-size: 0.9rem;
      color: #64748b;
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .item-subtotal {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .subtotal-label {
      font-size: 0.85rem;
      color: #64748b;
    }

    .subtotal-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #e76e55;
    }

    /* Summary Card */
    .order-summary-card {
      padding: 24px !important;
      border-radius: 20px !important;
    }

    .sticky-summary {
      position: sticky;
      top: 92px;
    }

    .summary-title {
      font-size: 1.3rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 16px 0;
    }

    .summary-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 14px 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 0.95rem;
    }

    .shipping-tag {
      font-size: 0.82rem;
      background: #f1f5f9;
      padding: 3px 10px;
      border-radius: 9999px;
      color: #64748b;
      font-weight: 600;
    }

    .total-row {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e293b;
      margin-top: 14px;
    }

    .total-amount {
      color: #e76e55;
      font-size: 1.45rem;
      font-weight: 900;
    }

    .summary-notice {
      font-size: 0.82rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 16px 0;
    }

    .proceed-btn {
      width: 100%;
      margin-bottom: 12px;
      border-radius: 12px !important;
      height: 50px;
      line-height: 50px;
    }

    .clear-cart-btn {
      width: 100%;
      border-radius: 12px !important;
      height: 44px;
      line-height: 44px;
    }
  `]
})
export class CartComponent {
  public cartService = inject(CartService);

  onImgError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  }
}
