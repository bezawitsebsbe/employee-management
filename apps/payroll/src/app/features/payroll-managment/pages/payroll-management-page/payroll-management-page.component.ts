import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { PayrollStatisticsCardsComponent } from '../../components/payroll-statistics-cards/payroll-statistics-cards.component';
import { PayrollTableComponent } from '../../components/payroll-table/payroll-table.component';
import { AddPayrollModalComponent } from '../../components/add-payroll-modal/add-payroll-modal.component';
import { PayrollRecord } from '../../models/payroll.models';

@Component({
  selector: 'app-payroll-management-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzTypographyModule,
    PayrollStatisticsCardsComponent,
    PayrollTableComponent,
    AddPayrollModalComponent
  ],
  templateUrl: './payroll-management-page.component.html',
  styleUrls: ['./payroll-management-page.component.scss']
})
export class PayrollManagementPageComponent {
  @ViewChild(AddPayrollModalComponent) addPayrollModal!: AddPayrollModalComponent;
  
  searchTerm: string = '';
  selectedDepartment: string = 'all';
  isModalVisible: boolean = false;

  onExport(): void {
    console.log('Export clicked');
  }

  onAddPayroll(): void {
    this.isModalVisible = true;
  }

  onModalCancel(): void {
    this.isModalVisible = false;
  }

  onModalSave(formData: any): void {
    console.log('Saving payroll data:', formData);
    // Here you would typically save the data to your backend
    this.isModalVisible = false;
  }

  onEditRecord(record: PayrollRecord): void {
    console.log('Edit record:', record);
  }

  onDeleteRecord(record: PayrollRecord): void {
    console.log('Delete record:', record);
  }
}
