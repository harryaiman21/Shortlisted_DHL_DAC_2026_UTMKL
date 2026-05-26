export type AutomationStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR';

export interface AutomationUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface AutomationLog {
    id: number;
    automationRunId: number;
    level: LogLevel;
    message: string;
    fileName?: string;
    screenshotPath?: string;
    createdAt: string;
}

export interface AutomationRun {
    id: number;
    runById?: number;
    status: AutomationStatus;
    totalScanned: number;
    totalCreated: number;
    totalUpdated: number;
    totalDuplicates: number;
    totalFailed: number;
    startedAt: string;
    finishedAt?: string;
    summaryEmailSent: boolean;
    runBy?: AutomationUser;
    logs?: AutomationLog[];
}