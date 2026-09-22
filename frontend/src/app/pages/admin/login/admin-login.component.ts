import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-login-page container animate-fade-in">
      <div class="login-card-wrapper">
        <div class="login-card card">
          <div class="login-header center-align">
            <div class="login-icon-badge">
              <i class="material-icons large">shield</i>
            </div>
            <h1 class="login-title">Acceso Administrativo</h1>
            <p class="login-subtitle">
              Consola de operaciones para cocina, pedidos e inventario de <strong>Pan de Casa</strong>.
            </p>
          </div>

          <form (ngSubmit)="login()" class="login-form">
            <div class="input-field">
              <i class="material-icons prefix">lock</i>
              <input id="password" 
                     type="password" 
                     [(ngModel)]="password" 
                     name="password" 
                     placeholder="Ingresa la clave de administración" 
                     required>
              <label for="password" class="active">Contraseña Maestra</label>
            </div>

            <div *ngIf="errorMsg" class="card-panel red lighten-5 red-text text-darken-4 error-box">
              <i class="material-icons tiny left">error_outline</i> {{ errorMsg }}
            </div>

            <div class="login-actions mt-4">
              <button type="submit" 
                      [disabled]="cargando || !password" 
                      class="btn btn-large submit-btn waves-effect waves-light">
                <span *ngIf="!cargando">Ingresar al Panel</span>
                <span *ngIf="cargando">Verificando...</span>
              </button>
            </div>
          </form>

          <div class="center-align mt-4">
            <a routerLink="/" class="back-link">
              <i class="material-icons tiny left">arrow_back</i> Volver a la Tienda
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 10px;
    }

    .login-card-wrapper {
      width: 100%;
      max-width: 460px;
    }

    .login-card {
      padding: 40px 32px !important;
      border-radius: 24px !important;
    }

    .login-icon-badge {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      background: #fbeee9;
      color: #e76e55;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 18px auto;
    }

    .login-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .login-subtitle {
      font-size: 0.95rem;
      color: #64748b;
      line-height: 1.5;
    }

    .login-form {
      margin-top: 24px;
    }

    .submit-btn {
      width: 100%;
      height: 50px;
      line-height: 50px;
      border-radius: 12px !important;
      font-size: 1rem;
    }

    .error-box {
      border-radius: 10px;
      padding: 10px 14px;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
    }

    .back-link {
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #e76e55;
    }
  `]
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public password = '';
  public cargando = false;
  public errorMsg = '';

  login(): void {
    if (!this.password) return;

    this.cargando = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.authService.login(this.password).subscribe({
      next: (res) => {
        this.cargando = false;
        this.cdr.markForCheck();
        if (res.success) {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err.error?.error || 'Contraseña de administración incorrecta.';
        this.cdr.markForCheck();
      }
    });
  }
}
