export interface EmployeePersonalData {
  id: string;
  fullName: string;
  initials: string;
  avatarColor: string;
  department: string;
  position: string;
  remainingLeaveDays: number;
  attendanceThisMonth: { present: number; absent: number; late: number };
  nextPayslipDate: string;
  baseSalary: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'leave' | 'payslip' | 'attendance';
  message: string;
  date: string;
  color: string;
}

export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}
