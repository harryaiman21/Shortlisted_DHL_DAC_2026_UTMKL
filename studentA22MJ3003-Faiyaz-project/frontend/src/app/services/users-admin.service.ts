import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    AdminUser,
    CreateAdminUserDto,
    UpdateAdminUserDto,
} from '../models/user-admin.model';
import { API_BASE_URL } from './api';

@Injectable({
    providedIn: 'root',
})
export class UsersAdminService {
    private apiUrl = `${API_BASE_URL}/users-admin`;

    constructor(private http: HttpClient) { }

    getUsers() {
        return this.http.get<AdminUser[]>(this.apiUrl);
    }

    createUser(data: CreateAdminUserDto) {
        return this.http.post<AdminUser>(this.apiUrl, data);
    }

    updateUser(id: number, data: UpdateAdminUserDto) {
        return this.http.patch<AdminUser>(`${this.apiUrl}/${id}`, data);
    }

    deleteUser(id: number) {
        return this.http.delete<AdminUser>(`${this.apiUrl}/${id}`);
    }
}