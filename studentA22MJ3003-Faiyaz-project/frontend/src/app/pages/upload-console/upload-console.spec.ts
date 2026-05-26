import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { UploadConsole } from './upload-console';
import { TagsService } from '../../services/tags.service';

describe('UploadConsole', () => {
  let component: UploadConsole;
  let fixture: ComponentFixture<UploadConsole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadConsole],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: TagsService,
          useValue: { getTags: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadConsole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
