import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationRunDto } from './dto/create-automation-run.dto';
import { UpdateAutomationRunDto } from './dto/update-automation-run.dto';
import { CreateAutomationLogDto } from './dto/create-automation-log.dto';

@Injectable()
export class AutomationService {
    constructor(private prisma: PrismaService) { }

    createRun(dto: CreateAutomationRunDto) {
        return this.prisma.automationRun.create({
            data: {
                runById: dto.runById,
                status: dto.status || 'RUNNING',
            },
            include: {
                runBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                logs: true,
            },
        });
    }

    findAllRuns() {
        return this.prisma.automationRun.findMany({
            include: {
                runBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                logs: true,
            },
            orderBy: {
                startedAt: 'desc',
            },
        });
    }

    async findRunById(id: number) {
        const run = await this.prisma.automationRun.findUnique({
            where: { id },
            include: {
                runBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                logs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!run) {
            throw new NotFoundException('Automation run not found');
        }

        return run;
    }

    async updateRun(id: number, dto: UpdateAutomationRunDto) {
        await this.findRunById(id);

        return this.prisma.automationRun.update({
            where: { id },
            data: {
                status: dto.status,
                totalScanned: dto.totalScanned,
                totalCreated: dto.totalCreated,
                totalUpdated: dto.totalUpdated,
                totalDuplicates: dto.totalDuplicates,
                totalFailed: dto.totalFailed,
                summaryEmailSent: dto.summaryEmailSent,
                finishedAt:
                    dto.status === 'SUCCESS' ||
                        dto.status === 'FAILED' ||
                        dto.status === 'PARTIAL_SUCCESS'
                        ? new Date()
                        : undefined,
            },
        });
    }

    async createLog(dto: CreateAutomationLogDto) {
        await this.findRunById(dto.automationRunId);

        return this.prisma.automationLog.create({
            data: {
                automationRunId: dto.automationRunId,
                level: dto.level || 'INFO',
                message: dto.message,
                fileName: dto.fileName,
                screenshotPath: dto.screenshotPath,
            },
        });
    }

    findLogsByRun(runId: number) {
        return this.prisma.automationLog.findMany({
            where: {
                automationRunId: runId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}