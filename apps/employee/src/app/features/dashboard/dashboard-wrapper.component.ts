import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '@employee-payroll/features';

@Component({
  selector: 'app-dashboard-wrapper',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  template: '<app-dashboard [currentApp]="currentApp"></app-dashboard>'
})
export class DashboardWrapperComponent {
  currentApp = 'employee';
}
