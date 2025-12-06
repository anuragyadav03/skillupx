import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditInstructor } from './add-edit-instructor';

describe('AddEditInstructor', () => {
  let component: AddEditInstructor;
  let fixture: ComponentFixture<AddEditInstructor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditInstructor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditInstructor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
