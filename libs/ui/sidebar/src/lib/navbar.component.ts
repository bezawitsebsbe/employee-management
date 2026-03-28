import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

interface User {
  name: string;
  email?: string;
  avatar?: string;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  apps?: string[]; // Which apps should show this item
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  navItems: NavItem[] = [];
  user = {
    name: 'John Doe' // later replace with auth service
  };

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.data.subscribe(data => {
      this.navItems = data['navItems'] || [];
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/auth/signin';
  }

  // Get user initials for avatar
  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return this.user.name.charAt(0);
  }

  // Check if current route is active
  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
