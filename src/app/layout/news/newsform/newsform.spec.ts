import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newsform } from './newsform';

describe('Newsform', () => {
  let component: Newsform;
  let fixture: ComponentFixture<Newsform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newsform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newsform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
