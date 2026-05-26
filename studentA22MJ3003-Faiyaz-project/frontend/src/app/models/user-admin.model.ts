export type UserRole = 'ADMIN' | 'EDITOR' | 'REVIEWER' | 'RPA_BOT';

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdminUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface UpdateAdminUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
}