import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';

import {
  EntityColumn,
  EntityAction,
  EntityConfig
} from '../../models/entity-model';

export interface EntityFormMode {
  mode: 'create' | 'edit' | 'view';
  title: string;
}

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCheckboxModule,
    NzIconModule,
    NzModalModule
  ],
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss']
})
export class EntityFormComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() data: Record<string, unknown> = {};
  @Input() fields: EntityColumn[] = [];
  @Input() mode: EntityFormMode = { mode: 'create', title: 'Create Entity' };
  @Input() config: EntityConfig = {};

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submit = new EventEmitter<Record<string, unknown>>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('formElement') formElement: any;

  entityForm!: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const formGroup: Record<string, any> = {};

    this.fields.forEach(field => {
      const validators = this.getValidators(field);
      const defaultValue = this.getDefaultValue(field);

      if (field.type === 'select' && field.options) {
        formGroup[field.key] = this.fb.control(defaultValue, validators);
      } else if (field.type === 'boolean') {
        formGroup[field.key] = this.fb.control(defaultValue, validators);
      } else if (field.type === 'date') {
        formGroup[field.key] = this.fb.control(defaultValue, validators);
      } else {
        formGroup[field.key] = this.fb.control(defaultValue, validators);
      }
    });

    this.entityForm = this.fb.group(formGroup);

    // Patch form with existing data for edit mode
    if (this.mode.mode === 'edit' && Object.keys(this.data).length > 0) {
      this.patchFormData();
    }
  }

  private getValidators(field: EntityColumn): any[] {
    const validators: any[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.type === 'email') {
      validators.push(Validators.email);
    }

    if (field.type === 'text' && field.key.toLowerCase().includes('email')) {
      validators.push(Validators.email);
    }

    return validators;
  }

  private getDefaultValue(field: EntityColumn): unknown {
    if (this.mode.mode === 'edit' && this.data[field.key] !== undefined) {
      return this.data[field.key];
    }

    switch (field.type) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'date':
        return null;
      case 'select':
        return field.options && field.options.length > 0 ? field.options[0] : null;
      default:
        return '';
    }
  }

  private patchFormData(): void {
    const patchData: Record<string, unknown> = {};

    this.fields.forEach(field => {
      if (this.data[field.key] !== undefined) {
        patchData[field.key] = this.data[field.key];
      }
    });

    this.entityForm.patchValue(patchData);
  }

  onSubmit(): void {
    if (this.entityForm.invalid) {
      this.markFormAsTouched();
      this.message.error('Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;
    const formData = this.entityForm.value;

    this.submit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  private markFormAsTouched(): void {
    Object.keys(this.entityForm.controls).forEach(key => {
      this.entityForm.get(key)?.markAsTouched();
    });
  }

  // Form field helpers
  getFieldType(field: EntityColumn): string {
    return field.type || 'text';
  }

  getFieldPlaceholder(field: EntityColumn): string {
    return field.placeholder || `Enter ${field.name}`;
  }

  getFieldOptions(field: EntityColumn): string[] {
    return field.options || [];
  }

  isFieldRequired(field: EntityColumn): boolean {
    return field.required || false;
  }

  // Form validation helpers
  hasError(field: EntityColumn, errorType: string): boolean {
    const formControl = this.entityForm.get(field.key);
    return formControl?.hasError(errorType) && formControl?.touched || false;
  }

  getErrorMessage(field: EntityColumn): string {
    const formControl = this.entityForm.get(field.key);

    if (!formControl || !formControl.errors || !formControl.touched) {
      return '';
    }

    const errors = formControl.errors;

    if (errors['required']) {
      return `${field.name} is required`;
    }

    if (errors['email']) {
      return `${field.name} must be a valid email`;
    }

    if (errors['min']) {
      return `${field.name} must be at least ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `${field.name} must be at most ${errors['max'].max}`;
    }

    return 'Invalid value';
  }

  // Modal helpers
  handleCancel(): void {
    this.onCancel();
  }

  handleOk(): void {
    this.onSubmit();
  }

  // Reset form
  resetForm(): void {
    this.entityForm.reset();
    this.initializeForm();
  }

  // Get form value for specific field
  getFieldValue(field: EntityColumn): unknown {
    return this.entityForm.get(field.key)?.value;
  }

  // Check if form is dirty
  isFormDirty(): boolean {
    return this.entityForm.dirty;
  }

  // Check if form is valid
  isFormValid(): boolean {
    return this.entityForm.valid;
  }
}
