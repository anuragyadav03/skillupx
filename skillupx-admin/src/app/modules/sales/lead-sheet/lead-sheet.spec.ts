import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadSheet } from './lead-sheet';

describe('LeadSheet', () => {
  let component: LeadSheet;
  let fixture: ComponentFixture<LeadSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
