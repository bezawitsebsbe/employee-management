import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PayrollManagementPageComponent } from './features/payroll-managment/pages/payroll-management-page/payroll-management-page.component';

@Component({
  imports: [RouterModule, PayrollManagementPageComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  title = 'payroll';
}
