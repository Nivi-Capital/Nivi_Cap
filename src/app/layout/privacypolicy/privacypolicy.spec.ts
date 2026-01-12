import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Privacypolicy } from './privacypolicy';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('Privacypolicy', () => {
  let component: Privacypolicy;
  let fixture: ComponentFixture<Privacypolicy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacypolicy],
       providers: [provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Privacypolicy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
