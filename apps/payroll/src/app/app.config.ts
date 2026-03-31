import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideStore } from '@ngxs/store';
import {
  UserOutline,
  DollarOutline,
  GiftOutline,
  MinusOutline,
  EditOutline,
  DeleteOutline,
  SearchOutline,
  ExportOutline,
  PlusOutline
} from '@ant-design/icons-angular/icons';
import { FirebaseService } from '@employee-payroll/firebase';
import { PayrollFirebaseApi } from './features/payroll-managment/api/payroll.firebase-api';
import { PayrollFirebaseStore } from './features/payroll-managment/store/payroll.firebase-store';
import { PayrollFirebaseFacade } from './features/payroll-managment/facade/payroll.facade';
import { AuthState, DashboardState } from '@employee-payroll/features';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(appRoutes),
    provideNzIcons([
      UserOutline,
      DollarOutline,
      GiftOutline,
      MinusOutline,
      EditOutline,
      DeleteOutline,
      SearchOutline,
      ExportOutline,
      PlusOutline
    ]),
    // NGXS Store
    provideStore([AuthState, DashboardState]),
    // Firebase services
    FirebaseService,
    PayrollFirebaseApi,
    PayrollFirebaseStore,
    PayrollFirebaseFacade
  ],
};
