import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface MetricasAdmin {
  ventasTotales: number;
  pedidosTotales: number;
  pendientesEnvio: number;
  aHornear: Array<{ producto: string; cantidadRequerida: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/admin';
  private readonly ADMIN_KEY = 'panDeCasa_admin_auth';

  public isAdminLoggedIn = signal<boolean>(this.checkInitialAuth());

  constructor(private http: HttpClient) {}

  private checkInitialAuth(): boolean {
    return localStorage.getItem(this.ADMIN_KEY) === 'true';
  }

  login(password: string): Observable<{ success: boolean; rol: string; mensaje: string }> {
    return this.http.post<{ success: boolean; rol: string; mensaje: string }>(`${this.apiUrl}/login`, { password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem(this.ADMIN_KEY, 'true');
          this.isAdminLoggedIn.set(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.ADMIN_KEY);
    this.isAdminLoggedIn.set(false);
  }

  getMetricas(): Observable<MetricasAdmin> {
    return this.http.get<MetricasAdmin>(`${this.apiUrl}/metricas`);
  }

  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, { passwordActual, nuevaPassword });
  }
}
