import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-page container animate-fade-in">
      <div class="row">
        <!-- SIDEBAR -->
        <div class="col s12 l3">
          <app-admin-sidebar></app-admin-sidebar>
        </div>

        <!-- CONTENIDO CAMBIO CONTRASEÑA -->
        <div class="col s12 l9">
          <div class="password-page-header">
            <h1 class="admin-main-title">
              <i class="material-icons left">lock_reset</i> Actualizar Contraseña
            </h1>
            <p class="admin-main-subtitle">
              Cambia la clave maestra de acceso para la consola administrativa de Pan de Casa.
            </p>
          </div>

          <div class="password-card card">
            <form (ngSubmit)="actualizarPassword()" #pwdForm="ngForm" class="password-form">
              <div class="input-field">
                <i class="material-icons prefix">lock</i>
                <input id="pwdActual" 
                       type="password" 
                       [(ngModel)]="passwordActual" 
                       name="passwordActual" 
                       required 
                       placeholder="Ingresa la contraseña actual">
                <label for="pwdActual" class="active">Contraseña Actual *</label>
              </div>

              <div class="input-field">
                <i class="material-icons prefix">vpn_key</i>
                <input id="pwdNueva" 
                       type="password" 
                       [(ngModel)]="nuevaPassword" 
                       name="nuevaPassword" 
                       required 
                       minlength="4" 
                       placeholder="Mínimo 4 caracteres">
                <label for="pwdNueva" class="active">Nueva Contraseña *</label>
              </div>

              <div class="input-field">
                <i class="material-icons prefix">check_circle_outline</i>
                <input id="pwdConfirmar" 
                       type="password" 
                       [(ngModel)]="confirmarPassword" 
                       name="confirmarPassword" 
                       required 
                       placeholder="Repite la nueva contraseña">
                <label for="pwdConfirmar" class="active">Confirmar Nueva Contraseña *</label>
              </div>

              <!-- ALERTAS DE RESULTADO -->
              <div *ngIf="errorMsg" class="card-panel red lighten-5 red-text text-darken-4 alert-box">
                <i class="material-icons tiny left">error_outline</i> {{ errorMsg }}
              </div>

              <div *ngIf="exitoMsg" class="card-panel green lighten-5 green-text text-darken-4 alert-box">
                <i class="material-icons tiny left">check_circle</i> {{ exitoMsg }}
              </div>

              <div class="mt-4">
                <button type="submit" 
                        [disabled]="guardando || !pwdForm.valid" 
                        class="btn btn-large waves-effect waves-light save-btn">
                  <span *ngIf="!guardando">Actualizar Contraseña</span>
                  <span *ngIf="guardando">Guardando cambios...</span>
                </button>
              </div>
            </form>
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

    .password-page-header {
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

    .password-card {
      padding: 36px 30px !important;
      border-radius: 20px !important;
      max-width: 600px;
    }

    .save-btn {
      width: 100%;
      height: 50px;
      line-height: 50px;
      border-radius: 12px !important;
    }

    .alert-box {
      border-radius: 10px;
      padding: 12px 16px;
      font-weight: 600;
      margin: 18px 0;
      display: flex;
      align-items: center;
    }
  `]
})
export class AdminPasswordComponent {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  public passwordActual = '';
  public nuevaPassword = '';
  public confirmarPassword = '';
  public guardando = false;
  public errorMsg = '';
  public exitoMsg = '';

  actualizarPassword(): void {
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.errorMsg = 'La nueva contraseña y su confirmación no coinciden.';
      this.exitoMsg = '';
      this.cdr.markForCheck();
      return;
    }

    if (this.nuevaPassword.length < 4) {
      this.errorMsg = 'La nueva contraseña debe tener al menos 4 caracteres.';
      this.exitoMsg = '';
      this.cdr.markForCheck();
      return;
    }

    this.guardando = true;
    this.errorMsg = '';
    this.exitoMsg = '';
    this.cdr.markForCheck();

    this.authService.cambiarPassword(this.passwordActual, this.nuevaPassword).subscribe({
      next: (res) => {
        this.guardando = false;
        this.exitoMsg = res.mensaje || '¡Contraseña actualizada con éxito!';
        this.passwordActual = '';
        this.nuevaPassword = '';
        this.confirmarPassword = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMsg = err.error?.error || 'No se pudo actualizar la contraseña. Revisa la clave actual.';
        this.cdr.markForCheck();
      }
    });
  }
}
