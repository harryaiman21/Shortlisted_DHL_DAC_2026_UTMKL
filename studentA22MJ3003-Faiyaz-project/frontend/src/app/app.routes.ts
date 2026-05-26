import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Articles } from './pages/articles/articles';
import { CreateArticle } from './pages/create-article/create-article';
import { ArticleDetails } from './pages/article-details/article-details';
import { AutomationRuns } from './pages/automation-runs/automation-runs';
import { UploadConsole } from './pages/upload-console/upload-console';
import { authGuard } from './services/auth.guard';
import { AdminUsers } from './pages/admin-users/admin-users';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'articles',
    component: Articles,
    canActivate: [authGuard],
  },
  {
    path: 'articles/create',
    component: CreateArticle,
    canActivate: [authGuard],
  },
  {
    path: 'articles/:id',
    component: ArticleDetails,
    canActivate: [authGuard],
  },
  {
    path: 'automation',
    component: AutomationRuns,
    canActivate: [authGuard],
  },
  {
    path: 'upload',
    component: UploadConsole,
    canActivate: [authGuard],
  },
  {
    path: 'admin/users',
    component: AdminUsers,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];