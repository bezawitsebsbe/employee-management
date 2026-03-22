import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { DASHBOARD_ROUTES } from './dashboard.routes';
import { DashboardComponent } from './containers/dashboard.component';
import { DashboardState } from './store/state/dashboard.state';
import { DashboardApiService } from './api/dashboard.service';
import { DashboardFacadeService } from './facades/dashboard.facade.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(DASHBOARD_ROUTES),
    NgxsModule.forFeature([DashboardState])
  ],
  providers: [
    DashboardApiService,
    DashboardFacadeService
  ],
  exports: []
})
export class DashboardModule {}
