import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Employee } from '../../api/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

export interface AddEmployeeFormData {
  empId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  baseSalary: number;
  performance: number;
}

@Component({
  selector: 'app-add-employee-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzDatePickerModule,
    NzGridModule,
    NzIconModule,
  ],
  templateUrl: './add-employee-modal.component.html',
  styleUrls: ['./add-employee-modal.component.scss'],
})
export class AddEmployeeModalComponent {
  private fb = inject(FormBuilder);
  private facade = inject(EmployeeSimpleFacade);
  
  isVisible = false;

  departments = ['Sales', 'Marketing', 'HR', 'Finance', 'IT', 'Operations'];

  addForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department: ['', [Validators.required]],
    position: [''],
    joinDate: ['', [Validators.required]],
    status: ['Active', [Validators.required]],
    baseSalary: [0, [Validators.required, Validators.min(0)]],
  });

  show(): void {
    this.isVisible = true;
    this.addForm.reset({
      status: 'Active',
      baseSalary: 3800,
    });
  }

  handleCancel(): void {
    this.isVisible = false;
    this.addForm.reset();
  }

  handleOk(): void {
    if (this.addForm.valid) {
      const formData = this.addForm.value;
      const newEmployee: Employee = {
        id: this.generateEmployeeId(),
        empId: this.generateEmployeeId(),
        fullName: formData.fullName!,
        initials: this.getInitials(formData.fullName!),
        email: formData.email!,
        phone: formData.phone || undefined,
        department: formData.department!,
        position: formData.position!,
        joinDate: formData.joinDate!,
        status: formData.status as 'Active' | 'Inactive' | 'On Leave',
        baseSalary: formData.baseSalary!,
        performance: 75, // Default performance
        avatarColor: this.getRandomColor(),
      };

      // Add employee directly
      this.facade.addEmployee(newEmployee);
      this.isVisible = false;
      this.addForm.reset();
    } else {
      Object.values(this.addForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private generateEmployeeId(): string {
    const employees = this.facade.employees();
    const maxId = employees.reduce((max, emp) => {
      const num = parseInt(emp.empId.replace(/\D/g, ''), 10);
      return num > max ? num : max;
    }, 0);
    return `EMP${String(maxId + 1).padStart(3, '0')}`;
  }

  private getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  private getRandomColor(): string {
    const colors = ['#fadb14', '#52c41a', '#1890ff', '#722ed1', '#eb2f96', '#fa541c'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
