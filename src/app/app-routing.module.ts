import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent, SignupComponent } from '@employee-payroll/features/auth';
import { AuthGuard, AdminGuard } from '@employee-payroll/features/auth';

const routes: Routes = [
  // Redirect root to signin
  { path: '', redirectTo: '/auth/signin', pathMatch: 'full' },
  
  // Auth routes
  {
    path: 'auth',
    children: [
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent },
      { path: '', redirectTo: 'signin', pathMatch: 'full' }
    ]
  },
  
  // User dashboard (protected)
  { 
    path: 'dashboard', 
    loadChildren: () => import('@employee-payroll/features').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  
  // Admin routes (admin protected)
  { 
    path: 'employee-mgt', 
    loadChildren: () => import('apps/employee-mgt/src/app/app.module').then(m => m.AppModule),
    canActivate: [AdminGuard]
  },
  
  // Wildcard redirect
  { path: '**', redirectTo: '/auth/signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
