import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Main } from './main';

describe('Main', () => {
  let service: Main;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        Main
      ]
    });
    service = TestBed.inject(Main);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
