import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderStatusComponent } from './pages/order-status/order-status.component';
import { AdminLoginComponent } from './pages/admin/login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/orders/admin-orders.component';
import { AdminPasswordComponent } from './pages/admin/password/admin-password.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas (Cliente)
  { path: '', component: CatalogComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-status', component: OrderStatusComponent },
  { path: 'admin', component: AdminLoginComponent },

  // Rutas protegidas (Administración)
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [authGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [authGuard] },
  { path: 'admin/password', component: AdminPasswordComponent, canActivate: [authGuard] },

  // Fallback
  { path: '**', redirectTo: '' }
];
