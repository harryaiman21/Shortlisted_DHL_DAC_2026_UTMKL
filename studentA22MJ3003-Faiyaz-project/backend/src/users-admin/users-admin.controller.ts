import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersAdminService } from './users-admin.service';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users-admin')
export class UsersAdminController {
    constructor(private readonly usersAdminService: UsersAdminService) { }

    @Get()
    findAll() {
        return this.usersAdminService.findAll();
    }

    @Post()
    create(@Body() body: CreateUserAdminDto) {
        return this.usersAdminService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateUserAdminDto) {
        return this.usersAdminService.update(Number(id), body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersAdminService.remove(Number(id));
    }
}