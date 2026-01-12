import { ComponentFixture, TestBed } from '@angular/core/testing';

import { News } from './news';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('News', () => {
  let component: News;
  let fixture: ComponentFixture<News>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [News],
       providers: [provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(News);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
