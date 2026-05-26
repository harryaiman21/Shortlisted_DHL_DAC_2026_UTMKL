import { AutomationStatus } from '@prisma/client';

export class UpdateAutomationRunDto {
    status?: AutomationStatus;
    totalScanned?: number;
    totalCreated?: number;
    totalUpdated?: number;
    totalDuplicates?: number;
    totalFailed?: number;
    summaryEmailSent?: boolean;
}
