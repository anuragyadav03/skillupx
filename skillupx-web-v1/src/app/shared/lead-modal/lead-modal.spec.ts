import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadModal } from './lead-modal';

describe('LeadModal', () => {
  let component: LeadModal;
  let fixture: ComponentFixture<LeadModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
