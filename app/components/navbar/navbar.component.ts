import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isLoggedIn = false;
  isMenuOpen = false;
  userName = '';

  constructor(public auth: AuthService, private router: Router) {
    this.auth.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        const user = this.auth.getCurrentUser();
        this.userName = user?.name || 'User';
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}