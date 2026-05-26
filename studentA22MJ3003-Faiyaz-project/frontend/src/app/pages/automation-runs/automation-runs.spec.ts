import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationRuns } from './automation-runs';

describe('AutomationRuns', () => {
  let component: AutomationRuns;
  let fixture: ComponentFixture<AutomationRuns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationRuns],
    }).compileComponents();

    fixture = TestBed.createComponent(AutomationRuns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
