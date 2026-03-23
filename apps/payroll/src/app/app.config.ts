import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  UserOutline,
  DollarOutline,
  GiftOutline,
  MinusCircleOutline,
  EditOutline,
  DeleteOutline,
  SearchOutline,
  ExportOutline,
  PlusOutline
} from '@ant-design/icons-angular/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(appRoutes),
    provideNzIcons([
      UserOutline,
      DollarOutline,
      GiftOutline,
      MinusCircleOutline,
      EditOutline,
      DeleteOutline,
      SearchOutline,
      ExportOutline,
      PlusOutline
    ])
  ],
};
