import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { PayrollStatistics } from '../../models/payroll.models';

@Component({
  selector: 'app-payroll-statistics-cards',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzIconModule, NzTypographyModule],
  templateUrl: './payroll-statistics-cards.component.html',
  styleUrls: ['./payroll-statistics-cards.component.scss']
})
export class PayrollStatisticsCardsComponent {
  statistics: PayrollStatistics = {
    totalPayroll: 45231,
    totalPayrollChange: '+12.5%',
    totalBonuses: 3200,
    totalBonusesChange: '+8.2%',
    deductions: 1850,
    deductionsChange: '+5.3%',
    employees: 24,
    employeesChange: '+2'
  };
}
