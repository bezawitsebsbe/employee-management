import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../ui/sidebar/src/lib/sidebar.component'; 
import { 
  NzIconModule,
  NzIconDirective,
  NzIconService
} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-dashboard', 
  standalone: true,
  imports: [CommonModule, SidebarComponent, NzIconModule, NzIconDirective],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Payroll', icon: '💰', path: '/payroll' },
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
    { label: 'Leave Request', icon: '📅', path: '/leave' },
  ];
}