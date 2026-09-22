import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/producto.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-page container animate-fade-in">
      <div class="row">
        <!-- SIDEBAR -->
        <div class="col s12 l3">
          <app-admin-sidebar></app-admin-sidebar>
        </div>

        <!-- CONTENIDO CRUD PRODUCTOS -->
        <div class="col s12 l9">
          <div class="header-action-bar">
            <div>
              <h1 class="admin-main-title">
                <i class="material-icons left">inventory_2</i> Gestión de Catálogo
              </h1>
              <p class="admin-main-subtitle">
                Crea, actualiza precios, controla existencias y gestiona las fotos de tus panes.
              </p>
            </div>
            <button (click)="abrirModalCrear()" class="btn btn-large waves-effect waves-light add-prod-btn">
              <i class="material-icons left">add</i> Nuevo Producto
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

          <!-- GRILLA DE PRODUCTOS ADMINISTRATIVOS -->
          <div *ngIf="!cargando" class="row product-admin-grid">
            <div *ngFor="let prod of productos" class="col s12 m6">
              <div class="admin-prod-card card">
                <div class="prod-thumb">
                  <img [src]="prod.imagenUrl" [alt]="prod.nombre" (error)="onImgError($event)">
                  <span class="stock-pill" [class.low-stock]="prod.stock < 10">
                    Stock: {{ prod.stock }}
                  </span>
                </div>

                <div class="prod-content">
                  <span class="prod-cat">{{ prod.categoria }}</span>
                  <h3 class="prod-title">{{ prod.nombre }}</h3>
                  <p class="prod-desc">{{ prod.descripcion }}</p>
                  <div class="prod-price">$ {{ prod.precio | number:'1.0-0' }} COP</div>

                  <div class="prod-actions">
                    <button (click)="abrirModalEditar(prod)" class="btn btn-small btn-secondary waves-effect">
                      <i class="material-icons left">edit</i> Editar
                    </button>
                    <button (click)="eliminarProducto(prod)" class="btn btn-small btn-danger waves-effect">
                      <i class="material-icons left">delete</i> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🪟 MODAL DE AGREGAR / EDITAR PRODUCTO -->
      <div *ngIf="mostrarModal" class="custom-modal-backdrop animate-fade-in" (click)="cerrarModalSiBackdrop($event)">
        <div class="custom-modal-dialog card" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <h2 class="modal-dialog-title">
              <i class="material-icons left">{{ editandoId ? 'edit_note' : 'add_circle' }}</i>
              {{ editandoId ? 'Editar Producto' : 'Nuevo Producto' }}
            </h2>
            <button (click)="cerrarModal()" class="modal-close-btn" aria-label="Cerrar modal">
              <i class="material-icons">close</i>
            </button>
          </div>

          <form (ngSubmit)="guardarProducto()" #prodForm="ngForm" class="modal-form">
            <div class="input-field">
              <input id="prodNombre" type="text" [(ngModel)]="productoForm.nombre" name="nombre" required placeholder=" ">
              <label for="prodNombre" class="active">Nombre del Producto *</label>
            </div>

            <div class="row m-0">
              <div class="input-field col s12 m6 pl-0">
                <input id="prodPrecio" type="number" [(ngModel)]="productoForm.precio" name="precio" min="1" required placeholder=" ">
                <label for="prodPrecio" class="active">Precio en COP *</label>
              </div>
              <div class="input-field col s12 m6 pr-0">
                <input id="prodStock" type="number" [(ngModel)]="productoForm.stock" name="stock" min="0" required placeholder=" ">
                <label for="prodStock" class="active">Stock Inicial *</label>
              </div>
            </div>

            <div class="input-field">
              <label class="active select-label">Categoría</label>
              <select [(ngModel)]="productoForm.categoria" name="categoria" class="browser-default custom-select">
                <option value="Panes">Panes</option>
                <option value="Amasijos">Amasijos</option>
                <option value="Repostería">Repostería</option>
                <option value="Bebidas">Bebidas</option>
              </select>
            </div>

            <div class="row m-0 align-items-center img-preview-row">
              <div class="input-field col s9 pl-0">
                <input id="prodImg" type="text" [(ngModel)]="productoForm.imagenUrl" name="imagenUrl" placeholder="URL de la imagen">
                <label for="prodImg" class="active">URL de la Imagen</label>
              </div>
              <div class="col s3 pr-0 center-align">
                <div class="preview-box">
                  <img [src]="productoForm.imagenUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'" 
                       alt="Preview" 
                       (error)="onImgError($event)">
                </div>
              </div>
            </div>

            <div class="input-field">
              <textarea id="prodDesc" class="materialize-textarea" [(ngModel)]="productoForm.descripcion" name="descripcion" placeholder=" "></textarea>
              <label for="prodDesc" class="active">Descripción del Producto</label>
            </div>

            <div class="modal-footer-actions">
              <button type="button" (click)="cerrarModal()" class="btn btn-secondary waves-effect">
                Cancelar
              </button>
              <button type="submit" [disabled]="!prodForm.valid || guardando" class="btn waves-effect waves-light">
                <span *ngIf="!guardando">Guardar Cambios</span>
                <span *ngIf="guardando">Guardando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding-top: 30px;
      padding-bottom: 80px;
    }

    .header-action-bar {
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

    .add-prod-btn {
      height: 48px;
      line-height: 48px;
      border-radius: 12px !important;
    }

    /* Card de Producto en Admin */
    .admin-prod-card {
      border-radius: 18px !important;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin: 0 0 24px 0 !important;
    }

    .prod-thumb {
      height: 180px;
      position: relative;
      background: #f1f5f9;
    }

    .prod-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .stock-pill {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(15, 23, 42, 0.8);
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      backdrop-filter: blur(4px);
    }

    .stock-pill.low-stock {
      background: #ef4444;
    }

    .prod-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .prod-cat {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #e76e55;
    }

    .prod-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e293b;
      margin: 4px 0 6px 0;
    }

    .prod-desc {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.4;
      flex: 1;
      margin-bottom: 12px;
    }

    .prod-price {
      font-size: 1.25rem;
      font-weight: 900;
      color: #e76e55;
      margin-bottom: 16px;
    }

    .prod-actions {
      display: flex;
      gap: 10px;
    }

    .prod-actions button {
      flex: 1;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Modal Backdrop */
    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .custom-modal-dialog {
      width: 100%;
      max-width: 580px;
      border-radius: 20px !important;
      padding: 28px !important;
      max-height: 90vh;
      overflow-y: auto;
      margin: 0 !important;
    }

    .modal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .modal-dialog-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .modal-dialog-title i {
      color: #e76e55;
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
    }

    .modal-close-btn:hover {
      color: #1e293b;
    }

    .select-label {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 6px;
      display: block;
    }

    .custom-select {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-family: inherit;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .img-preview-row {
      display: flex;
      align-items: center;
    }

    .preview-box {
      width: 54px;
      height: 54px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      margin-top: -10px;
    }

    .preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  public productos: Producto[] = [];
  public cargando = true;
  public mostrarModal = false;
  public editandoId: number | null = null;
  public guardando = false;

  public productoForm: any = {
    nombre: '',
    descripcion: '',
    precio: 2000,
    stock: 20,
    categoria: 'Panes',
    imagenUrl: ''
  };

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.cdr.markForCheck();
    this.productoService.getProductos(true).subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModalCrear(): void {
    this.editandoId = null;
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 2500,
      stock: 20,
      categoria: 'Panes',
      imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(prod: Producto): void {
    this.editandoId = prod.id;
    this.productoForm = {
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      stock: prod.stock,
      categoria: prod.categoria,
      imagenUrl: prod.imagenUrl
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  cerrarModalSiBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('custom-modal-backdrop')) {
      this.cerrarModal();
    }
  }

  guardarProducto(): void {
    this.guardando = true;
    this.cdr.markForCheck();

    if (this.editandoId) {
      this.productoService.updateProducto(this.editandoId, this.productoForm).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarProductos();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.guardando = false;
          this.cdr.markForCheck();
          alert('Error al actualizar producto: ' + (err.error?.error || err.message));
        }
      });
    } else {
      this.productoService.createProducto(this.productoForm).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarProductos();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.guardando = false;
          this.cdr.markForCheck();
          alert('Error al crear producto: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  eliminarProducto(prod: Producto): void {
    if (confirm(`¿Estás seguro de eliminar el producto "${prod.nombre}" del catálogo?`)) {
      this.productoService.deleteProducto(prod.id).subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (err) => {
          alert('Error al eliminar: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  onImgError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  }
}
