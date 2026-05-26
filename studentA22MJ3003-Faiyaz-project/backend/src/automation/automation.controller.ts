import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AutomationService } from './automation.service';
import { CreateAutomationRunDto } from './dto/create-automation-run.dto';
import { UpdateAutomationRunDto } from './dto/update-automation-run.dto';
import { CreateAutomationLogDto } from './dto/create-automation-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('automation')
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    @Post('runs')
    @Roles(UserRole.ADMIN, UserRole.RPA_BOT)
    createRun(@Body() body: CreateAutomationRunDto) {
        return this.automationService.createRun(body);
    }

    @Get('runs')
    @Roles(UserRole.ADMIN, UserRole.REVIEWER)
    findAllRuns() {
        return this.automationService.findAllRuns();
    }

    @Get('runs/:id')
    @Roles(UserRole.ADMIN, UserRole.REVIEWER)
    findRunById(@Param('id') id: string) {
        return this.automationService.findRunById(Number(id));
    }

    @Patch('runs/:id')
    @Roles(UserRole.ADMIN, UserRole.RPA_BOT)
    updateRun(@Param('id') id: string, @Body() body: UpdateAutomationRunDto) {
        return this.automationService.updateRun(Number(id), body);
    }

    @Post('logs')
    @Roles(UserRole.ADMIN, UserRole.RPA_BOT)
    createLog(@Body() body: CreateAutomationLogDto) {
        return this.automationService.createLog(body);
    }

    @Get('runs/:id/logs')
    @Roles(UserRole.ADMIN, UserRole.REVIEWER)
    findLogsByRun(@Param('id') id: string) {
        return this.automationService.findLogsByRun(Number(id));
    }
}