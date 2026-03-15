import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payroll-statistics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payroll-statistics-card.component.html',
  styleUrl: './payroll-statistics-card.component.scss'
})
export class PayrollStatisticsCardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() icon?: string;
  @Input() trend?: 'up' | 'down' | 'neutral';
  @Input() change?: string;

  getCardClass(): string {
    const baseClass = 'payroll-statistics-card';
    const typeClass = this.getTypeClass();
    return `${baseClass} ${typeClass}`;
  }

  private getTypeClass(): string {
    switch (this.title?.toLowerCase()) {
      case 'total payroll':
        return 'card-primary';
      case 'total bonuses':
        return 'card-success';
      case 'deductions':
        return 'card-warning';
      case 'employees':
        return 'card-info';
      default:
        return 'card-default';
    }
  }

  getIcon(): string {
    if (this.icon) return this.icon;
    
    switch (this.title?.toLowerCase()) {
      case 'total payroll':
        return '💰';
      case 'total bonuses':
        return '🎁';
      case 'deductions':
        return '📉';
      case 'employees':
        return '👥';
      default:
        return '📊';
    }
  }

  getTrend(): string {
    switch (this.trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'neutral':
        return '→';
      default:
        return '↑';
    }
  }

  getTrendClass(): string {
    switch (this.trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      case 'neutral':
        return 'trend-neutral';
      default:
        return 'trend-up';
    }
  }

  getChangeText(): string {
    if (this.change) return this.change;
    
    switch (this.title?.toLowerCase()) {
      case 'total payroll':
        return '+12.5% from last month';
      case 'total bonuses':
        return '+8.2% from last month';
      case 'deductions':
        return '-3.1% from last month';
      case 'employees':
        return '+2 new this month';
      default:
        return 'Updated recently';
    }
  }
}
