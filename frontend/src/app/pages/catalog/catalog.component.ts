import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CartService } from '../../services/cart.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="catalog-page animate-fade-in">
      <!-- 🌟 SECCIÓN HERO ARTESANAL -->
      <section class="hero-section">
        <div class="container hero-container">
          <span class="hero-chip">
            <i class="material-icons left">local_fire_department</i> Horneado Fresco Todos los Días
          </span>
          <h1 class="hero-title">El sabor de la tradición en cada rebanada</h1>
          <p class="hero-subtitle">
            Masa madre fermentada lentamente, ingredientes 100% naturales y las recetas artesanales de siempre directo a tu mesa.
          </p>
        </div>
      </section>

      <!-- 🍞 CONTENEDOR PRINCIPAL DEL CATÁLOGO -->
      <div class="container main-catalog-container">
        <!-- BARRA DE CONTROLES: CATEGORÍAS Y SELECTOR DE VISTA -->
        <div class="catalog-controls-bar">
          <div class="category-pills">
            <button 
              *ngFor="let cat of categorias" 
              (click)="categoriaSeleccionada = cat"
              [class.active]="categoriaSeleccionada === cat"
              class="cat-pill-btn">
              {{ cat }}
            </button>
          </div>

          <div class="view-switcher">
            <button 
              (click)="esVistaCuadricula = true" 
              [class.active]="esVistaCuadricula"
              title="Vista Cuadrícula" 
              class="view-btn">
              <i class="material-icons">grid_view</i>
            </button>
            <button 
              (click)="esVistaCuadricula = false" 
              [class.active]="!esVistaCuadricula"
              title="Vista Lista" 
              class="view-btn">
              <i class="material-icons">view_list</i>
            </button>
          </div>
        </div>

        <!-- SPINNER DE CARGA -->
        <div *ngIf="cargando" class="center-align my-5">
          <div class="preloader-wrapper active big">
            <div class="spinner-layer spinner-orange-only">
              <div class="circle-clipper left"><div class="circle"></div></div>
              <div class="gap-patch"><div class="circle"></div></div>
              <div class="circle-clipper right"><div class="circle"></div></div>
            </div>
          </div>
          <p class="text-muted mt-2">Consultando delicias horneadas...</p>
        </div>

        <!-- MENSAJE SI NO HAY PRODUCTOS -->
        <div *ngIf="!cargando && productosFiltrados.length === 0" class="empty-catalog card center-align p-4">
          <i class="material-icons large text-muted">no_meals</i>
          <h5>No encontramos productos en esta categoría</h5>
          <p class="text-muted">Prueba seleccionando otra categoría arriba.</p>
        </div>

        <!-- 📦 LISTADO DE PRODUCTOS (GRILLA O LISTA) -->
        <div *ngIf="!cargando && productosFiltrados.length > 0" 
             [ngClass]="esVistaCuadricula ? 'product-grid' : 'product-list-view'">
          
          <div *ngFor="let prod of productosFiltrados" class="product-card card">
            <div class="card-image-wrapper">
              <img [src]="prod.imagenUrl" [alt]="prod.nombre" (error)="onImgError($event)">
              <span class="category-tag">{{ prod.categoria }}</span>
            </div>

            <div class="card-content-body">
              <div class="card-info">
                <h3 class="product-name">{{ prod.nombre }}</h3>
                <p class="product-desc">{{ prod.descripcion }}</p>
              </div>

              <div class="dotted-divider"></div>

              <div class="card-action-bar">
                <div class="price-box">
                  <span class="price-label">Precio</span>
                  <span class="price-amount">$ {{ prod.precio | number:'1.0-0' }}</span>
                </div>

                <!-- BOTÓN DINÁMICO: AGREGAR O STEPPER [-] N [+] -->
                <div class="action-btn-box">
                  <!-- Si NO está en el carrito -->
                  <button *ngIf="cartService.getItemQuantity(prod.id) === 0" 
                          (click)="cartService.addToCart(prod)"
                          class="btn add-to-cart-btn waves-effect waves-light">
                    <i class="material-icons left">add_shopping_cart</i>
                    <span>Agregar</span>
                  </button>

                  <!-- Si YA está en el carrito -->
                  <div *ngIf="cartService.getItemQuantity(prod.id) > 0" class="quantity-stepper">
                    <button (click)="cartService.updateQuantity(prod.id, cartService.getItemQuantity(prod.id) - 1)" 
                            aria-label="Restar">
                      <i class="material-icons">remove</i>
                    </button>
                    <span class="qty-number">{{ cartService.getItemQuantity(prod.id) }}</span>
                    <button (click)="cartService.updateQuantity(prod.id, cartService.getItemQuantity(prod.id) + 1)" 
                            aria-label="Sumar">
                      <i class="material-icons">add</i>
                    </button>
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
    .catalog-page {
      padding-bottom: 80px;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(180deg, #fbeee9 0%, rgba(251, 238, 233, 0.2) 100%);
      padding: 50px 0 40px 0;
      border-bottom: 1px solid rgba(231, 110, 85, 0.15);
      margin-bottom: 30px;
    }

    .hero-container {
      text-align: center;
      max-width: 800px !important;
    }

    .hero-chip {
      display: inline-flex;
      align-items: center;
      background: #ffffff;
      color: #e76e55;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 6px 16px;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(231, 110, 85, 0.15);
      margin-bottom: 16px;
    }

    .hero-chip i {
      font-size: 18px;
      margin-right: 6px;
    }

    .hero-title {
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1.15;
      margin: 0 0 16px 0;
      background: linear-gradient(135deg, #1e293b 0%, #e76e55 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
    }

    @media (max-width: 600px) {
      .hero-title {
        font-size: 2rem;
      }
    }

    .hero-subtitle {
      font-size: 1.15rem;
      color: #64748b;
      line-height: 1.6;
      margin: 0 auto;
    }

    /* Controls Bar */
    .catalog-controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 30px;
    }

    .category-pills {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .cat-pill-btn {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      padding: 8px 20px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .cat-pill-btn:hover {
      border-color: #e76e55;
      color: #e76e55;
    }

    .cat-pill-btn.active {
      background: #e76e55;
      color: #ffffff;
      border-color: #e76e55;
      box-shadow: 0 3px 10px rgba(231, 110, 85, 0.35);
    }

    .view-switcher {
      display: flex;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 3px;
    }

    .view-btn {
      background: transparent;
      border: none;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn.active {
      background: #f1f5f9;
      color: #e76e55;
    }

    /* Product Grid Layout */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 26px;
    }

    /* Product List Layout */
    .product-list-view {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .product-list-view .product-card {
      display: flex;
      flex-direction: row;
      align-items: stretch;
    }

    .product-list-view .card-image-wrapper {
      width: 220px;
      min-width: 220px;
      height: auto;
    }

    .product-list-view .card-content-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Product Card */
    .product-card {
      border-radius: 18px !important;
      overflow: hidden;
      margin: 0 !important;
      border: 1px solid rgba(226, 232, 240, 0.8) !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04) !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 28px rgba(231, 110, 85, 0.12) !important;
      border-color: rgba(231, 110, 85, 0.3) !important;
    }

    .card-image-wrapper {
      position: relative;
      height: 220px;
      background: #f1f5f9;
      overflow: hidden;
    }

    .card-image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .product-card:hover .card-image-wrapper img {
      transform: scale(1.06);
    }

    .category-tag {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(255, 255, 255, 0.95);
      color: #e76e55;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 12px;
      border-radius: 9999px;
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .card-content-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-name {
      font-size: 1.2rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .product-desc {
      font-size: 0.92rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }

    .dotted-divider {
      border-top: 1px dashed #e2e8f0;
      margin: 16px 0;
    }

    .card-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .price-box {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 0.72rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .price-amount {
      font-size: 1.3rem;
      font-weight: 900;
      color: #e76e55;
    }

    .add-to-cart-btn {
      height: 38px;
      line-height: 38px;
      padding: 0 16px;
      border-radius: 10px !important;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .add-to-cart-btn i {
      font-size: 18px;
      margin-right: 0 !important;
    }
  `]
})
export class CatalogComponent implements OnInit {
  private productoService = inject(ProductoService);
  public cartService = inject(CartService);

  public productos: Producto[] = [];
  public cargando = true;
  public esVistaCuadricula = true;
  public categorias = ['Todos', 'Panes', 'Amasijos', 'Repostería'];
  public categoriaSeleccionada = 'Todos';

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando catálogo:', err);
        this.cargando = false;
      }
    });
  }

  get productosFiltrados(): Producto[] {
    if (this.categoriaSeleccionada === 'Todos') {
      return this.productos;
    }
    return this.productos.filter(p => p.categoria.toLowerCase() === this.categoriaSeleccionada.toLowerCase());
  }

  onImgError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  }
}
