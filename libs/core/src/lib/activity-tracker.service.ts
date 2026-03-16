import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ActivityItem {
  id: string;
  type: 'employee' | 'payroll' | 'attendance' | 'leave';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
  userId?: string;
  entityId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityTrackerService {
  private activities$ = new BehaviorSubject<ActivityItem[]>([]);
  private maxActivities = 50; // Keep last 50 activities

  constructor() {
    this.loadInitialActivities();
  }

  // Get all activities
  getActivities(): Observable<ActivityItem[]> {
    return this.activities$.asObservable();
  }

  // Add a new activity
  addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const newActivity: ActivityItem = {
      ...activity,
      id: this.generateId(),
      timestamp: new Date()
    };

    const currentActivities = this.activities$.value;
    const updatedActivities = [newActivity, ...currentActivities].slice(0, this.maxActivities);
    this.activities$.next(updatedActivities);

    // Also store in localStorage for persistence
    this.saveToLocalStorage(updatedActivities);
  }

  // Add activities in bulk
  addActivities(activities: Omit<ActivityItem, 'id' | 'timestamp'>[]): void {
    const newActivities = activities.map(activity => ({
      ...activity,
      id: this.generateId(),
      timestamp: new Date()
    }));

    const currentActivities = this.activities$.value;
    const updatedActivities = [...newActivities, ...currentActivities].slice(0, this.maxActivities);
    this.activities$.next(updatedActivities);
    this.saveToLocalStorage(updatedActivities);
  }

  // Clear all activities
  clearActivities(): void {
    this.activities$.next([]);
    localStorage.removeItem('hr_activities');
  }

  // Get activities by type
  getActivitiesByType(type: ActivityItem['type']): Observable<ActivityItem[]> {
    return new Observable(observer => {
      this.activities$.subscribe(activities => {
        const filtered = activities.filter(activity => activity.type === type);
        observer.next(filtered);
      });
    });
  }

  // Get recent activities (last N)
  getRecentActivities(limit: number = 10): Observable<ActivityItem[]> {
    return new Observable(observer => {
      this.activities$.subscribe(activities => {
        const recent = activities.slice(0, limit);
        observer.next(recent);
      });
    });
  }

  // Helper methods for common activity types
  trackEmployeeAction(action: string, description: string, employeeId?: string): void {
    this.addActivity({
      type: 'employee',
      title: action,
      description,
      icon: '👤',
      color: 'green',
      entityId: employeeId
    });
  }

  trackPayrollAction(action: string, description: string, payrollId?: string): void {
    this.addActivity({
      type: 'payroll',
      title: action,
      description,
      icon: '💰',
      color: 'blue',
      entityId: payrollId
    });
  }

  trackAttendanceAction(action: string, description: string, attendanceId?: string): void {
    this.addActivity({
      type: 'attendance',
      title: action,
      description,
      icon: '🕒',
      color: 'purple',
      entityId: attendanceId
    });
  }

  trackLeaveAction(action: string, description: string, leaveId?: string): void {
    this.addActivity({
      type: 'leave',
      title: action,
      description,
      icon: '📅',
      color: 'yellow',
      entityId: leaveId
    });
  }

  // Private methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadInitialActivities(): void {
    const stored = localStorage.getItem('hr_activities');
    if (stored) {
      try {
        const activities = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const parsedActivities = activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        this.activities$.next(parsedActivities);
      } catch (error) {
        console.error('Error loading activities from localStorage:', error);
        this.addMockActivities();
      }
    } else {
      this.addMockActivities();
    }
  }

  private saveToLocalStorage(activities: ActivityItem[]): void {
    try {
      localStorage.setItem('hr_activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities to localStorage:', error);
    }
  }

  private addMockActivities(): void {
    const mockActivities: Omit<ActivityItem, 'id' | 'timestamp'>[] = [
      {
        type: 'employee',
        title: 'New Employee Added',
        description: 'John Doe joined the development team',
        icon: '👤',
        color: 'green'
      },
      {
        type: 'payroll',
        title: 'Payroll Processed',
        description: 'Monthly payroll processed for all employees',
        icon: '💰',
        color: 'blue'
      },
      {
        type: 'attendance',
        title: 'Attendance Updated',
        description: 'Daily attendance records updated',
        icon: '🕒',
        color: 'purple'
      },
      {
        type: 'leave',
        title: 'Leave Request',
        description: 'Sarah submitted sick leave request',
        icon: '📅',
        color: 'yellow'
      }
    ];

    this.addActivities(mockActivities);
  }
}
