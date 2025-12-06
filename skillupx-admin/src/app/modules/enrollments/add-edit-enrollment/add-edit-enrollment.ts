import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { debounceTime, filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { EnrollmentService } from '../services/enrollment-service';
import { CourseService } from '../../courses/services/course-service';
import { InstructorService } from '../../instructors/services/instructor-service';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-add-edit-enrollment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // Material
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './add-edit-enrollment.html',
  styleUrls: ['./add-edit-enrollment.scss']
})
export class AddEditEnrollment implements OnInit {
  form!: FormGroup;

  mode: 'add' | 'edit' = 'add';
  id?: number;

  courses: any[] = [];
  instructors: any[] = [];
  searchResults: any[] = [];
  searching = false;
  loading = false;
  saving = false;
  studentPanelOpen = false;

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize the form early so template rendering won't error
    this.form = this.fb.group({
      course_id: [null, Validators.required],
      instructor_id: [null],
      student_id: [null],
      student_search: [''],
      student_name: ['', Validators.required],
      student_email: [''],
      student_phone: [''],
      enrollment_type: ['paid'],
      enrollment_duration: ['30 days'],
      metadata: [null]
    });
  }

  ngOnInit(): void {
    this.loadLists();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId && paramId !== 'new') {
      this.id = Number(paramId);
      this.mode = 'edit';
      this.loadEnrollment(this.id);
    }

    // Autocomplete / search
    this.studentSearch.valueChanges.pipe(
      map((v: string | null) => (v ?? '').toString()),
      debounceTime(300),
      tap(() => { this.searching = true; this.searchResults = []; }),
      switchMap((q: string) =>
        // map API response shape { users: [...] } -> array
        this.commonService.searchUsers(q.trim()).pipe(
          map((res: any) => res ?? []),
          finalize(() => this.searching = false)
        )
      )
    ).subscribe({
      next: (users) => {
        this.searchResults = users;
        console.log('autocomplete users ->', users);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('search error', err);
        this.searchResults = [];
        this.searching = false;
      }
    });
  }

  // convenience getter
  get studentSearch() {
    return this.form.get('student_search')!;
  }

  private loadLists() {
    this.courseService.listCourses().subscribe({ next: (r: any) => { this.courses = r.courses ?? []; this.cdr.detectChanges(); }, error: console.error });
    this.instructorService.getAllInstructors().subscribe({ next: (r: any) => { this.instructors = r.instructors ?? []; this.cdr.detectChanges(); }, error: console.error });
  }

  private loadEnrollment(id: number) {
    this.loading = true;
    this.enrollmentService.get(id).subscribe({
      next: (res: any) => {
        const e = res.enrollment;
        this.form.patchValue({
          course_id: e.course_id,
          instructor_id: e.instructor_id,
          enrollment_type: e.enrollment_type,
          enrollment_duration: e.enrollment_duration,
          metadata: e.metadata || null
        });
        if (res.student) {
          this.setStudentFields(res.student);
          this.studentPanelOpen = false;
        }
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  displayUser(u: any) {
    return u ? `${u.name} (${u.email ?? u.phone ?? ''})` : '';
  }

  onOptionSelected(user: any) {
    if (!user) return;
    this.setStudentFields(user);
    this.studentPanelOpen = false;
  }

  private setStudentFields(user: any) {
    this.form.patchValue({
      student_id: user.id,
      student_name: user.name || '',
      student_email: user.email || '',
      student_phone: user.phone || ''
    });
    // Make name required satisfied
    this.form.get('student_name')!.markAsUntouched();
  }

  clearStudent() {
    this.form.patchValue({
      student_id: null,
      student_name: '',
      student_email: '',
      student_phone: ''
    });
    this.form.get('student_name')!.markAsTouched();
    this.studentPanelOpen = true;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.form.value.course_id) { alert('Please choose a course'); return; }

    this.saving = true;

    const payload: any = {
      course_id: Number(this.form.value.course_id),
      instructor_id: this.form.value.instructor_id ? Number(this.form.value.instructor_id) : null,
      enrollment_type: this.form.value.enrollment_type,
      enrollment_duration: this.form.value.enrollment_duration,
      metadata: this.form.value.metadata
    };

    if (this.form.value.student_id) {
      payload.student_id = Number(this.form.value.student_id);
    } else {
      payload.student_name = this.form.value.student_name;
      if (this.form.value.student_email) payload.student_email = this.form.value.student_email;
      if (this.form.value.student_phone) payload.student_phone = this.form.value.student_phone;
    }

    const obs = (this.mode === 'edit' && this.id)
      ? this.enrollmentService.update(this.id, payload)
      : this.enrollmentService.create(payload);

    obs.subscribe({
      next: () => { this.saving = false; this.router.navigate(['/enrollments']); },
      error: (err) => { console.error(err); this.saving = false; alert('Failed to save enrollment'); }
    });
  }

  cancel() {
    this.router.navigate(['/enrollments']);
  }

  // trackBy for ngFor performance
  trackById(index: number, item: any) {
    return item?.id ?? index;
  }
}
