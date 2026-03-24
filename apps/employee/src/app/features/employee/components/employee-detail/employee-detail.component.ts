import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
  ],
  templateUrl: './employee-detail.component.html',
})
export class EmployeeDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private facade = inject(EmployeeSimpleFacade);

  employee: Employee | null = null; 
  isEditing = false;

  detailForm = this.fb.group({
    fullName: ['', [
      RxwebValidators.required(),
      RxwebValidators.minLength({ value: 2 }),
      RxwebValidators.maxLength({ value: 50 })
    ]],
    email: ['', [
      RxwebValidators.required(),
      RxwebValidators.email()
    ]],
    phone: ['', [
      RxwebValidators.pattern({
        expression: { phone: /^[+]?[\d\s\-\(\)]+$/ },
        message: 'Invalid phone number format'
      })
    ]],
    department: ['', [
      RxwebValidators.maxLength({ value: 50 })
    ]],
    position: ['', [
      RxwebValidators.maxLength({ value: 100 })
    ]],
    joinDate: ['', [
      RxwebValidators.required()
    ]],
    status: ['Active', [
      RxwebValidators.required()
    ]],
    baseSalary: [0, [
      RxwebValidators.minNumber({ value: 0 }),
      RxwebValidators.maxNumber({ value: 1000000 })
    ]]
  });

  ngOnInit(): void {
    this.facade.selectedEmployee$.subscribe((emp) => {
      this.employee = emp;
      if (emp) this.detailForm.patchValue(emp);
    });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.employee) {
      this.detailForm.patchValue(this.employee);
    }
  }

  saveChanges(): void {
    if (this.detailForm.valid && this.employee && this.employee.id) {
      const { id, ...data } = {
        ...this.employee,
        ...this.detailForm.value,
      };
      this.facade.updateEmployee(id!, data);
      this.isEditing = false;
    }
  }

  deleteEmployee(): void {
    if (!this.employee || !this.employee.id) return;
    const confirmDelete = confirm('Are you sure you want to delete this employee?');
    if (confirmDelete) {
      this.facade.deleteEmployee(this.employee.id);
    }
  }
}