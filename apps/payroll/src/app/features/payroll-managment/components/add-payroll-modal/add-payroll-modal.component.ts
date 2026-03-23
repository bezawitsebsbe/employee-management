import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Mock interfaces since we don't have the exact models
interface PayrollFormData {
  employeeName: string;
  employeeId: string;
  department: string;
  baseSalary: string;
  weeklyBonus: string;
  monthlyBonus: string;
  jobDoneBonus: string;
  deductions: string;
  netSalary: string;
  status: string;
}

interface PayrollRecord {
  employeeName: string;
  employeeId: string;
  department: string;
  baseSalary: number;
  status: string;
}

interface Employee {
  empId: string;
  fullName: string;
  position: string;
  baseSalary?: number;
}

@Component({
  selector: 'app-add-payroll-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payroll-modal.component.html',
  styleUrl: './add-payroll-modal.component.scss'
})
export class AddPayrollModalComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<PayrollFormData>();

  formData: PayrollFormData = {
    employeeName: '',
    employeeId: '',
    department: '',
    baseSalary: '',
    weeklyBonus: '0',
    monthlyBonus: '0',
    jobDoneBonus: '0',
    deductions: '0',
    netSalary: '0',
    status: 'Pending'
  };

  calculatedTax: string = '0.00';
  calculatedPension: string = '0.00';

  existingEmployeeIds: string[] = [];
  employeeIdError = '';
  employeeNameError = '';
  employees: Employee[] = [];

  // Mock data for demonstration
  private mockEmployees: Employee[] = [
    { empId: '001', fullName: 'John Doe', position: 'Software Engineer', baseSalary: 5000 },
    { empId: '002', fullName: 'Jane Smith', position: 'HR Manager', baseSalary: 4500 },
    { empId: '003', fullName: 'Mike Johnson', position: 'Sales Representative', baseSalary: 3500 }
  ];

  ngOnInit(): void {
    this.loadExistingEmployeeIds();
    this.loadEmployees();
  }

  loadExistingEmployeeIds(): void {
    // Mock existing employee IDs
    this.existingEmployeeIds = ['001', '002'];
  }

  loadEmployees(): void {
    // Use mock employees
    this.employees = this.mockEmployees;
  }

  validateEmployeeId(): void {
    const employeeId = this.formData.employeeId.trim();
    
    if (!employeeId) {
      this.employeeIdError = '';
      return;
    }

    if (this.existingEmployeeIds.includes(employeeId)) {
      this.employeeIdError = `Employee ID ${employeeId} already exists`;
      return;
    }

    const employee = this.employees.find(emp => emp.empId === employeeId);
    if (!employee) {
      this.employeeIdError = `Employee ID ${employeeId} is not a valid employee`;
    } else {
      this.employeeIdError = '';
      this.formData.employeeName = employee.fullName;
      this.formData.department = employee.position;
      this.formData.baseSalary = employee.baseSalary ? employee.baseSalary.toString() : '';
      this.formData.netSalary = `$${this.calculateNetSalary()}`;
    }
  }

  positions = [
    'Senior Sales Manager',
    'Marketing Lead',
    'Sales Representative',
    'HR Manager',
    'Finance Analyst',
    'Software Engineer',
    'Project Manager',
    'Business Analyst'
  ];

  calculateNetSalary(): string {
    const base = parseFloat(this.formData.baseSalary) || 0;
    const monthlyBonus = parseFloat(this.formData.monthlyBonus) || 0;
    
    const tax = this.calculateTaxBracket(base);
    this.calculatedTax = tax.toFixed(2);
    
    const pension = base * 0.07;
    this.calculatedPension = pension.toFixed(2);
    
    const totalDeductions = tax + pension;
    this.formData.deductions = totalDeductions.toFixed(2);
    
    const totalIncome = base + monthlyBonus;
    const net = totalIncome - totalDeductions;
    return net >= 0 ? net.toFixed(2) : '0.00';
  }

  calculateTaxBracket(income: number): number {
    if (income <= 600) {
      return income * 0.00;
    } else if (income <= 1650) {
      return income * 0.10;
    } else if (income <= 3200) {
      return income * 0.15;
    } else if (income <= 5250) {
      return income * 0.20;
    } else if (income <= 7800) {
      return income * 0.25;
    } else if (income <= 10900) {
      return income * 0.30;
    } else {
      return income * 0.35;
    }
  }

  onInputChange(): void {
    this.formData.netSalary = `$${this.calculateNetSalary()}`;
    this.validateEmployeeId();
    this.validateEmployeeName();
  }

  onEmployeeIdChange(): void {
    this.validateEmployeeId();
  }

  onEmployeeNameChange(): void {
    this.validateEmployeeName();
  }

  validateEmployeeName(): void {
    const employeeName = this.formData.employeeName.trim();
    
    if (!employeeName) {
      this.employeeNameError = '';
      return;
    }

    const employee = this.employees.find(emp => 
      emp.fullName.toLowerCase() === employeeName.toLowerCase()
    );
    
    if (!employee) {
      this.employeeNameError = `'${employeeName}' is not a registered employee`;
    } else {
      this.employeeNameError = '';
      this.formData.employeeId = employee.empId;
      this.formData.department = employee.position;
      this.formData.baseSalary = employee.baseSalary ? employee.baseSalary.toString() : '';
      this.formData.netSalary = `$${this.calculateNetSalary()}`;
    }
  }

  isEmployeeFound(): boolean {
    return !!(this.formData.employeeId && this.findEmployeeById());
  }

  findEmployeeById(): Employee | undefined {
    return this.employees.find(emp => emp.empId === this.formData.employeeId);
  }

  onClose(): void {
    this.cancel.emit();
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.save.emit({ ...this.formData });
      this.resetForm();
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.formData.employeeName.trim() &&
      this.formData.employeeId.trim() &&
      this.formData.department.trim() &&
      this.formData.baseSalary &&
      !this.employeeIdError &&
      !this.employeeNameError
    );
  }

  private resetForm(): void {
    this.formData = {
      employeeName: '',
      employeeId: '',
      department: '',
      baseSalary: '',
      weeklyBonus: '0',
      monthlyBonus: '0',
      jobDoneBonus: '0',
      deductions: '0',
      netSalary: '0',
      status: 'Pending'
    };
    this.calculatedTax = '0.00';
    this.calculatedPension = '0.00';
    this.employeeIdError = '';
    this.employeeNameError = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  // Method for parent component to show modal
  showModal(): void {
    // This will be handled by the parent component showing/hiding this component
  }
}
