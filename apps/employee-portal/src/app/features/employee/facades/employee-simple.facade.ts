// apps/portal/employee-portal/src/app/features/employee/facades/employee-simple.facade.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Employee,
  EmployeeSummary,
  EmployeeAttendance,
} from '../api/employee.model';
import { EmployeeService } from '../api/employee.service';

@Injectable({ providedIn: 'root' })
export class EmployeeSimpleFacade {
  private service = inject(EmployeeService);

  // Signals
  employees = signal<Employee[]>([]);
  selectedEmployee = signal<Employee | null>(null);
  searchTerm = signal('');
  departmentFilter = signal<string | null>(null);
  statusFilter = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Attendance signals
  attendanceData = signal<EmployeeAttendance[]>([]);
  attendanceSummary = signal<{
    present: number;
    absent: number;
    late: number;
    onLeave: number;
  }>({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
  });
  attendanceSearchTerm = signal('');
  attendanceDepartmentFilter = signal<string | null>(null);
  attendanceStatusFilter = signal<string | null>(null);

  // Computed signals
  filteredEmployees = computed(() => {
    let filtered = this.employees();

    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(search) ||
          emp.empId.toLowerCase().includes(search) ||
          emp.department.toLowerCase().includes(search),
      );
    }

    // Apply department filter
    const dept = this.departmentFilter();
    if (dept) {
      filtered = filtered.filter((emp) => emp.department === dept);
    }

    // Apply status filter
    const status = this.statusFilter();
    if (status) {
      filtered = filtered.filter((emp) => emp.status === status);
    }

    return filtered;
  });

  summary = computed<EmployeeSummary>(() => {
    const emps = this.employees();
    const active = emps.filter((e) => e.status === 'Active').length;
    const avgPerf =
      emps.reduce((sum, e) => sum + (e.performance || 0), 0) /
      (emps.length || 1);
    const totalPay = emps.reduce((sum, e) => sum + (e.baseSalary || 0), 0);

    return {
      totalEmployees: emps.length,
      active,
      avgPerformance: Math.round(avgPerf),
      totalPayroll: totalPay,
    };
  });

  filteredAttendance = computed(() => {
    let filtered = this.attendanceData();

    // Apply search filter
    const search = this.attendanceSearchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (record) =>
          record.name.toLowerCase().includes(search) ||
          record.department.toLowerCase().includes(search),
      );
    }

    // Apply department filter
    const dept = this.attendanceDepartmentFilter();
    if (dept) {
      filtered = filtered.filter((record) => record.department === dept);
    }

    // Apply status filter
    const status = this.attendanceStatusFilter();
    if (status) {
      filtered = filtered.filter((record) => record.status === status);
    }

    return filtered;
  });

  constructor() {
    this.loadEmployees();
    this.loadAttendanceData();
  }

  loadEmployees() {
    this.loading.set(true);
    this.error.set(null);

    this.service.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load employees');
        this.loading.set(false);
      },
    });
  }

  loadAttendanceData() {
    this.service.getAttendanceData().subscribe({
      next: (attendanceData) => {
        this.attendanceData.set(attendanceData);
      },
      error: (err) => {
        this.error.set('Failed to load attendance data');
      },
    });

    this.service.getAttendanceSummary().subscribe({
      next: (summary) => {
        this.attendanceSummary.set(summary);
      },
      error: (err) => {
        this.error.set('Failed to load attendance summary');
      },
    });
  }

  selectEmployee(emp: Employee | null) {
    this.selectedEmployee.set(emp);
  }

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }

  setDepartmentFilter(department: string | null) {
    this.departmentFilter.set(department);
  }

  setStatusFilter(status: string | null) {
    this.statusFilter.set(status);
  }

  updateEmployee(updated: Employee) {
    const current = this.employees();
    const index = current.findIndex((emp) => emp.id === updated.id);
    if (index !== -1) {
      const updatedList = [...current];
      updatedList[index] = updated;
      this.employees.set(updatedList);

      // Update selected if it's the same employee
      if (this.selectedEmployee()?.id === updated.id) {
        this.selectedEmployee.set(updated);
      }
    }
  }

  deleteEmployee(id: string) {
    const current = this.employees();
    const filtered = current.filter((emp) => emp.id !== id);
    this.employees.set(filtered);

    // Clear selected if it was the deleted employee
    if (this.selectedEmployee()?.id === id) {
      this.selectedEmployee.set(null);
    }
  }

  addEmployee(newEmployee: Employee) {
    const current = this.employees();
    this.employees.set([...current, newEmployee]);
  }

  // Attendance methods
  setAttendanceSearchTerm(term: string) {
    this.attendanceSearchTerm.set(term);
  }

  setAttendanceDepartmentFilter(department: string | null) {
    this.attendanceDepartmentFilter.set(department);
  }

  setAttendanceStatusFilter(status: string | null) {
    this.attendanceStatusFilter.set(status);
  }

  checkIn(employeeId: string) {
    const now = new Date();
    const checkInTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Update attendance record
    const current = this.attendanceData();
    const existingRecord = current.find(
      (record) => record.employeeId === employeeId,
    );

    if (existingRecord) {
      // Update existing record
      const updatedData = current.map((record) =>
        record.employeeId === employeeId
          ? { ...record, checkin: checkInTime, status: 'Present' as const }
          : record,
      );
      this.attendanceData.set(updatedData);
    } else {
      // Create new record
      const employee = this.employees().find((emp) => emp.id === employeeId);
      if (employee) {
        const newRecord: EmployeeAttendance = {
          employeeId,
          name: employee.fullName,
          department: employee.department,
          checkin: checkInTime,
          checkout: '-',
          hours: '-',
          status: 'Present',
        };
        this.attendanceData.set([...current, newRecord]);
      }
    }

    // Update summary
    this.updateAttendanceSummary();
  }

  checkOut(employeeId: string) {
    const now = new Date();
    const checkOutTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Update attendance record
    const current = this.attendanceData();
    const updatedData = current.map((record) => {
      if (record.employeeId === employeeId && record.checkin !== '-') {
        const checkIn = new Date(`1970-01-01 ${record.checkin}`);
        const checkOut = new Date(`1970-01-01 ${checkOutTime}`);
        const hours = Math.floor(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60),
        );
        const hoursStr = `${Math.floor(hours / 60)}h ${hours % 60}m`;

        return {
          ...record,
          checkout: checkOutTime,
          hours: hoursStr,
        };
      }
      return record;
    });

    this.attendanceData.set(updatedData);
    this.updateAttendanceSummary();
  }

  private updateAttendanceSummary() {
    const data = this.attendanceData();
    const summary = data.reduce(
      (acc, record) => {
        switch (record.status) {
          case 'Present':
            acc.present++;
            break;
          case 'Absent':
            acc.absent++;
            break;
          case 'Late':
            acc.late++;
            break;
          case 'On Leave':
            acc.onLeave++;
            break;
        }
        return acc;
      },
      { present: 0, absent: 0, late: 0, onLeave: 0 },
    );
    this.attendanceSummary.set(summary);
  }
}
