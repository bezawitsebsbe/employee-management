import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../ui/sidebar/src/lib/sidebar.component'; 
import { 
  NzIconModule,
  NzIconDirective,
  NzIconService
} from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DashboardService, DashboardStats, ActivityItem } from './src/lib/dashboard.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard', 
  standalone: true,
  imports: [CommonModule, SidebarComponent, NzIconModule, NzIconDirective, NzTagModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Payroll', icon: '💰', path: '/payroll' },
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
  ];

  dashboardStats$!: Observable<DashboardStats>;
  recentActivities$!: Observable<ActivityItem[]>;
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    console.log('DashboardComponent ngOnInit called');
    this.dashboardStats$ = this.dashboardService.getDashboardStats();
    this.recentActivities$ = this.dashboardService.getRecentActivities();
    
    // Subscribe to see what data we're getting
    this.dashboardStats$.subscribe(stats => {
      console.log('Dashboard stats received:', stats);
    });
    
    this.recentActivities$.subscribe(activities => {
      console.log('Dashboard activities received:', activities);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Format activity time (e.g., "2 hours ago", "1 day ago")
  formatActivityTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Get activity color class
  getActivityColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500'
    };
    return colorMap[color] || 'bg-gray-500';
  }

  // Get activity icon class based on type
  getActivityIconClass(type: string): string {
    const classMap: { [key: string]: string } = {
      employee: 'bg-blue-500',
      payroll: 'bg-green-500',
      attendance: 'bg-yellow-500',
      system: 'bg-purple-500'
    };
    return classMap[type] || 'bg-gray-500';
  }

  // Get activity icon based on type
  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      employee: 'user',
      payroll: 'dollar',
      attendance: 'clock-circle',
      system: 'setting'
    };
    return iconMap[type] || 'info';
  }

  // Get activity tag color based on type
  getActivityTagColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      employee: 'blue',
      payroll: 'green',
      attendance: 'orange',
      system: 'purple'
    };
    return colorMap[type] || 'default';
  }

  // Get activity type label
  getActivityTypeLabel(type: string): string {
    const labelMap: { [key: string]: string } = {
      employee: 'Employee',
      payroll: 'Payroll',
      attendance: 'Attendance',
      system: 'System'
    };
    return labelMap[type] || 'Other';
  }

  // Handle quick action button click
  onQuickAction(): void {
    console.log('Quick action clicked');
    // Could open a modal or navigate to a quick action page
  }

  // Handle filter button click
  onFilter(): void {
    console.log('Filter clicked');
    // Could open filter options
  }

  // Handle export button click
  onExport(): void {
    console.log('Export clicked');
    // Could export dashboard data
  }
}