import { UserRole } from '@prisma/client';

export class CreateUserAdminDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}