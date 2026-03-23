import { Component, inject, computed, signal, ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngxs/store';

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
import { CheckIn, CheckOut } from '../../store/action/attendance.action';

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
  store = inject(Store); // ✅ ADD Store injection
  cdr = inject(ChangeDetectorRef);


  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Payroll', icon: '💰', path: '/payroll', apps: ['payroll'] }, // Only show in payroll app
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
  ];


  // NGXS as single source of truth - use store directly
  // Loading guard signals
  checkingIn = signal(false);
  checkingOut = signal(false);

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

  // NGXS reactive attendance map using RxJS
  attendanceMap$ = this.attendanceData$.pipe(
    map((data: any[]) => {
      const attendanceRecordMap: Record<string, any> = {};

      data.forEach((att) => {
        const existing = attendanceRecordMap[att.employeeId];

        if (!existing) {
          attendanceRecordMap[att.employeeId] = att;
        } else {
          // ✅ Handle multiple records: prefer checked-in over not checked-in
          const existingHasCheckIn = existing.checkin && existing.checkin !== '-';
          const newHasCheckIn = att.checkin && att.checkin !== '-';

          if (newHasCheckIn && !existingHasCheckIn) {
            // New record has check-in, old doesn't - use new
            attendanceRecordMap[att.employeeId] = att;
          } else if (newHasCheckIn && existingHasCheckIn) {
            // Both have check-in - pick latest by checkin time
            const existingTime = new Date(`1970-01-01 ${existing.checkin}`).getTime();
            const newTime = new Date(`1970-01-01 ${att.checkin}`).getTime();

            if (newTime > existingTime) {
              attendanceRecordMap[att.employeeId] = att;
            }
          }
          // If neither has check-in, keep existing (doesn't matter which)
        }
      });

      return attendanceRecordMap;
    })
  );

  // Reactive attendance summary using RxJS
  attendanceSummary$ = this.attendanceData$.pipe(
    map((data: any[]) => {
      console.log('🔍 Attendance Summary Update - Data:', data);
      
      const employees = this.getEmployees();
      console.log('🔍 Employees:', employees);
      
      // Count present and absent based on current attendance state
      let presentCount = 0;
      let absentCount = 0;

      employees.forEach((emp: any) => {
        // Find attendance record for this employee - prioritize checked-in records
        const attendanceRecords = data.filter((a: any) => a.employeeId === emp.id);
        
        // Pick the best record: prefer checked-in over not checked-in
        let attendanceRecord = null;
        if (attendanceRecords.length > 0) {
          // First, try to find a record with actual check-in
          attendanceRecord = attendanceRecords.find((a: any) => a.checkin && a.checkin !== '-');
          
          // If no checked-in record found, use the first available record
          if (!attendanceRecord) {
            attendanceRecord = attendanceRecords[0];
          }
        }
        
        console.log(`👤 Employee ${emp.fullName} (${emp.id}):`, {
          status: emp.status,
          allRecords: attendanceRecords,
          selectedRecord: attendanceRecord,
          checkin: attendanceRecord?.checkin,
          recordsCount: attendanceRecords.length
        });
        
        // Skip inactive employees from attendance counts
        if (emp.status !== 'Active') {
          console.log(`⏸️ Skipping inactive employee: ${emp.fullName}`);
          return;
        }

        // Determine status based on attendance record
        if (!attendanceRecord || !attendanceRecord.checkin || attendanceRecord.checkin === '-') {
          // No check-in = Absent
          absentCount++;
          console.log(`❌ ${emp.fullName} is ABSENT (no check-in)`);
        } else {
          // Has check-in = Present (regardless of checkout status)
          presentCount++;
          console.log(`✅ ${emp.fullName} is PRESENT (has check-in: ${attendanceRecord.checkin})`);
        }
      });

      const total = employees.filter((emp: any) => emp.status === 'Active').length;

      console.log('📊 Attendance Summary Result:', {
        totalEmployees: employees.length,
        activeEmployees: total,
        present: presentCount,
        absent: absentCount,
        attendanceRecords: data.length
      });

      return {
        present: presentCount,
        absent: absentCount,
        total: total
      };
    })
  );

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

    // Status filter - remove for now since we don't have getEmployeeAttendance method
    // const status = this.attendanceStatusFilter();
    // if (status) {
    //   employees = employees.filter((emp: any) => {
    //     const attendance = this.getEmployeeAttendance(emp.id);
    //     return attendance.status === status;
    //   });
    // }

    return employees;
  });



  constructor() {
    // Load employees from Firestore
    this.employeeFacade.loadEmployees();
    // Load attendance data from Firestore
    this.facade.loadAttendanceData();
  }

  ngOnInit() {
    // Subscribe to loading states only
    this.facade.checkingIn$.subscribe(val => this.checkingIn.set(val));
    this.facade.checkingOut$.subscribe(val => this.checkingOut.set(val));
  }

  // Helper method to get current employees synchronously
  private getEmployees(): any[] {
    let employees: any[] = [];
    this.employees$.subscribe(emp => employees = emp || []).unsubscribe();
    return employees;
  }

  // Helper method to get employee attendance
  private getEmployeeAttendance(employeeId: string): any {
    let attendance: any = null;
    this.attendanceMap$.subscribe(map => {
      attendance = map[employeeId] || null;
    }).unsubscribe();
    return attendance;
  }



  checkIn(employeeId: string) {
  const employee = this.getEmployees().find((e: any) => e.id === employeeId);
  if (!employee) return;

  // ✅ Dispatch action and subscribe to success
  this.store.dispatch(new CheckIn({ 
    employeeId, 
    employeeName: employee.fullName, 
    department: employee.department 
  })).subscribe(() => {
    // ✅ AFTER SUCCESS - Track attendance check-in in dashboard
    this.dashboardService.trackAttendanceCheckIn(employee.fullName, employee.id);
  });
}

