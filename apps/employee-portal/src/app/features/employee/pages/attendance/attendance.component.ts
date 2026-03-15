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

  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Payroll', icon: '💰', path: '/payroll' },
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
    { label: 'Leave Request', icon: '📅', path: '/leave' },
  ];

  // Expose facade data to template
  attendanceData = this.facade.filteredAttendance;
  attendanceSummary = this.facade.attendanceSummary;
  loading = this.facade.loading;
  error = this.facade.error;

  constructor() {
    // Attendance data is loaded automatically by facade
  }

  checkIn(employeeId?: string) {
    if (employeeId) {
      // Check in specific employee
      this.facade.checkIn(employeeId);
      const employee = this.facade
        .employees()
        .find((emp) => emp.id === employeeId);
      if (employee) {
        alert(
          `${employee.fullName} checked in at ${new Date().toLocaleTimeString()}`,
        );
      }
    } else {
      // Check in first employee (for main button)
      const firstEmployee = this.facade.employees()[0];
      if (firstEmployee) {
        this.facade.checkIn(firstEmployee.id);
        alert(
          `${firstEmployee.fullName} checked in at ${new Date().toLocaleTimeString()}`,
        );
      }
    }
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

  checkOut(employeeId: string) {
    this.facade.checkOut(employeeId);
    const employee = this.facade
      .employees()
      .find((emp) => emp.id === employeeId);
    if (employee) {
      alert(
        `${employee.fullName} checked out at ${new Date().toLocaleTimeString()}`,
      );
    }
  }
}
