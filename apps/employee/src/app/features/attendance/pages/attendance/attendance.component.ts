import { Component, inject, computed, signal } from '@angular/core';
import { of } from 'rxjs';

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

import { AttendanceFacadeService } from '../../facades/attendance.facade.service';
import { EmployeeSimpleFacade } from '../../../employee/facades/employee-simple.facade';

import { EmployeeAttendance } from '../../models/attendance.model';

import { DashboardFacadeService } from '@employee-payroll/features';



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

  providers: [
    AttendanceFacadeService
  ],

})

export class AttendanceComponent {

  facade = inject(AttendanceFacadeService);
  dashboardService: DashboardFacadeService = inject(DashboardFacadeService);
  employeeFacade = inject(EmployeeSimpleFacade);


  sidebarItems = [

    { label: 'Dashboard', icon: '', path: '/dashboard' },
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },

    { label: 'Employee', icon: '👥', path: '/employees' },

    { label: 'Payroll', icon: '💰', path: '/payroll' },

    { label: 'Attendance', icon: '🕒', path: '/attendance' },

  ];



  // Store attendance records as signal for reactivity
  private attendanceRecords = signal<Record<string, { checkIn?: Date; checkOut?: Date; }>>({});

  // Expose facade data to template
  attendanceData$ = this.facade.attendanceData$;
  loading$ = this.facade.attendanceDataLoading$;
  error$ = of(null); // Attendance facade doesn't have error property

  // Local state for filters
  attendanceSearchTerm = signal('');
  attendanceDepartmentFilter = signal<string | null>(null);
  attendanceStatusFilter = signal<string | null>(null);

  // Real employee data from Firestore
  employees$ = this.employeeFacade.employees$;
  employeesLoading$ = this.employeeFacade.employeesLoading$;

  attendanceSummary = computed(() => {
    const employees = this.getEmployees();
    let present = 0;
    let absent = 0;
    let total = employees.length;

    employees.forEach((emp: any) => {
      const attendance = this.getEmployeeAttendance(emp.id);
      switch (attendance.status) {
        case 'Present':
          present++;
          break;
        case 'Absent':
          absent++;
          break;
      }
    });

    return { present, absent, total };
  });

  // Expose filtered employees for table
  filteredEmployees = computed(() => {
    let employees = this.getEmployees();
    
    // Search filter
    const searchTerm = this.attendanceSearchTerm().toLowerCase();
    if (searchTerm) {
      employees = employees.filter((emp: any) =>
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.empId.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm)
      );
    }

    // Department filter
    const dept = this.attendanceDepartmentFilter();
    if (dept) {
      employees = employees.filter((emp: any) => emp.department === dept);
    }

    // Status filter
    const status = this.attendanceStatusFilter();
    if (status) {
      employees = employees.filter((emp: any) => {
        const attendance = this.getEmployeeAttendance(emp.id);
        return attendance.status === status;
      });
    }

    return employees;
  });



  constructor() {
    // Load employees from Firestore
    this.employeeFacade.loadEmployees();
    // Load attendance data from Firestore
    this.facade.loadAttendanceData();
    // Load existing attendance from localStorage for backward compatibility
    this.loadAttendanceFromStorage();
  }

  // Helper method to get current employees synchronously
  private getEmployees(): any[] {
    let employees: any[] = [];
    this.employees$.subscribe(emp => employees = emp || []).unsubscribe();
    return employees;
  }

  // Helper method to get attendance data from Firestore
  private getAttendanceData(): any[] {
    let attendanceData: any[] = [];
    try {
      this.facade.attendanceData$.subscribe(data => attendanceData = data || []).unsubscribe();
    } catch (error) {
      console.error('Error accessing attendance data:', error);
      attendanceData = [];
    }
    return attendanceData;
  }



  private loadAttendanceFromStorage(): void {
    try {
      const stored = localStorage.getItem('attendanceRecords');
      if (stored) {
        const parsedRecords = JSON.parse(stored);
        this.attendanceRecords.set(parsedRecords);
        // Auto-reset for new day
        this.resetForNewDay();
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  }



  private resetForNewDay(): void {
    const today = new Date().toDateString();
    
    const currentRecords = this.attendanceRecords();
    const updatedRecords = { ...currentRecords };
    
    Object.keys(updatedRecords).forEach(employeeId => {
      const record = updatedRecords[employeeId];
      
      // If there's a check-in from a previous day, reset it
      if (record.checkIn) {
        const checkInDate = new Date(record.checkIn);
        if (checkInDate.toDateString() !== today) {
          // Reset for new day
          updatedRecords[employeeId] = {};
        }
      }
      
      // Also reset if there's a check-out from previous day
      if (record.checkOut) {
        const checkOutDate = new Date(record.checkOut);
        if (checkOutDate.toDateString() !== today) {
          // Reset for new day
          updatedRecords[employeeId] = {};
        }
      }
    });
    
    // Update the signal with the reset data
    this.attendanceRecords.set(updatedRecords);
    this.saveAttendanceToStorage();
  }



  private saveAttendanceToStorage(): void {
    try {
      localStorage.setItem('attendanceRecords', JSON.stringify(this.attendanceRecords()));
    } catch (error) {
      console.error('Error saving attendance records:', error);
    }
  }



  getEmployeeAttendance(employeeId: string): { checkIn?: string; checkOut?: string; workingHours?: string; status: string } {
    const attendanceData = this.getAttendanceData();
    const today = new Date().toDateString();
    
    // Find today's attendance record for this employee
    const todayRecord = attendanceData.find(record => {
      const recordDate = new Date(record.createdAt || '').toDateString();
      return record.employeeId === employeeId && recordDate === today;
    });

    if (todayRecord) {
      return {
        checkIn: todayRecord.checkin || '-',
        checkOut: todayRecord.checkout || '-',
        workingHours: todayRecord.hours || '0h 0m',
        status: todayRecord.status || 'Present'
      };
    }

    // Fallback to localStorage for backward compatibility
    const records = this.attendanceRecords();
    const record = records[employeeId] || {};
    
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
    const targetEmployeeId = employeeId || this.getEmployees()[0]?.id;
    if (!targetEmployeeId) return;

    const employee = this.getEmployees().find((emp: any) => emp.id === targetEmployeeId);
    if (!employee) return;

    // Use the attendance facade to check in (this will save to Firestore)
    this.facade.checkIn(targetEmployeeId, employee.fullName, employee.department || 'Unknown');
    
    // Track activity in dashboard
    this.dashboardService.trackAttendanceCheckIn(employee.fullName, employee.id);
  }

  checkOut(employeeId: string) {
    const employee = this.getEmployees().find((emp: any) => emp.id === employeeId);
    if (!employee) return;

    // Find today's attendance record for this employee
    let attendanceRecordId: string | undefined;
    this.facade.attendanceByEmployeeId$.subscribe(records => {
      const today = new Date().toDateString();
      const todayRecord = records.find(record => {
        const recordDate = new Date(record.createdAt || '').toDateString();
        return record.employeeId === employeeId && recordDate === today;
      });
      attendanceRecordId = todayRecord?.id;
    }).unsubscribe();

    if (attendanceRecordId) {
      // Use the attendance facade to check out (this will save to Firestore)
      this.facade.checkOut(attendanceRecordId);
    } else {
      alert(`${employee.fullName} has no check-in record for today!`);
    }
  }



  // Filter and clear methods
  filterAttendance() {
    // The filtering is already reactive through computed properties
    // This method can be used to trigger any additional logic
    console.log('Filters applied:', {
      search: this.attendanceSearchTerm(),
      department: this.attendanceDepartmentFilter(),
      status: this.attendanceStatusFilter()
    });
  }

  clearFilters() {
    this.attendanceSearchTerm.set('');
    this.attendanceDepartmentFilter.set(null);
    this.attendanceStatusFilter.set(null);
  }

  searchAttendance(term: string) {
    this.attendanceSearchTerm.set(term);
  }

  filterByDepartment(dept: string) {
    this.attendanceDepartmentFilter.set(dept);
  }

  filterByStatus(status: string) {
    this.attendanceStatusFilter.set(status);
  }

  exportAttendance() {
    const employees = this.getEmployees();
    const attendanceData = employees.map((emp: any) => ({
      employee: emp.fullName,
      employeeId: emp.empId || emp.id,
      department: emp.department,
      ...this.getEmployeeAttendance(emp.id)
    }));

    console.log('Exporting attendance data:', attendanceData);
    alert('Attendance data exported to console');
  }

// Admin method to reset all attendance (for testing or daily reset)
  resetAllAttendance(): void {
    if (confirm('Are you sure you want to reset all attendance records for today?')) {
      this.attendanceRecords.set({});
      this.saveAttendanceToStorage();
      alert('All attendance records have been reset for today.');
    }
  }

  // Admin method to reset specific employee attendance
  resetEmployeeAttendance(employeeId: string): void {
    const employee = this.getEmployees().find((emp: any) => emp.id === employeeId);
    if (employee && confirm(`Reset attendance for ${employee.fullName}?`)) {
      const currentRecords = this.attendanceRecords();
      const updatedRecords = { ...currentRecords };
      updatedRecords[employeeId] = {};
      this.attendanceRecords.set(updatedRecords);
      this.saveAttendanceToStorage();
      alert(`Attendance reset for ${employee.fullName}.`);
    }
  }
}