checkOut(attendanceId: string | null) {
  if (!attendanceId) return;
  
  // Get employee info for tracking
  const employee = this.getEmployees().find((e: any) => {
    const attendance = this.getEmployeeAttendance(e.id);
    return attendance?.id === attendanceId;
  });
  
  if (!employee) return;

  // ✅ Dispatch action and subscribe to success
  this.store.dispatch(new CheckOut(attendanceId)).subscribe((res: any) => {
    // ✅ AFTER SUCCESS - Get updated attendance data
    const updatedAttendance = this.getEmployeeAttendance(employee.id);
    
    // ✅ Track attendance check-out in dashboard
    this.dashboardService.trackAttendanceCheckOut(
      employee.fullName, 
      employee.id, 
      updatedAttendance?.hours || '0h 0m'
    );
  });
}

  private formatTime(date: string | null, propName: string = 'checkin'): string {
    if (!date) return '-';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '-'; // prevents Invalid Date

    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  private calculateWorkingHours(checkin: string, checkout: string): string {
    if (!checkin || !checkout) return '0h 0m';

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffMs = checkoutDate.getTime() - checkinDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  }

  // Filter and clear methods
  filterAttendance() {
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
      // Simple attendance record since we don't have getEmployeeAttendance method
      checkIn: '-',
      checkOut: '-',
      workingHours: '0h 0m',
      status: 'Absent'
    }));

    console.log('Exporting attendance data:', attendanceData);
    alert('Attendance data exported to console');
  }

  resetAllAttendance() {
    if (confirm('Are you sure you want to reset all attendance records for today?')) {
      this.facade.resetAttendance();
      
      // ✅ Track attendance reset in dashboard
      this.dashboardService.trackSystemAction(
        'Attendance Reset', 
        'All attendance records have been reset for today'
      );
      
      // Force UI update to show check-in buttons immediately
      this.cdr.detectChanges();
      alert('All attendance records have been reset. Employees can now check in.');
    }
  }
}
