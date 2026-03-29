import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzIconModule],
  templateUrl: './attendance-summary.component.html',
  styleUrls: ['./attendance-summary.component.scss']
})
export class AttendanceSummaryComponent {
  @Input() title: string = '';
  @Input() count: number = 0;
  @Input() icon: string = '';
  @Input() color: string = 'blue';
}
