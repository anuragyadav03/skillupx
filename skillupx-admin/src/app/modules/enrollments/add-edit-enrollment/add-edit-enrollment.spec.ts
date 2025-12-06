import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEnrollment } from './add-edit-enrollment';

describe('AddEditEnrollment', () => {
  let component: AddEditEnrollment;
  let fixture: ComponentFixture<AddEditEnrollment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditEnrollment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditEnrollment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
