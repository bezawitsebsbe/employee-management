// app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
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

import { provideStore } from '@ngxs/store';
import { AuthState } from '../../../../libs/features/auth/src/lib/store/state/auth.state';
import { DashboardState } from '../../../../libs/features/dashboard/src/lib/store/state/dashboard.state';
import { EmployeeState } from './features/employee/store/state/employee.state';
import { AttendanceState } from './features/attendance/store/state/attendance.state';
import { appRoutes } from './app.routes';

import { provideBrowserGlobalErrorListeners } from '@angular/core'; // if you really need it

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    

    provideHttpClient(),

    provideAnimations(), // or provideNoopAnimations() if you don't need real animations

    provideStore([AuthState, DashboardState, EmployeeState, AttendanceState]),

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

    provideBrowserGlobalErrorListeners(), // keep if you need it
  ],
};

console.log('App config initialized with routes:', appRoutes);
