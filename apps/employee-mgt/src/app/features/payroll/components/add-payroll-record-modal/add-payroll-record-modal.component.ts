import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollFormData, PayrollRecord } from '../../models/payroll.models';
import { PayrollFacadeService } from '../../facades/payroll.facade.service';
import { EmployeeService } from '../../../employee/api/employee.service';
import { Employee } from '../../../employee/api/employee.model';

@Component({
  selector: 'app-add-payroll-record-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payroll-record-modal.component.html',
  styleUrl: './add-payroll-record-modal.component.scss'
})
export class AddPayrollRecordModalComponent implements OnInit {
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
    status: 'Pending' // Set to Pending by default
  };

  calculatedTax: string = '0.00';
  calculatedPension: string = '0.00';

  existingEmployeeIds: string[] = [];
  employeeIdError = '';
  employeeNameError = '';
  employees: Employee[] = [];

  constructor(private readonly payrollFacade: PayrollFacadeService, private readonly employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadExistingEmployeeIds();
    this.loadEmployees();
  }

  loadExistingEmployeeIds(): void {
    const records = this.payrollFacade.records$(); // Use () to get signal value
    this.existingEmployeeIds = records.map((record: PayrollRecord) => { // Add type annotation
      // Extract employee ID from department field (e.g., "001 Sales" -> "001")
      const match = record.department.match(/^(\d+)/);
      return match ? match[1] : '';
    }).filter((id: string) => id !== ''); // Add type annotation
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
    });
  }

  validateEmployeeId(): void {
    const employeeId = this.formData.employeeId.trim();
    
    if (!employeeId) {
      this.employeeIdError = '';
      return;
    }

    // Check if employee ID already exists in payroll records
    if (this.existingEmployeeIds.includes(employeeId)) {
      this.employeeIdError = `Employee ID ${employeeId} already exists`;
      return;
    }

    // Check if employee ID exists in employee records
    const employee = this.employees.find(emp => emp.empId === employeeId);
    if (!employee) {
      this.employeeIdError = `Employee ID ${employeeId} is not a valid employee`;
    } else {
      this.employeeIdError = '';
      // Auto-fill employee information from employee record
      this.formData.employeeName = employee.fullName;
      this.formData.department = employee.position; // Changed from department to position
      this.formData.baseSalary = employee.baseSalary ? employee.baseSalary.toString() : '';
      
      // Trigger net salary calculation with the new base salary
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
    
    // Calculate tax based on income brackets
    const totalIncome = base + monthlyBonus;
    const tax = this.calculateTaxBracket(totalIncome);
    this.calculatedTax = tax.toFixed(2);
    
    // Calculate pension (7% of basic salary)
    const pension = base * 0.07;
    this.calculatedPension = pension.toFixed(2);
    
    // Total deductions = tax + pension
    const totalDeductions = tax + pension;
    this.formData.deductions = totalDeductions.toFixed(2);
    
    const net = totalIncome - totalDeductions;
    return net >= 0 ? net.toFixed(2) : '0.00';
  }

  calculateTaxBracket(income: number): number {
    // Ethiopian Birr (ETB) tax brackets
    if (income <= 600) {
      return income * 0.00; // 0% for income up to 600 ETB
    } else if (income <= 1650) {
      return income * 0.10; // 10% for income between 601 - 1,650 ETB
    } else if (income <= 3200) {
      return income * 0.15; // 15% for income between 1,651 - 3,200 ETB
    } else if (income <= 5250) {
      return income * 0.20; // 20% for income between 3,201 - 5,250 ETB
    } else if (income <= 7800) {
      return income * 0.25; // 25% for income between 5,251 - 7,800 ETB
    } else if (income <= 10900) {
      return income * 0.30; // 30% for income between 7,801 - 10,900 ETB
    } else {
      return income * 0.35; // 35% for income above 10,900 ETB
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

    // Check if the name matches any employee in the system
    const employee = this.employees.find(emp => 
      emp.fullName.toLowerCase() === employeeName.toLowerCase()
    );
    
    if (!employee) {
      this.employeeNameError = `'${employeeName}' is not a registered employee`;
    } else {
      this.employeeNameError = '';
      // Auto-fill employee information from employee record
      this.formData.employeeId = employee.empId;
      this.formData.department = employee.position; // Changed from department to position
      this.formData.baseSalary = employee.baseSalary ? employee.baseSalary.toString() : '';
      
      // Trigger net salary calculation with the new base salary
      this.formData.netSalary = `$${this.calculateNetSalary()}`;
    }
  }

  // Helper methods for template
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
      !this.employeeIdError && // Ensure no employee ID validation errors
      !this.employeeNameError // Ensure no employee name validation errors
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
      status: 'Pending' // Reset to Pending
    };
    this.calculatedTax = '0.00';
    this.calculatedPension = '0.00';
    this.employeeIdError = ''; // Clear validation error
    this.employeeNameError = ''; // Clear validation error
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
