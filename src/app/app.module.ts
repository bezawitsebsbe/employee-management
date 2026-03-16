import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Ng-Zorro
import { NgZorroAntdModule } from 'ng-zorro-antd';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Features
import { AuthModule } from '@employee-payroll/features/auth';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgZorroAntdModule,
    AppRoutingModule,
    AuthModule
  ],
  providers: [],
  bootstrap: []
})
export class AppModule {}
