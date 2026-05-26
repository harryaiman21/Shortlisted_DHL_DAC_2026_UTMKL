import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE_URL } from './api';

export interface LoggedInUser {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'REVIEWER' | 'RPA_BOT';
}

interface LoginResponse {
    accessToken: string;
    user: LoggedInUser;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private tokenKey = 'dhl_kb_token';
    private userKey = 'dhl_kb_user';

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    login(email: string, password: string) {
        return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
            email,
            password,
        });
    }

    saveSession(response: LoginResponse) {
        sessionStorage.setItem(this.tokenKey, response.accessToken);
        sessionStorage.setItem(this.userKey, JSON.stringify(response.user));
    }

    getToken() {
        return sessionStorage.getItem(this.tokenKey);
    }

    getUser(): LoggedInUser | null {
        const user = sessionStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    logout() {
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userKey);
        this.router.navigate(['/login']);
    }

    hasRole(roles: string[]) {
        const user = this.getUser();
        return !!user && roles.includes(user.role);
    }
}