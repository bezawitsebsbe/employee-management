import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DashboardApiService } from '../api/dashboard.service';
import {
  LoadDashboardStats,
  LoadRecentActivities,
  AddActivity,
  ClearActivities,
  UpdateStats
} from '../store/action/dashboard.action';
import { DashboardState } from '../store/state/dashboard.state';
import { DashboardStats, ActivityItem } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardFacadeService {
  // Observable properties from store
  stats$!: Observable<DashboardStats | null>;
  recentActivities$!: Observable<ActivityItem[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  constructor(
    private store: Store,
    private dashboardApi: DashboardApiService
  ) {
    // Initialize store properties in constructor
    this.stats$ = this.store.select(DashboardState.stats);
    this.recentActivities$ = this.store.select(DashboardState.recentActivities);
    this.loading$ = this.store.select(DashboardState.loading);
    this.error$ = this.store.select(DashboardState.error);
  }

  // Load dashboard statistics
  loadDashboardStats(): void {
    this.store.dispatch(new LoadDashboardStats());
  }

  // Load recent activities
  loadRecentActivities(): void {
    this.store.dispatch(new LoadRecentActivities());
  }

  // Add new activity
  addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    console.log('Adding activity to dashboard:', activity);
    this.store.dispatch(new AddActivity({ activity: { ...activity, id: Date.now().toString(), timestamp: new Date() } }));
  }

  // Update dashboard stats
  updateStats(stats: Partial<DashboardStats>): void {
    this.store.dispatch(new UpdateStats({ stats }));
  }

  // Clear all activities
  clearActivities(): void {
    this.store.dispatch(new ClearActivities());
  }

  // Activity tracking methods
  trackEmployeeLogin(employeeName: string, employeeId: string): void {
    this.addActivity({
      type: 'employee',
      title: 'Employee Login',
      description: `${employeeName} logged in`,
      color: 'blue',
      icon: 'user'
    });
  }

  trackPayrollActivity(description: string, amount?: number): void {
    console.log('Tracking payroll activity:', description, amount);
    this.addActivity({
      type: 'payroll',
      title: 'Payroll Processed',
      description,
      color: 'green',
      icon: 'dollar'
    });
  }

  trackPayrollDeletion(description: string, amount?: number): void {
    console.log('Tracking payroll deletion:', description, amount);
    this.addActivity({
      type: 'payroll',
      title: 'Payroll Deleted',
      description,
      color: 'red',
      icon: 'delete'
    });
    
    // Update statistics to reflect deletion
    this.updateStatsForPayrollDeletion(amount || 0);
  }

  updateStatsForPayrollDeletion(deletedAmount: number): void {
    // Get current stats and update them
    this.stats$.subscribe(currentStats => {
      if (currentStats) {
        const updatedStats = {
          totalPayroll: Math.max(0, (currentStats.totalPayroll || 0) - deletedAmount),
          thisMonthPayroll: Math.max(0, (currentStats.thisMonthPayroll || 0) - deletedAmount)
        };
        this.updateStats(updatedStats);
      }
    }).unsubscribe();
  }

  trackAttendanceCheckIn(employeeName: string, employeeId: string): void {
    this.addActivity({
      type: 'attendance',
      title: 'Employee Check-In',
      description: `${employeeName} checked in`,
      color: 'yellow',
      icon: 'clock-circle'
    });
  }

  trackAttendanceCheckOut(employeeName: string, employeeId: string, workingHours?: string): void {
    this.addActivity({
      type: 'attendance',
      title: 'Employee Check-Out',
      description: `${employeeName} checked out (${workingHours})`,
      color: 'yellow',
      icon: 'clock-circle'
    });
  }

  trackEmployeeAdded(employeeName: string, employeeId: string): void {
    this.addActivity({
      type: 'employee',
      title: 'New Employee Added',
      description: `${employeeName} joined the team`,
      color: 'green',
      icon: 'user-add'
    });
  }

  trackEmployeeUpdated(employeeName: string, employeeId: string): void {
    this.addActivity({
      type: 'employee',
      title: 'Employee Updated',
      description: `${employeeName}'s information was updated`,
      color: 'blue',
      icon: 'edit'
    });
  }

  trackSystemAction(action: string, description: string): void {
    this.addActivity({
      type: 'system',
      title: action,
      description,
      color: 'purple',
      icon: 'setting'
    });
  }

  // Initialize dashboard data
  initializeDashboard(): void {
    this.loadDashboardStats();
    this.loadRecentActivities();
  }
}
