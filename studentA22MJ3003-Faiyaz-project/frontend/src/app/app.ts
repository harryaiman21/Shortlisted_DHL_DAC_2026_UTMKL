import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService, LoggedInUser } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('DHL Automation');

  constructor(
    public router: Router,
    public authService: AuthService
  ) { }

  isLoginPage() {
    return this.router.url === '/login';
  }

  get currentUser(): LoggedInUser | null {
    return this.authService.getUser();
  }

  logout() {
    this.authService.logout();
  }

  hasRole(roles: string[]) {
    return this.authService.hasRole(roles);
  }
}