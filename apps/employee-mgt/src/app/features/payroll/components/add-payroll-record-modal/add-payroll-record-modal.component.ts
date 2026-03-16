import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollFormData, PayrollRecord } from '../../models/payroll.models';
import { PayrollFacadeService } from '../../facades/payroll.facade.service';

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
    status: 'Processed' // Default status
  };

  existingEmployeeIds: string[] = [];
  employeeIdError = '';

  constructor(private readonly payrollFacade: PayrollFacadeService) {}

  ngOnInit(): void {
    this.loadExistingEmployeeIds();
  }

  loadExistingEmployeeIds(): void {
    const records = this.payrollFacade.records$(); // Use () to get signal value
    this.existingEmployeeIds = records.map((record: PayrollRecord) => { // Add type annotation
      // Extract employee ID from department field (e.g., "001 Sales" -> "001")
      const match = record.department.match(/^(\d+)/);
      return match ? match[1] : '';
    }).filter((id: string) => id !== ''); // Add type annotation
  }

  validateEmployeeId(): void {
    const employeeId = this.formData.employeeId.trim();
    
    if (!employeeId) {
      this.employeeIdError = '';
      return;
    }

    if (this.existingEmployeeIds.includes(employeeId)) {
      this.employeeIdError = `Employee ID ${employeeId} already exists`;
    } else {
      this.employeeIdError = '';
    }
  }

  departments = [
    'Sales',
    'Marketing',
    'Engineering',
    'HR',
    'Finance',
    'Operations'
  ];

  calculateNetSalary(): string {
    const base = parseFloat(this.formData.baseSalary) || 0;
    const weeklyBonus = parseFloat(this.formData.weeklyBonus) || 0;
    const monthlyBonus = parseFloat(this.formData.monthlyBonus) || 0;
    const jobDoneBonus = parseFloat(this.formData.jobDoneBonus) || 0;
    const deductions = parseFloat(this.formData.deductions) || 0;
    
    const totalBonuses = weeklyBonus + monthlyBonus + jobDoneBonus;
    const net = base + totalBonuses - deductions;
    return net >= 0 ? net.toFixed(2) : '0.00';
  }

  onInputChange(): void {
    this.formData.netSalary = `$${this.calculateNetSalary()}`;
    this.validateEmployeeId();
  }

  onEmployeeIdChange(): void {
    this.validateEmployeeId();
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
      !this.employeeIdError // Ensure no employee ID validation errors
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
      status: 'Processed' // Reset to default status
    };
    this.employeeIdError = ''; // Clear validation error
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
