import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newscontent } from './newscontent';

describe('Newscontent', () => {
  let component: Newscontent;
  let fixture: ComponentFixture<Newscontent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newscontent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newscontent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
