import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from '../../libs/features/auth/src/lib/containers/signin/signin.component';
import { SignupComponent } from '../../libs/features/auth/src/lib/containers/signup/signup.component';
import { AuthGuard } from '../../libs/features/auth/src/lib/api/auth.guard';
import { AdminGuard } from '../../libs/features/auth/src/lib/api/auth.guard';

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
