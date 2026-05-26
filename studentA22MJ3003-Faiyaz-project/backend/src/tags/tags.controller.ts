import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER)
    findAll() {
        return this.tagsService.findAll();
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() body: { name: string }) {
        return this.tagsService.create(body.name);
    }
}