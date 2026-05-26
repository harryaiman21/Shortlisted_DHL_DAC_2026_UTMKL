import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AutomationRun } from '../models/automation.model';
import { API_BASE_URL } from './api';

@Injectable({
    providedIn: 'root',
})
export class AutomationService {
    private apiUrl = `${API_BASE_URL}/automation`;

    constructor(private http: HttpClient) { }

    getRuns() {
        return this.http.get<AutomationRun[]>(`${this.apiUrl}/runs`);
    }

    getRun(id: number) {
        return this.http.get<AutomationRun>(`${this.apiUrl}/runs/${id}`);
    }

    getRunLogs(id: number) {
        return this.http.get(`${this.apiUrl}/runs/${id}/logs`);
    }
}