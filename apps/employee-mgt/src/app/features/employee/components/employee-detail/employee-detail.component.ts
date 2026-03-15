import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Employee } from '../../api/employee.model';
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
  styleUrls: ['./employee-detail.component.scss'],
})
export class EmployeeDetailComponent {
  private fb = inject(FormBuilder);
  private facade = inject(EmployeeSimpleFacade);
  isEditing = false;

  selected = this.facade.selectedEmployee;

  detailForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department: [''],
    position: [''],
    joinDate: [''],
    status: ['Active'],
    baseSalary: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    // Auto-patch form when selected employee changes
    effect(() => {
      const emp = this.facade.selectedEmployee();
      if (emp) {
        this.detailForm.patchValue(emp);
      } else {
        this.detailForm.reset();
      }
    });
  }
  cancelEdit() {
    this.isEditing = false;
    const emp = this.selected();
    if (emp) {
      this.detailForm.patchValue(emp); // revert changes
    }
  }

  saveChanges() {
    if (this.detailForm.valid && this.selected()) {
      const current = this.selected()!;
      const formValue = this.detailForm.value;

      const updated: Employee = {
        ...current,
        fullName: formValue.fullName ?? current.fullName,
        email: formValue.email ?? current.email,
        phone: formValue.phone ?? current.phone,
        department: formValue.department ?? current.department,
        position: formValue.position ?? current.position,
        joinDate: formValue.joinDate ?? current.joinDate,
        status: (formValue.status ?? current.status) as
          | 'Active'
          | 'Inactive'
          | 'On Leave',
        baseSalary: formValue.baseSalary ?? current.baseSalary,
      };

      this.facade.updateEmployee(updated); // save to facade/store
      this.facade.selectEmployee(updated); // keep selected
      this.isEditing = false; // exit edit mode
    }
  }

  deleteEmployee() {
    const current = this.selected();
    if (current && confirm(`Delete ${current.fullName}?`)) {
      this.facade.deleteEmployee(current.id);
    }
  }
}
