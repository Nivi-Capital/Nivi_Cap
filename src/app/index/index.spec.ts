import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { Index } from './index';
import { Main } from '../service/main';
import { provideRouter } from '@angular/router';

describe('Index', () => {
  let component: Index;
  let fixture: ComponentFixture<Index>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Index],
      providers: [provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Index);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
