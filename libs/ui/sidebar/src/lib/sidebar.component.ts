import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  apps?: string[]; // Which apps should show this item
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
  @Input() currentApp = 'employee'; // Default to employee app
  currentPath = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private route: ActivatedRoute
  ) {
    console.log('Sidebar constructor - currentApp:', this.currentApp);
    console.log('Sidebar constructor - items:', this.items);
  }

  ngOnInit(): void {
    console.log('Sidebar ngOnInit - currentApp:', this.currentApp);
    console.log('Sidebar ngOnInit - items:', this.items);
    this.getCurrentPath();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Filter items based on current app
  get filteredItems(): NavItem[] {
    console.log('Sidebar Debug - currentApp:', this.currentApp);
    console.log('Sidebar Debug - items:', this.items);
    const filtered = this.items.filter(item => 
      !item.apps || item.apps.length === 0 || item.apps.includes(this.currentApp)
    );
    console.log('Sidebar Debug - filteredItems:', filtered);
    return filtered;
  }

  getCurrentPath(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPath = this.router.url;
    });
    // Set initial path
    this.currentPath = this.router.url;
  }

  navigate(item: NavItem): void {
    console.log('Navigating to:', item.path);
    this.router.navigate([item.path]).then(success => {
      console.log('Navigation success:', success);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  isActive(item: NavItem): boolean {
    return this.currentPath.includes(item.path);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      // Clear local storage and navigate to signin
      localStorage.removeItem('authToken');
      this.router.navigate(['/auth/signin']);
    }
  }
}
