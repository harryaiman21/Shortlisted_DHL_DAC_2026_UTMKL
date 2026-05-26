import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomationRun } from '../../models/automation.model';
import { AutomationService } from '../../services/automation.service';

@Component({
  selector: 'app-automation-runs',
  imports: [CommonModule],
  templateUrl: './automation-runs.html',
  styleUrl: './automation-runs.scss',
})
export class AutomationRuns implements OnInit {
  runs: AutomationRun[] = [];
  selectedRun?: AutomationRun;

  loading = false;
  errorMessage = '';

  constructor(
    private automationService: AutomationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadRuns();
  }

  loadRuns() {
    this.loading = true;
    this.errorMessage = '';

    this.automationService.getRuns().subscribe({
      next: (runs) => {
        this.runs = runs;
        this.selectedRun = runs[0];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load automation runs.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectRun(run: AutomationRun) {
    this.selectedRun = run;
  }

  getStatusClass(status: string) {
    return status.toLowerCase().replace('_', '-');
  }

  getTotalProcessed(run: AutomationRun) {
    return (
      run.totalCreated +
      run.totalUpdated +
      run.totalDuplicates +
      run.totalFailed
    );
  }
}