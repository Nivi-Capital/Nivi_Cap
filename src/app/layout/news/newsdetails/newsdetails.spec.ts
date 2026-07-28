import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newsdetails } from './newsdetails';

describe('Newsdetails', () => {
  let component: Newsdetails;
  let fixture: ComponentFixture<Newsdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newsdetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newsdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
