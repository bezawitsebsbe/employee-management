export interface PayrollStatistics {
  totalPayroll: string;
  totalBonuses: string;
  deductions: string;
  employees: number;
}

export interface PayrollRecord {
  department: string;
  baseSalary: string;
  leaveBonus: string;
  weeklyBonus: string;
  monthlyBonus: string;
  otherBonuses: string;
  deductions: string;
  netSalary: string;
  status: 'Paid' | 'Processed' | 'Pending';
}

export interface PayrollFormData {
  employeeName: string;
  employeeId: string;
  department: string;
  baseSalary: string;
  weeklyBonus: string;
  monthlyBonus: string;
  jobDoneBonus: string;
  deductions: string;
  netSalary: string;
  status: 'Paid' | 'Processed' | 'Pending';
}

export interface PayrollData {
  statistics: PayrollStatistics;
  records: PayrollRecord[];
}
