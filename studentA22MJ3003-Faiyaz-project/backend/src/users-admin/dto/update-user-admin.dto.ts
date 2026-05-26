import { UserRole } from '@prisma/client';

export class UpdateUserAdminDto {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
}