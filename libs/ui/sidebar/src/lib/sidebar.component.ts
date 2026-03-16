import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@employee-payroll/features';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() items: NavItem[] = [];
  currentPath = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentPath();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentPath(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPath = this.router.url;
    });
    // Set initial path
    this.currentPath = this.router.url;
  }

  navigate(item: NavItem): void {
    this.router.navigate([item.path]);
  }

  isActive(item: NavItem): boolean {
    return this.currentPath.includes(item.path);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/auth/signin']);
    }
  }
}
