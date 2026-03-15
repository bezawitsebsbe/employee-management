import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
})
export class SidebarComponent {
  @Input() items: NavItem[] = [];
  currentPath = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.getCurrentPath();
  }

  getCurrentPath() {
    this.router.events.subscribe(() => {
      this.currentPath = this.router.url;
    });
    // Set initial path
    this.currentPath = this.router.url;
  }

  navigate(item: NavItem) {
    this.router.navigate([item.path]);
  }

  isActive(item: NavItem): boolean {
    return this.currentPath.includes(item.path);
  }
}
