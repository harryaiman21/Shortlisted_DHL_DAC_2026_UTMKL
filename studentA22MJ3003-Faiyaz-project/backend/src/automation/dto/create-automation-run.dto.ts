import { AutomationStatus } from '@prisma/client';

export class CreateAutomationRunDto {
    runById?: number;
    status?: AutomationStatus;
}