import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Signal } from '@angular/core';
import { AddPayrollRecordModalComponent } from '../../components/add-payroll-record-modal/add-payroll-record-modal.component';
import { PayrollFormData } from '../../models/payroll.models';
import { PayrollFacadeService } from '../../facades/payroll.facade.service';

@Component({
  selector: 'app-add-payroll',
  standalone: true,
  imports: [
    CommonModule,
    AddPayrollRecordModalComponent
  ],
  templateUrl: './add-payroll.component.html',
  styleUrl: './add-payroll.component.scss'
})
export class AddPayrollComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private readonly payrollFacade: PayrollFacadeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSavePayroll(formData: PayrollFormData): void {
    this.payrollFacade.addPayrollRecord(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/payroll']);
        },
        error: (error) => {
          console.error('Failed to save payroll record:', error);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/payroll']);
  }
}
