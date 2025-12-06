// src/app/courses/add-lesson/add-lesson.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CourseService } from '../services/course-service';

@Component({
  selector: 'app-add-lesson',
  standalone: true,
  templateUrl: './add-lesson.html',
  styleUrls: ['./add-lesson.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class AddLesson {
  form!: FormGroup;
  saving = false;
  courseId!: number;
  lessonId?: number;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private cs: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      summary: [''],
      slug: [''],
      order_number: [0],
      duration_seconds: [0]
    });
    
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.lessonId = Number(this.route.snapshot.paramMap.get('lesson'));

    if (this.lessonId) {
      this.isEdit = true;
      this.loadLesson();
    }
  }

  loadLesson() {
    this.cs.getLesson(this.lessonId!).subscribe({
      next: (res: any) => {
        this.form.patchValue(res.lesson);
      },
      error: () => alert('Failed to load lesson')
    });
  }

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.saving = true;

    const payload = {
      ...this.form.value,
      course_id: this.courseId
    };

    const req$ = this.isEdit
      ? this.cs.updateLesson(this.lessonId!, payload)
      : this.cs.createLesson(payload);

    req$.subscribe({
      next: () => {
        this.router.navigate(['/courses', this.courseId], { queryParams: { refresh: '1' } });
      },
      error: (err: any) => {
        console.error(err);
        alert('Failed to save lesson');
        this.saving = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/courses', this.courseId]);
  }
}
