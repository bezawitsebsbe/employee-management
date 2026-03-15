import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmployeePersonalData, LeaveRequest } from './employee-personal.model';

@Injectable({ providedIn: 'root' })
export class EmployeePersonalService {
  private mockData: EmployeePersonalData = {
    id: 'EMP001',
    fullName: 'Sarah Smith',
    initials: 'SS',
    avatarColor: '#fadb14',
    department: 'Marketing',
    position: 'Marketing Lead',
    remainingLeaveDays: 18,
    attendanceThisMonth: { present: 19, absent: 2, late: 1 },
    nextPayslipDate: '25 April 2026',
    baseSalary: 5500,
    recentActivities: [
      {
        id: '1',
        type: 'leave',
        message: 'Annual leave request approved',
        date: '2 days ago',
        color: '#22c55e',
      },
      {
        id: '2',
        type: 'payslip',
        message: 'March payslip generated',
        date: '5 days ago',
        color: '#3b82f6',
      },
      {
        id: '3',
        type: 'attendance',
        message: 'Clocked in late on 10 April',
        date: '1 week ago',
        color: '#eab308',
      },
    ],
  };

  getDashboardData(): Observable<EmployeePersonalData> {
    return of(this.mockData);
  }

  getLeaveHistory(): Observable<LeaveRequest[]> {
    return of([
      {
        id: 'L001',
        type: 'Annual',
        startDate: '10/04/2026',
        endDate: '15/04/2026',
        days: 5,
        status: 'Approved',
        reason: 'Family vacation',
      },
      {
        id: 'L002',
        type: 'Sick',
        startDate: '01/03/2026',
        endDate: '02/03/2026',
        days: 2,
        status: 'Approved',
        reason: 'Flu',
      },
    ]);
  }

  submitLeaveRequest(request: Partial<LeaveRequest>): Observable<LeaveRequest> {
    const newRequest: LeaveRequest = {
      id: 'L' + Date.now(),
      type: request.type || 'Annual',
      startDate: request.startDate || '',
      endDate: request.endDate || '',
      days: request.days || 1,
      status: 'Pending',
      reason: request.reason || '',
    };
    return of(newRequest);
  }
}
