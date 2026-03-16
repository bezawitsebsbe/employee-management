// app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  DollarOutline,
  TeamOutline,
  LineChartOutline,
  ClockCircleOutline,
  HistoryOutline,
  DownloadOutline,
  PlusOutline,
  FormOutline,
  ApartmentOutline,
  BankOutline,
} from '@ant-design/icons-angular/icons';

import {
  EditOutline,
  DeleteOutline,
  MailOutline,
  PhoneOutline,
} from '@ant-design/icons-angular/icons';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { appRoutes } from './app.routes';


import { AuthService } from '@employee-payroll/core'; // assuming this is injectable
import { DashboardBridgeService } from './services/dashboard-bridge.service';

import { provideBrowserGlobalErrorListeners } from '@angular/core'; // if you really need it

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),

    provideAnimations(), // or provideNoopAnimations() if you don't need real animations

    provideNzIcons([
      DollarOutline,
      TeamOutline,
      LineChartOutline,
      ClockCircleOutline,
      HistoryOutline,
      EditOutline,
      DeleteOutline,
      MailOutline,
      PhoneOutline,
      DownloadOutline,
      PlusOutline,
      FormOutline,
      ApartmentOutline,
      BankOutline,
    ]),

    

    // DevTools — only in development
    provideStoreDevtools({
      maxAge: 25, // keep last 25 actions
      logOnly: !isDevMode(), // no actions in production
      autoPause: true, // pause when tab inactive
      name: 'Employee Portal', // optional: label in devtools
    }),

    AuthService, // if it's @Injectable({ providedIn: 'root' }) → no need to provide manually
    DashboardBridgeService, // Bridge service for dashboard integration

    provideBrowserGlobalErrorListeners(), // keep if you need it
  ],
};
