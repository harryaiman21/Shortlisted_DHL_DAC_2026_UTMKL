import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';
import { AutomationRun } from '../../models/automation.model';
import { AdminUser } from '../../models/user-admin.model';
import { ArticlesService } from '../../services/articles.service';
import { AutomationService } from '../../services/automation.service';
import { UsersAdminService } from '../../services/users-admin.service';
import { AuthService, LoggedInUser } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  currentUser: LoggedInUser | null = null;

  articles: Article[] = [];
  automationRuns: AutomationRun[] = [];
  users: AdminUser[] = [];

  loading = false;
  errorMessage = '';

  totalArticles = 0;
  draftCount = 0;
  reviewedCount = 0;
  publishedCount = 0;
  archivedCount = 0;
  userCount = 0;

  latestRun?: AutomationRun;
  recentArticles: Article[] = [];

  constructor(
    private articlesService: ArticlesService,
    private automationService: AutomationService,
    private usersAdminService: UsersAdminService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.errorMessage = '';

    this.articlesService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.calculateArticleStats();
        this.loadAutomationRuns();
      },
      error: () => {
        this.errorMessage = 'Failed to load article dashboard data.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    if (this.hasRole(['ADMIN'])) {
      this.usersAdminService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
          this.userCount = users.length;
          this.cdr.detectChanges();
        },
        error: () => {
          // Do not block the dashboard if only user stats fail.
          this.userCount = 0;
          this.cdr.detectChanges();
        },
      });
    }
  }

  loadAutomationRuns() {
    if (!this.hasRole(['ADMIN', 'REVIEWER'])) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.automationService.getRuns().subscribe({
      next: (runs) => {
        this.automationRuns = runs;
        this.latestRun = runs[0];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.automationRuns = [];
        this.latestRun = undefined;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  calculateArticleStats() {
    this.totalArticles = this.articles.length;
    this.draftCount = this.articles.filter((article) => article.status === 'DRAFT').length;
    this.reviewedCount = this.articles.filter((article) => article.status === 'REVIEWED').length;
    this.publishedCount = this.articles.filter((article) => article.status === 'PUBLISHED').length;
    this.archivedCount = this.articles.filter((article) => article.status === 'ARCHIVED').length;

    this.recentArticles = [...this.articles]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }

  hasRole(roles: string[]) {
    return this.authService.hasRole(roles);
  }

  getRoleLabel() {
    if (!this.currentUser) return 'Guest';

    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrator',
      EDITOR: 'Editor',
      REVIEWER: 'Reviewer',
      RPA_BOT: 'RPA Bot',
    };

    return roleLabels[this.currentUser.role] || this.currentUser.role;
  }

  getDashboardMessage() {
    if (!this.currentUser) return 'Welcome to the DHL Knowledge Base Automation Portal.';

    switch (this.currentUser.role) {
      case 'ADMIN':
        return 'Monitor the full knowledge-base workflow, automation performance, and user access control.';
      case 'EDITOR':
        return 'Create, upload, and manage draft knowledge articles for review.';
      case 'REVIEWER':
        return 'Review draft articles, publish approved SOPs, and monitor automation activity.';
      case 'RPA_BOT':
        return 'Automation account used to create draft articles and record RPA processing activity.';
      default:
        return 'Monitor DHL knowledge-base operations.';
    }
  }

  getStatusClass(status: string) {
    return status.toLowerCase().replace('_', '-');
  }
}