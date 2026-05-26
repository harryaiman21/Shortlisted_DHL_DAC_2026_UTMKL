import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleDetails } from './article-details';

describe('ArticleDetails', () => {
  let component: ArticleDetails;
  let fixture: ComponentFixture<ArticleDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
