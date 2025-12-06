import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCourse } from './add-edit-course';

describe('AddEditCourse', () => {
  let component: AddEditCourse;
  let fixture: ComponentFixture<AddEditCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
