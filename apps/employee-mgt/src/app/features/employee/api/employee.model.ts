// apps/portal/employee-portal/src/app/features/employee/api/employee.model.ts
export interface Employee {
  id: string;
  empId: string; // e.g. EMP001
  fullName: string;
  initials: string; // e.g. JD
  email: string;
  phone?: string;
  department: string;
  position: string;
  joinDate: string; // '15/01/2023'
  status: 'Active' | 'Inactive' | 'On Leave';
  performance?: number; // 0-100
  baseSalary?: number;
  avatarColor?: string; // e.g. '#fadb14' for orange-ish
}

export interface EmployeeAttendance {
  employeeId: string;
  name: string;
  department: string;
  checkin: string;
  checkout: string;
  hours: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
}

export interface EmployeeSummary {
  totalEmployees: number;
  active: number;
  avgPerformance: number;
  totalPayroll: number;
}
