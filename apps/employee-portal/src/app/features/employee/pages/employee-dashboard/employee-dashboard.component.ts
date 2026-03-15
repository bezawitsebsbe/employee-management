import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { EmployeePersonalService } from '../../api/employee-personal.service';
import { EmployeePersonalData } from '../../api/employee-personal.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzIconModule,
    NzButtonModule,
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss'],
})
export class EmployeeDashboardComponent {
  private service = inject(EmployeePersonalService);

  data = signal<EmployeePersonalData | null>(null);

  constructor() {
    this.service.getDashboardData().subscribe((res) => this.data.set(res));
  }
}
