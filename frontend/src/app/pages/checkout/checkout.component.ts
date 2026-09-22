import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="checkout-page container animate-fade-in">
      <!-- 🌟 PANTALLA DE ÉXITO POST-COMPRA -->
      <div *ngIf="pedidoConfirmado" class="success-screen card center-align">
        <div class="success-icon-circle">
          <i class="material-icons large">check_circle</i>
        </div>
        <h1 class="success-title">¡Pedido confirmado!</h1>
        <p class="success-msg">
          Muchas gracias por tu compra en <strong>Pan de Casa</strong>. Hemos recibido tu pedido y los panaderos ya se están alistando.
        </p>

        <!-- CAJA DE CÓDIGO DE SEGUIMIENTO -->
        <div class="tracking-code-box">
          <span class="tracking-code-label">Tu Código Único de Rastreo:</span>
          <div class="tracking-code-value">{{ pedidoConfirmado.codigo || ('PED-' + pedidoConfirmado.id) }}</div>
          <p class="tracking-code-tip">Guarda este código para consultar el estado en cualquier momento.</p>
        </div>

        <div class="success-actions">
          <a routerLink="/order-status" class="btn btn-large waves-effect waves-light">
            <i class="material-icons left">local_shipping</i> Rastrear Pedido
          </a>
          <a routerLink="/" class="btn btn-large btn-secondary waves-effect">
            <i class="material-icons left">home</i> Volver al Inicio
          </a>
        </div>
      </div>

      <!-- 📝 FORMULARIO DE CHECKOUT Y RESUMEN -->
      <div *ngIf="!pedidoConfirmado">
        <h1 class="page-title">
          <i class="material-icons left">payment</i> Finalizar Compra
        </h1>

        <div class="row">
          <!-- COLUMNA IZQUIERDA: FORMULARIO -->
          <div class="col s12 l7">
            <form (ngSubmit)="confirmarPedido()" #checkoutForm="ngForm" class="checkout-form card">
              <h2 class="section-title">
                <i class="material-icons">person</i> 1. Datos Personales
              </h2>
              
              <div class="input-field">
                <input id="nombre" type="text" [(ngModel)]="cliente.nombre" name="nombre" required placeholder=" ">
                <label for="nombre" class="active">Nombre Completo *</label>
              </div>

              <div class="row m-0">
                <div class="input-field col s12 m6 pl-0">
                  <input id="email" type="email" [(ngModel)]="cliente.email" name="email" required placeholder=" ">
                  <label for="email" class="active">Correo Electrónico *</label>
                </div>
                <div class="input-field col s12 m6 pr-0">
                  <input id="telefono" type="tel" [(ngModel)]="cliente.telefono" name="telefono" required placeholder=" ">
                  <label for="telefono" class="active">Teléfono de Contacto *</label>
                </div>
              </div>

              <div class="section-divider"></div>

              <h2 class="section-title">
                <i class="material-icons">location_on</i> 2. Datos de Envío
              </h2>

              <div class="input-field">
                <input id="direccion" type="text" [(ngModel)]="direccionEnvio" name="direccion" required placeholder=" ">
                <label for="direccion" class="active">Dirección Completa de Entrega *</label>
              </div>

              <div class="input-field">
                <textarea id="notas" class="materialize-textarea" [(ngModel)]="notas" name="notas" placeholder=" "></textarea>
                <label for="notas" class="active">Notas para el repartidor (Opcional, ej. Apto 302)</label>
              </div>

              <div class="section-divider"></div>

              <h2 class="section-title">
                <i class="material-icons">account_balance_wallet</i> 3. Método de Pago
              </h2>

              <div class="payment-methods">
                <label class="payment-option">
                  <input name="metodoPago" type="radio" value="EFECTIVO" [(ngModel)]="metodoPago" />
                  <span>Efectivo contraentrega</span>
                </label>
                <label class="payment-option">
                  <input name="metodoPago" type="radio" value="TRANSFERENCIA" [(ngModel)]="metodoPago" />
                  <span>Transferencia (Nequi / Daviplata)</span>
                </label>
                <label class="payment-option">
                  <input name="metodoPago" type="radio" value="TARJETA" [(ngModel)]="metodoPago" />
                  <span>Datáfono contraentrega</span>
                </label>
              </div>

              <div *ngIf="errorMsg" class="error-banner card-panel red lighten-5 red-text text-darken-4">
                <i class="material-icons tiny left">error</i> {{ errorMsg }}
              </div>

              <div class="mt-4">
                <button type="submit" 
                        [disabled]="procesando || !checkoutForm.valid"
                        class="btn btn-large confirm-btn waves-effect waves-light">
                  <span *ngIf="!procesando">
                    <i class="material-icons right">check</i> Confirmar Pedido ($ {{ cartService.totalMonto() | number:'1.0-0' }})
                  </span>
                  <span *ngIf="procesando">
                    <i class="material-icons right spin">sync</i> Procesando pedido...
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- COLUMNA DERECHA: RESUMEN DE LA COMPRA -->
          <div class="col s12 l5">
            <div class="order-summary-card card sticky-summary">
              <h2 class="summary-title">Resumen de Compra</h2>
              <div class="summary-divider"></div>

              <div class="summary-items-list">
                <div *ngFor="let item of cartService.items()" class="summary-item-row">
                  <div class="item-name-qty">
                    <span class="item-qty-badge">{{ item.cantidad }}x</span>
                    <span class="item-name">{{ item.producto.nombre }}</span>
                  </div>
                  <span class="item-subtotal-text">$ {{ (item.cantidad * item.producto.precio) | number:'1.0-0' }}</span>
                </div>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row">
                <span class="text-muted">Subtotal</span>
                <span>$ {{ cartService.totalMonto() | number:'1.0-0' }}</span>
              </div>

              <div class="summary-row">
                <span class="text-muted">Envío</span>
                <span class="green-text text-darken-2 fw-bold">Gratis</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row total-row">
                <span>Total a Pagar</span>
                <span class="total-amount">$ {{ cartService.totalMonto() | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding-top: 30px;
      padding-bottom: 80px;
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .checkout-form {
      padding: 30px !important;
      border-radius: 20px !important;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
    }

    .section-title i {
      color: #e76e55;
      font-size: 22px;
    }

    .section-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 24px 0;
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }

    .payment-option {
      display: flex;
      align-items: center;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .payment-option:hover {
      background-color: #fbeee9;
      border-color: #e76e55;
    }

    .confirm-btn {
      width: 100%;
      height: 52px;
      line-height: 52px;
      border-radius: 12px !important;
      font-size: 1.05rem;
    }

    .error-banner {
      border-radius: 10px;
      padding: 12px 16px;
      margin-top: 16px;
      font-weight: 600;
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

    .summary-items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .summary-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }

    .item-name-qty {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-qty-badge {
      background: #f1f5f9;
      color: #e76e55;
      font-weight: 800;
      font-size: 0.78rem;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .item-name {
      font-weight: 600;
      color: #334155;
    }

    .item-subtotal-text {
      font-weight: 700;
      color: #1e293b;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 0.95rem;
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

    /* Success Screen */
    .success-screen {
      padding: 60px 24px !important;
      max-width: 680px;
      margin: 40px auto;
      border-radius: 24px !important;
    }

    .success-icon-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: #dcfce7;
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
    }

    .success-title {
      font-size: 2.2rem;
      font-weight: 900;
      color: #1e293b;
      margin-bottom: 12px;
    }

    .success-msg {
      font-size: 1.1rem;
      color: #64748b;
      max-width: 520px;
      margin: 0 auto 28px auto;
      line-height: 1.6;
    }

    .tracking-code-box {
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 24px;
      max-width: 440px;
      margin: 0 auto 30px auto;
    }

    .tracking-code-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
      display: block;
      margin-bottom: 8px;
    }

    .tracking-code-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 2.4rem;
      font-weight: 900;
      color: #e76e55;
      letter-spacing: 2px;
    }

    .tracking-code-tip {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 8px 0 0 0;
    }

    .success-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .spin {
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  public cartService = inject(CartService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);

  public cliente = {
    nombre: '',
    email: '',
    telefono: ''
  };

  public direccionEnvio = '';
  public notas = '';
  public metodoPago = 'EFECTIVO';

  public procesando = false;
  public errorMsg = '';
  public pedidoConfirmado: any = null;

  ngOnInit(): void {
    // Si el carrito está vacío y no venimos de un pedido recién confirmado
    if (this.cartService.items().length === 0 && !this.pedidoConfirmado) {
      this.router.navigate(['/cart']);
    }
  }

  confirmarPedido(): void {
    if (this.cartService.items().length === 0) {
      this.errorMsg = 'El carrito no tiene productos.';
      return;
    }

    this.procesando = true;
    this.errorMsg = '';

    const payload = {
      cliente: {
        nombre: this.cliente.nombre,
        email: this.cliente.email,
        telefono: this.cliente.telefono,
        direccion: this.direccionEnvio
      },
      direccionEnvio: this.direccionEnvio,
      metodoPago: this.metodoPago,
      notas: this.notas,
      detalles: this.cartService.items().map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      }))
    };

    this.pedidoService.crearPedido(payload).subscribe({
      next: (pedido) => {
        this.pedidoConfirmado = pedido;
        this.cartService.clearCart();
        this.procesando = false;
      },
      error: (err) => {
        this.procesando = false;
        this.errorMsg = err.error?.error || 'Ocurrió un problema procesando tu orden. Por favor intenta nuevamente.';
      }
    });
  }
}
