import { LogLevel } from '@prisma/client';

export class CreateAutomationLogDto {
    automationRunId: number;
    level?: LogLevel;
    message: string;
    fileName?: string;
    screenshotPath?: string;
}