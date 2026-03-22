import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { AuthState } from './store/state/auth.state';
import { AuthApiService } from './api/auth.service';
import { AuthFacadeService } from './facades/auth.facade.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxsModule.forFeature([AuthState])
  ],
  providers: [
    AuthApiService,
    AuthFacadeService
  ]
})
export class AuthModule {}
