import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-payroll-stats-card',
  templateUrl: './payroll-statistics-card.component.html',
  styleUrls: ['./payroll-statistics-card.component.scss']
})
export class PayrollStatsCardComponent {
  @Input() stats: any[] = [];
}
