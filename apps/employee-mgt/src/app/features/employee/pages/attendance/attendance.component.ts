import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '@employee-payroll/sidebar';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';
import { EmployeeAttendance } from '../../api/employee.model';
import { DashboardService } from '@employee-payroll/features';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzSelectModule,
    NzInputModule,
    NzTagModule,
    NzCardModule,
    NzIconModule,
    SidebarComponent,
  ],
})
export class AttendanceComponent {
  facade = inject(EmployeeSimpleFacade);
  dashboardService = inject(DashboardService);

  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Payroll', icon: '💰', path: '/payroll' },
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
  ];

  // Store attendance records
  private attendanceRecords: { [key: string]: { checkIn?: Date; checkOut?: Date; } } = {};

  // Expose facade data to template
  attendanceData = this.facade.filteredAttendance;
  attendanceSummary = this.facade.attendanceSummary;
  loading = this.facade.loading;
  error = this.facade.error;

  constructor() {
    // Load existing attendance from localStorage
    this.loadAttendanceFromStorage();
  }

  private loadAttendanceFromStorage(): void {
    try {
      const stored = localStorage.getItem('attendanceRecords');
      if (stored) {
        this.attendanceRecords = JSON.parse(stored);
        // Auto-reset for new day
        this.resetForNewDay();
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  }

  private resetForNewDay(): void {
    const today = new Date().toDateString();
    
    Object.keys(this.attendanceRecords).forEach(employeeId => {
      const record = this.attendanceRecords[employeeId];
      
      // If there's a check-in from a previous day, reset it
      if (record.checkIn) {
        const checkInDate = new Date(record.checkIn);
        if (checkInDate.toDateString() !== today) {
          // Reset for new day
          this.attendanceRecords[employeeId] = {};
        }
      }
      
      // Also reset if there's a check-out from previous day
      if (record.checkOut) {
        const checkOutDate = new Date(record.checkOut);
        if (checkOutDate.toDateString() !== today) {
          // Reset for new day
          this.attendanceRecords[employeeId] = {};
        }
      }
    });
    
    // Save the reset data
    this.saveAttendanceToStorage();
  }

  private saveAttendanceToStorage(): void {
    try {
      localStorage.setItem('attendanceRecords', JSON.stringify(this.attendanceRecords));
    } catch (error) {
      console.error('Error saving attendance records:', error);
    }
  }

  getEmployeeAttendance(employeeId: string): { checkIn?: string; checkOut?: string; workingHours?: string; status: string } {
    const record = this.attendanceRecords[employeeId] || {};
    const employee = this.facade.employees().find(emp => emp.id === employeeId);
    
    let status = 'Absent';
    if (record.checkIn && !record.checkOut) {
      status = 'Present';
    } else if (record.checkIn && record.checkOut) {
      status = 'Present';
    }

    return {
      checkIn: record.checkIn ? this.formatTime(record.checkIn) : '-',
      checkOut: record.checkOut ? this.formatTime(record.checkOut) : '-',
      workingHours: record.checkIn && record.checkOut ? this.calculateWorkingHours(record.checkIn, record.checkOut) : '0h 0m',
      status
    };
  }

  private formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  private calculateWorkingHours(checkIn: Date | string, checkOut: Date | string): string {
    if (!checkIn || !checkOut) return '0h 0m';
    
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  }

  checkIn(employeeId?: string) {
    const targetEmployeeId = employeeId || this.facade.employees()[0]?.id;
    if (!targetEmployeeId) return;

    const employee = this.facade.employees().find(emp => emp.id === targetEmployeeId);
    if (!employee) return;

    // Initialize record if not exists
    if (!this.attendanceRecords[targetEmployeeId]) {
      this.attendanceRecords[targetEmployeeId] = {};
    }

    // Check if already checked in today
    if (this.attendanceRecords[targetEmployeeId].checkIn && !this.attendanceRecords[targetEmployeeId].checkOut) {
      alert(`${employee.fullName} is already checked in!`);
      return;
    }

    // Reset for new day if checked out yesterday
    if (this.attendanceRecords[targetEmployeeId].checkOut) {
      const checkOutDate = new Date(this.attendanceRecords[targetEmployeeId].checkOut);
      const today = new Date();
      if (checkOutDate.toDateString() !== today.toDateString()) {
        this.attendanceRecords[targetEmployeeId] = {};
      }
    }

    // Record check-in time
    this.attendanceRecords[targetEmployeeId].checkIn = new Date();
    this.saveAttendanceToStorage();

    const time = this.formatTime(this.attendanceRecords[targetEmployeeId].checkIn);
    
    // Track activity in dashboard
    try {
      this.dashboardService.trackAttendanceCheckIn(employee.fullName, targetEmployeeId);
    } catch (error) {
      console.warn('Failed to track attendance activity:', error);
    }
    
    alert(`${employee.fullName} checked in at ${time}`);
  }

  checkOut(employeeId: string) {
    const employee = this.facade.employees().find(emp => emp.id === employeeId);
    if (!employee) return;

    // Initialize record if not exists
    if (!this.attendanceRecords[employeeId]) {
      this.attendanceRecords[employeeId] = {};
    }

    // Check if checked in
    if (!this.attendanceRecords[employeeId].checkIn) {
      alert(`${employee.fullName} is not checked in!`);
      return;
    }

    // Check if already checked out
    if (this.attendanceRecords[employeeId].checkOut) {
      const checkOutDate = new Date(this.attendanceRecords[employeeId].checkOut);
      const checkInDate = new Date(this.attendanceRecords[employeeId].checkIn);
      if (checkOutDate > checkInDate) {
        alert(`${employee.fullName} is already checked out!`);
        return;
      }
    }

    // Record check-out time
    this.attendanceRecords[employeeId].checkOut = new Date();
    this.saveAttendanceToStorage();

    const checkInTime = this.formatTime(this.attendanceRecords[employeeId].checkIn);
    const checkOutTime = this.formatTime(this.attendanceRecords[employeeId].checkOut);
    const workingHours = this.calculateWorkingHours(
      this.attendanceRecords[employeeId].checkIn,
      this.attendanceRecords[employeeId].checkOut
    );

    // Track activity in dashboard
    try {
      this.dashboardService.trackAttendanceCheckOut(employee.fullName, employeeId, workingHours);
    } catch (error) {
      console.warn('Failed to track attendance activity:', error);
    }

    alert(`${employee.fullName} checked out at ${checkOutTime}. Working hours: ${workingHours}`);
  }

  filterAttendance() {
    // Filter functionality is handled by facade signals
    alert('Filter applied!');
  }

  clearFilters() {
    this.facade.setAttendanceSearchTerm('');
    this.facade.setAttendanceDepartmentFilter('');
    this.facade.setAttendanceStatusFilter('');
    alert('Filters cleared!');
  }

  searchAttendance(term: string) {
    this.facade.setAttendanceSearchTerm(term);
  }

  setDepartmentFilter(dept: string | null) {
    this.facade.setAttendanceDepartmentFilter(dept);
  }

  setStatusFilter(status: string | null) {
    this.facade.setAttendanceStatusFilter(status);
  }

  // Admin method to reset all attendance (for testing or daily reset)
  resetAllAttendance(): void {
    if (confirm('Are you sure you want to reset all attendance records for today?')) {
      this.attendanceRecords = {};
      this.saveAttendanceToStorage();
      alert('All attendance records have been reset for today.');
    }
  }

  // Admin method to reset specific employee attendance
  resetEmployeeAttendance(employeeId: string): void {
    const employee = this.facade.employees().find(emp => emp.id === employeeId);
    if (employee && confirm(`Reset attendance for ${employee.fullName}?`)) {
      this.attendanceRecords[employeeId] = {};
      this.saveAttendanceToStorage();
      alert(`Attendance reset for ${employee.fullName}.`);
    }
  }
}
