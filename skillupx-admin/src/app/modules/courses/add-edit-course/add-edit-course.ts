import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Course, CourseService } from '../services/course-service';
import { InstructorService } from '../../instructors/services/instructor-service';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-edit-course.html'
})
export class AddEditCourse implements OnInit {
  form!: FormGroup;
  id?: number;
  loading = false;
  instructors: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cs: CourseService,
    private isvc: InstructorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      short_description: [''],
      long_description: [''],
      instructor_id: [null],
      price: [0],
      currency: ['USD'],
      is_published: [false]
    });

    this.route.paramMap.subscribe((p) => {
      const id = p.get('id');
      if (id && id !== 'new') {
        this.id = Number(id);
        this.load();
      }
    });

    // load instructors for select
    this.isvc.getAllInstructors().subscribe((res) => (this.instructors = res.instructors || []));
  }

  load() {
    if (!this.id) return;
    this.loading = true;
    this.cs.getCourse(this.id).subscribe({
      next: (res) => {
        this.form.patchValue(res.course);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value as Partial<Course>;
    if (this.id) {
      this.cs.updateCourse(this.id, payload).subscribe({
        next: () => this.router.navigate(['/courses']),
        error: (err) => console.error(err)
      });
    } else {
      this.cs.createCourse(payload).subscribe({
        next: () => this.router.navigate(['/courses']),
        error: (err) => console.error(err)
      });
    }
  }

  cancel() {
    this.router.navigate(['/courses']);
  }
}
