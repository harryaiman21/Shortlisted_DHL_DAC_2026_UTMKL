import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUser, UserRole } from '../../models/user-admin.model';
import { UsersAdminService } from '../../services/users-admin.service';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  users: AdminUser[] = [];
  roles: UserRole[] = ['ADMIN', 'EDITOR', 'REVIEWER', 'RPA_BOT'];

  name = '';
  email = '';
  password = '';
  role: UserRole = 'EDITOR';

  editingUserId?: number;
  editName = '';
  editEmail = '';
  editPassword = '';
  editRole: UserRole = 'EDITOR';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private usersAdminService: UsersAdminService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.errorMessage = '';

    this.usersAdminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load users.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  createUser() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Name, email, and password are required.';
      return;
    }

    this.usersAdminService
      .createUser({
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'User account created successfully.';
          this.name = '';
          this.email = '';
          this.password = '';
          this.role = 'EDITOR';
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Failed to create user account.';
          this.cdr.detectChanges();
        },
      });
  }

  startEdit(user: AdminUser) {
    this.editingUserId = user.id;
    this.editName = user.name;
    this.editEmail = user.email;
    this.editRole = user.role;
    this.editPassword = '';
  }

  cancelEdit() {
    this.editingUserId = undefined;
    this.editName = '';
    this.editEmail = '';
    this.editPassword = '';
    this.editRole = 'EDITOR';
  }

  saveEdit(userId: number) {
    this.errorMessage = '';
    this.successMessage = '';

    this.usersAdminService
      .updateUser(userId, {
        name: this.editName,
        email: this.editEmail,
        role: this.editRole,
        password: this.editPassword || undefined,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'User account updated successfully.';
          this.cancelEdit();
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Failed to update user account.';
          this.cdr.detectChanges();
        },
      });
  }

  deleteUser(user: AdminUser) {
    if (!confirm(`Delete user account for ${user.name}?`)) {
      return;
    }

    this.usersAdminService.deleteUser(user.id).subscribe({
      next: () => {
        this.successMessage = 'User account deleted successfully.';
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to delete user account.';
        this.cdr.detectChanges();
      },
    });
  }

  getRoleClass(role: string) {
    return role.toLowerCase().replace('_', '-');
  }
}