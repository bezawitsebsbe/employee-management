import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

// Define interfaces locally to avoid circular dependencies
export interface ActivityItem {
  id: string;
  type: 'employee' | 'payroll' | 'attendance' | 'leave' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
  userId?: string;
  entityId?: string;
}

export interface DashboardStats {
  totalPayroll: number;
  totalEmployees: number;
  totalBonuses: number;
  payrollChange: number;
  employeeChange: number;
}

export interface PayrollData {
  records: Array<{
    netSalary: string;
    department: string;
    weeklyBonus?: string;
    monthlyBonus?: string;
    otherBonuses?: string;
  }>;
}

export interface EmployeeData {
  length: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private payrollData$ = new BehaviorSubject<PayrollData | null>(null);
  private employeeData$ = new BehaviorSubject<EmployeeData | null>(null);
  private activities$ = new BehaviorSubject<ActivityItem[]>([]);

  constructor() {
    this.loadActivitiesFromStorage();
    this.loadFromLocalStorage();
  }

  private loadActivitiesFromStorage(): void {
    try {
      const stored = localStorage.getItem('recentActivities');
      if (stored) {
        const activities = JSON.parse(stored);
        if (Array.isArray(activities)) {
          // Convert string timestamps back to Date objects
          const parsedActivities = activities.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }));
          this.activities$.next(parsedActivities);
          console.log('Loaded activities from localStorage:', parsedActivities.length);
        }
      }
    } catch (error) {
      console.error('Error loading activities from localStorage:', error);
    }
  }

  private saveActivitiesToStorage(): void {
    try {
      const activities = this.activities$.value;
      localStorage.setItem('recentActivities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      console.log('DashboardService: Loading data directly from localStorage...');
      
      // Load employees from localStorage
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        try {
          const parsedEmployees = JSON.parse(storedEmployees);
          if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            console.log('DashboardService: Loaded employees from localStorage:', parsedEmployees.length);
            this.employeeData$.next({ length: parsedEmployees.length });
          }
        } catch (parseError) {
          console.error('DashboardService: Error parsing employees from localStorage:', parseError);
        }
      }
      
      // Load payroll data from localStorage (PRIMARY SOURCE for payroll)
      const storedPayroll = localStorage.getItem('payroll');
      if (storedPayroll) {
        try {
          const parsedPayroll = JSON.parse(storedPayroll);
          if (parsedPayroll && parsedPayroll.records) {
            console.log('DashboardService: Loaded payroll from localStorage:', parsedPayroll.records.length);
            this.payrollData$.next(parsedPayroll);
          }
        } catch (parseError) {
          console.error('DashboardService: Error parsing payroll from localStorage:', parseError);
        }
      } else {
        console.log('DashboardService: No payroll data in localStorage, showing 0 for payroll');
      }
      
    } catch (error) {
      console.error('DashboardService: Error loading from localStorage:', error);
    }
  }

  // Methods to update data from consuming apps
  updatePayrollData(data: PayrollData): void {
    console.log('DashboardService.updatePayrollData called with:', data);
    this.payrollData$.next(data);
    // Track real payroll activity
    this.addActivity({
      id: `payroll-${Date.now()}`,
      type: 'payroll',
      title: 'Payroll Updated',
      description: `Payroll data updated for ${data.records.length} employees`,
      timestamp: new Date(),
      icon: 'dollar-sign',
      color: '#52c41a'
    });
  }

  updateEmployeeData(data: EmployeeData): void {
    console.log('DashboardService.updateEmployeeData called with:', data);
    this.employeeData$.next(data);
    // Track real employee activity
    this.addActivity({
      id: `employee-${Date.now()}`,
      type: 'employee',
      title: 'Employee Data Updated',
      description: `Employee count updated to ${data.length}`,
      timestamp: new Date(),
      icon: 'users',
      color: '#1890ff'
    });
  }

  // Public method to add activities from different pages
  addCustomActivity(activity: {
    type: 'employee' | 'payroll' | 'attendance' | 'system';
    title: string;
    description: string;
    icon?: string;
  }): void {
    this.addActivity({
      id: `${activity.type}-${Date.now()}`,
      ...activity,
      timestamp: new Date(),
      icon: activity.icon || 'info',
      color: activity.type === 'employee' ? '#1890ff' : 
              activity.type === 'payroll' ? '#52c41a' : 
              activity.type === 'attendance' ? '#faad14' : '#722ed1'
    });
  }

  // Specific activity tracking methods
  trackEmployeeAdded(employeeName: string, employeeId: string): void {
    this.addActivity({
      id: `employee-added-${Date.now()}`,
      type: 'employee',
      title: 'New Employee Added',
      description: `${employeeName} (ID: ${employeeId}) joined the team`,
      timestamp: new Date(),
      icon: 'user-add',
      color: '#1890ff',
      entityId: employeeId
    });
  }

  trackEmployeeUpdated(employeeName: string, employeeId: string): void {
    this.addActivity({
      id: `employee-updated-${Date.now()}`,
      type: 'employee',
      title: 'Employee Updated',
      description: `${employeeName}'s information was updated`,
      timestamp: new Date(),
      icon: 'edit',
      color: '#1890ff',
      entityId: employeeId
    });
  }

  trackEmployeeDeleted(employeeName: string, employeeId: string): void {
    this.addActivity({
      id: `employee-deleted-${Date.now()}`,
      type: 'employee',
      title: 'Employee Removed',
      description: `${employeeName} was removed from the system`,
      timestamp: new Date(),
      icon: 'delete',
      color: '#ff4d4f',
      entityId: employeeId
    });
  }

  trackPayrollUpdated(recordCount: number): void {
    this.addActivity({
      id: `payroll-updated-${Date.now()}`,
      type: 'payroll',
      title: 'Payroll Updated',
      description: `Payroll records updated for ${recordCount} employees`,
      timestamp: new Date(),
      icon: 'dollar',
      color: '#52c41a'
    });
  }

  trackAttendanceCheckIn(employeeName: string, employeeId: string): void {
    this.addActivity({
      id: `attendance-checkin-${employeeId}-${Date.now()}`,
      type: 'attendance',
      title: 'Employee Checked In',
      description: `${employeeName} checked in for work`,
      timestamp: new Date(),
      icon: 'check-in',
      color: '#52c41a',
      entityId: employeeId
    });
  }

  trackAttendanceCheckOut(employeeName: string, employeeId: string, workingHours: string): void {
    this.addActivity({
      id: `attendance-checkout-${employeeId}-${Date.now()}`,
      type: 'attendance',
      title: 'Employee Checked Out',
      description: `${employeeName} checked out (${workingHours})`,
      timestamp: new Date(),
      icon: 'check-out',
      color: '#faad14',
      entityId: employeeId
    });
  }

  trackSystemAction(action: string, description: string): void {
    this.addActivity({
      id: `system-${Date.now()}`,
      type: 'system',
      title: action,
      description: description,
      timestamp: new Date(),
      icon: 'setting',
      color: '#722ed1'
    });
  }

  private addActivity(activity: ActivityItem): void {
    const current = this.activities$.value;
    const updated = [activity, ...current].slice(0, 10); // Keep last 10 activities
    this.activities$.next(updated);
    this.saveActivitiesToStorage(); // Save to localStorage
    console.log('DashboardService: Added activity:', activity);
  }

  // Get dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    return new Observable(observer => {
      console.log('getDashboardStats called');
      
      const calculateStats = () => {
        const payrollData = this.payrollData$.value;
        const employeeData = this.employeeData$.value;
        
        console.log('Calculating stats with:', {
          payrollData,
          employeeData
        });
        
        const totalPayroll = this.calculateTotalPayroll(payrollData);
        const totalEmployees = employeeData ? employeeData.length : 0;
        const totalBonuses = this.calculateTotalBonuses(payrollData);

        const stats = {
          totalPayroll,
          totalEmployees,
          totalBonuses,
          payrollChange: 12.5, // Mock data - could be calculated from historical data
          employeeChange: 8 // Mock data - could be calculated from historical data
        };
        
        console.log('Calculated stats:', stats);
        observer.next(stats);
      };

      // Initial calculation
      calculateStats();

      // Subscribe to changes
      const payrollSub = this.payrollData$.subscribe(() => {
        console.log('Payroll data changed, recalculating stats');
        calculateStats();
      });
      
      const employeeSub = this.employeeData$.subscribe(() => {
        console.log('Employee data changed, recalculating stats');
        calculateStats();
      });

      // Cleanup
      return () => {
        payrollSub.unsubscribe();
        employeeSub.unsubscribe();
      };
    });
  }

  // Get recent activities
  getRecentActivities(): Observable<ActivityItem[]> {
    return this.activities$.asObservable();
  }

  // Calculate total payroll from payroll data
  private calculateTotalPayroll(payrollData: PayrollData | null): number {
    if (!payrollData || !payrollData.records) return 0;
    
    return payrollData.records.reduce((total: number, record: any) => {
      const netSalary = parseFloat(record.netSalary.replace(/[^0-9.-]+/g, '')) || 0;
      return total + netSalary;
    }, 0);
  }

  // Calculate total bonuses from payroll data
  private calculateTotalBonuses(payrollData: PayrollData | null): number {
    if (!payrollData || !payrollData.records) return 0;
    
    return payrollData.records.reduce((total: number, record: any) => {
      const weeklyBonus = parseFloat((record.weeklyBonus || '0').replace(/[^0-9.-]+/g, '')) || 0;
      const monthlyBonus = parseFloat((record.monthlyBonus || '0').replace(/[^0-9.-]+/g, '')) || 0;
      const otherBonuses = parseFloat((record.otherBonuses || '0').replace(/[^0-9.-]+/g, '')) || 0;
      return total + weeklyBonus + monthlyBonus + otherBonuses;
    }, 0);
  }

  // Generate unique ID for activities
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Add mock activities for demonstration
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
        description: 'Monthly payroll processed successfully',
        icon: '💰',
        color: 'blue'
      },
      {
        type: 'attendance',
        title: 'Attendance Updated',
        description: 'Daily attendance records updated',
        icon: '🕒',
        color: 'purple'
      }
    ];

    mockActivities.forEach(activity => {
      this.addActivity({
        id: `${activity.type}-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        ...activity
      });
    });
  }
}
